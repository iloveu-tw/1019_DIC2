"""50 Startups：單檔完成 CRISP-DM 六階段及四種特徵選擇實驗。"""
from __future__ import annotations

import json
from datetime import datetime
from itertools import combinations
from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.feature_selection import RFE, RFECV
from sklearn.linear_model import LassoCV, LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent
# 可以將本程式放於專案根目錄，或放在 src/ 目錄下。
if ROOT.name == "src":
    ROOT = ROOT.parent
DATA_PATH = ROOT / "data" / "50_Startups.csv"
OUTPUT = ROOT / "results" / "CRISP_DM_ALL_IN_ONE"
FEATURES = ["R&D Spend", "Administration", "Marketing Spend", "State_Florida", "State_New York"]
RAW_COLUMNS = ["R&D Spend", "Administration", "Marketing Spend", "State", "Profit"]
RANDOM_STATE = 0


def acquire_dataset() -> tuple[pd.DataFrame, str]:
    """P2：優先使用本地資料；不存在時才下載 Kaggle，且不覆寫原檔。"""
    if not DATA_PATH.exists():
        try:
            import kagglehub
        except ImportError as exc:
            raise RuntimeError("找不到 CSV。請將 50_Startups.csv 放到 data/，或安裝 kagglehub。") from exc
        # Kaggle 資料集的 slug 可因上傳者不同而異；此處集中設定方便核對。
        dataset_dir = Path(kagglehub.dataset_download("anithabalakrishna/50-startups"))
        candidates = sorted(dataset_dir.rglob("*.csv"))
        chosen = None
        for candidate in candidates:
            if set(RAW_COLUMNS).issubset(pd.read_csv(candidate, nrows=1).columns):
                chosen = candidate
                break
        if chosen is None:
            raise RuntimeError("Kaggle 下載完成，但找不到具備必要欄位的 CSV。")
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        DATA_PATH.write_bytes(chosen.read_bytes())
    df = pd.read_csv(DATA_PATH)
    return df, str(DATA_PATH)


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """P3：以固定的州別對照編碼，避免每個驗證折產生不同欄位。"""
    x = df[["R&D Spend", "Administration", "Marketing Spend"]].copy()
    x["State_Florida"] = (df["State"] == "Florida").astype(int)
    x["State_New York"] = (df["State"] == "New York").astype(int)
    return x[FEATURES].astype(float)


def ols():
    """以標準化 + OLS 估計；標準化只對當次 fit 所見資料學習參數。"""
    return make_pipeline(StandardScaler(), LinearRegression())


def cv_rmse(x, y, columns, cv):
    """使用內層交叉驗證計算特徵子集的平均 RMSE。"""
    return float((-cross_val_score(ols(), x[list(columns)], y, cv=cv,
                                   scoring="neg_root_mean_squared_error")).mean())


def choose_features(method, x, y):
    """全部選擇過程僅使用傳入的訓練折，防止資料洩漏。"""
    inner = KFold(n_splits=3, shuffle=True, random_state=RANDOM_STATE)
    if method == "Exhaustive":
        # 5 個編碼特徵總共 31 個非空子集，完整搜尋。
        options = (group for size in range(1, len(FEATURES) + 1)
                   for group in combinations(FEATURES, size))
        return list(min(options, key=lambda cols: (cv_rmse(x, y, cols, inner), len(cols))))
    if method == "Forward SFS":
        # 依照 CV RMSE 逐步新增一項特徵，再從所有前向路徑選出最佳數量。
        picked, candidates = [], []
        while len(picked) < len(FEATURES):
            next_col = min((c for c in FEATURES if c not in picked),
                           key=lambda c: cv_rmse(x, y, picked + [c], inner))
            picked.append(next_col)
            candidates.append((cv_rmse(x, y, picked, inner), picked.copy()))
        return min(candidates, key=lambda pair: pair[0])[1]
    if method == "RFECV":
        # 特徵選擇器置於標準化後，避免原始量尺影響係數比較。
        model = make_pipeline(StandardScaler(), RFECV(
            estimator=LinearRegression(), cv=inner, scoring="neg_root_mean_squared_error"))
        model.fit(x, y)
        mask = model.named_steps["rfecv"].support_
        return [name for name, selected in zip(FEATURES, mask) if selected]
    if method == "LassoCV":
        # L1 正則化以訓練折內部的 CV 決定 alpha，再擷取非零係數。
        model = make_pipeline(StandardScaler(), LassoCV(
            cv=inner, random_state=RANDOM_STATE, max_iter=50000))
        model.fit(x, y)
        coef = model.named_steps["lassocv"].coef_
        chosen = [name for name, value in zip(FEATURES, coef) if abs(value) > 1e-7]
        # 防止極端情況：Lasso 全部係數為零時仍至少保留一個特徵。
        return chosen or [FEATURES[int(np.argmax(np.abs(coef)))]]
    raise ValueError(f"未知特徵選擇方法：{method}")


def evaluate(y_true, y_pred):
    mse = float(mean_squared_error(y_true, y_pred))
    return {"MAE": float(mean_absolute_error(y_true, y_pred)),
            "MSE": mse, "RMSE": float(np.sqrt(mse)),
            "R2": float(r2_score(y_true, y_pred))}


def plot_feature_count_comparison(x_train, y_train):
    """以訓練資料的 5-Fold CV 比較 1～5 個特徵，產生可供日後網站展示的圖表及表格。"""
    cv = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    rows = []
    for count in range(1, len(FEATURES) + 1):
        candidates = []
        for cols in combinations(FEATURES, count):
            # 每個候選組合使用相同的交叉驗證折數及分數計算方式。
            model = ols()
            rmse = -cross_val_score(model, x_train[list(cols)], y_train,
                                    cv=cv, scoring="neg_root_mean_squared_error")
            r2 = cross_val_score(model, x_train[list(cols)], y_train,
                                 cv=cv, scoring="r2")
            candidates.append((float(rmse.mean()), cols, float(r2.mean()),
                               float(rmse.std())))
        best_rmse, best_cols, best_r2, rmse_std = min(candidates, key=lambda v: v[0])
        rows.append({"number_of_features": count,
                     "selected_features": ", ".join(best_cols),
                     "cv_rmse_mean": best_rmse, "cv_rmse_std": rmse_std,
                     "cv_r2_mean": best_r2})

    table = pd.DataFrame(rows)
    table.to_csv(OUTPUT / "P5_feature_count_comparison.csv", index=False, encoding="utf-8-sig")

    # 圖表一：將 RMSE、R² 以及特徵組合比較表整合成單張 PNG。
    fig = plt.figure(figsize=(17, 10), layout="constrained")
    fig.suptitle("Feature Count Performance — Exhaustive Search", fontsize=17, fontweight="bold")
    grid = fig.add_gridspec(2, 2, height_ratios=[2.5, 1.6])
    axes = [fig.add_subplot(grid[0, 0]), fig.add_subplot(grid[0, 1])]
    count = table["number_of_features"].to_numpy()
    for ax, key, title, ylabel in [
        (axes[0], "cv_rmse_mean", "RMSE by Number of Features", "CV RMSE"),
        (axes[1], "cv_r2_mean", "R-squared by Number of Features", "CV R-squared"),
    ]:
        ax.plot(count, table[key], marker="o", linewidth=2)
        ax.set(title=title, xlabel="Number of Features", ylabel=ylabel)
        ax.set_xticks(count)
        ax.grid(alpha=0.25)
    table_ax = fig.add_subplot(grid[1, :])
    table_ax.axis("off")
    labels = ["Number of Features", "Selected Features", "CV RMSE", "CV R-squared"]
    cells = [[str(int(r.number_of_features)), r.selected_features,
              f"{r.cv_rmse_mean:,.2f}", f"{r.cv_r2_mean:.6f}"]
             for r in table.itertuples(index=False)]
    artist = table_ax.table(cellText=cells, colLabels=labels, cellLoc="left",
                            colLoc="left", loc="center",
                            colWidths=[0.15, 0.49, 0.18, 0.18])
    artist.auto_set_font_size(False)
    artist.set_fontsize(10)
    artist.scale(1, 1.7)
    for (row, _), cell in artist.get_celld().items():
        if row == 0:
            cell.set_text_props(weight="bold")
        elif row % 2 == 0:
            cell.set_facecolor("#f4f4f4")
    fig.savefig(OUTPUT / "P5_feature_count_dashboard.png", dpi=170, bbox_inches="tight")
    plt.close(fig)

    # 圖表二：獨立 PNG，利於後續 GitHub Pages 依版面分開顯示。
    for key, name, ylabel in [
        ("cv_rmse_mean", "P5_feature_count_rmse.png", "CV RMSE"),
        ("cv_r2_mean", "P5_feature_count_r2.png", "CV R-squared"),
    ]:
        fig, ax = plt.subplots(figsize=(7, 4.5))
        ax.plot(count, table[key], marker="o")
        ax.set(xlabel="Number of Features", ylabel=ylabel)
        ax.set_xticks(count)
        ax.grid(alpha=0.25)
        fig.tight_layout()
        fig.savefig(OUTPUT / name, dpi=170)
        plt.close(fig)
    return table



def plot_method_feature_count_comparison(x_train, y_train):
    """新增四演算法各 1～5 個特徵的探索性趨勢圖，方便將來於 GitHub Pages 展示。

    注意：此圖於全部訓練資料決定特徵組合，再用相同資料做 CV 評分；
    僅供分析與視覺比較，可能偏樂觀。正式方法比較以外層 CV 為準。
    """
    cv = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cached = {}

    def score(cols):
        key = tuple(sorted(cols))
        if key not in cached:
            model = ols()
            scores = -cross_val_score(model, x_train[list(key)], y_train, cv=cv,
                                      scoring="neg_root_mean_squared_error")
            r2 = cross_val_score(model, x_train[list(key)], y_train, cv=cv,
                                 scoring="r2")
            cached[key] = (float(scores.mean()), float(r2.mean()))
        return cached[key]

    # Forward SFS：依序選出每一步的最佳新增特徵，保留完整的前向路徑。
    forward = []
    for _ in FEATURES:
        remaining = [f for f in FEATURES if f not in forward]
        forward.append(min(remaining, key=lambda f: score(forward + [f])[0]))

    # Lasso：以標準化後的非零係數優先排序；k=1～5 包含零係數候選，
    # 此處是「依 Lasso 係數排序選前 k 項」，不是宣稱 Lasso 原生固定選 k 項。
    lasso = make_pipeline(StandardScaler(), LassoCV(
        cv=5, random_state=RANDOM_STATE, max_iter=50000)).fit(x_train, y_train)
    weights = np.abs(lasso.named_steps["lassocv"].coef_)
    lasso_order = sorted(FEATURES, key=lambda f: (-weights[FEATURES.index(f)], FEATURES.index(f)))

    rows = []
    for k in range(1, len(FEATURES) + 1):
        # Exhaustive：對每個 k 搜尋所有可能組合。
        exhaustive = list(min(combinations(FEATURES, k), key=lambda cols: score(cols)[0]))

        # RFE：先在訓練集標準化，再以線性係數排序選取 k 項。
        scaled = StandardScaler().fit_transform(x_train)
        rfe = RFE(LinearRegression(), n_features_to_select=k).fit(scaled, y_train)
        rfe_cols = [f for f, keep in zip(FEATURES, rfe.support_) if keep]

        choices = {
            "Exhaustive": exhaustive,
            "Forward SFS": forward[:k],
            "RFE ranking": rfe_cols,
            "Lasso L1 ranking": lasso_order[:k],
        }
        for method, cols in choices.items():
            rmse, r2 = score(cols)
            rows.append({"method": method, "number_of_features": k,
                         "selected_features": ", ".join(cols),
                         "cv_rmse_mean": rmse, "cv_r2_mean": r2})

    table = pd.DataFrame(rows)
    table.to_csv(OUTPUT / "P5_four_methods_feature_count.csv", index=False,
                 encoding="utf-8-sig")

    # 四種演算法：兩張比較圖 + 下方完整結果表格，與使用者的範例版型一致。
    fig = plt.figure(figsize=(18, 13), layout="constrained")
    fig.suptitle("Feature Selection Methods — Performance by Feature Count",
                 fontsize=17, fontweight="bold")
    grid = fig.add_gridspec(2, 2, height_ratios=[2.1, 2.25])
    axes = [fig.add_subplot(grid[0, 0]), fig.add_subplot(grid[0, 1])]
    for method, group in table.groupby("method", sort=False):
        group = group.sort_values("number_of_features")
        for ax, metric in zip(axes, ["cv_rmse_mean", "cv_r2_mean"]):
            ax.plot(group["number_of_features"], group[metric],
                    marker="o", linewidth=2, label=method)
    for ax, title, ylabel in [
        (axes[0], "RMSE Comparison across 4 Methods", "CV RMSE (lower is better)"),
        (axes[1], "R-squared Comparison across 4 Methods", "CV R-squared (higher is better)"),
    ]:
        ax.set(title=title, xlabel="Number of Features", ylabel=ylabel)
        ax.set_xticks(range(1, len(FEATURES) + 1))
        ax.grid(alpha=0.25)
        ax.legend(fontsize=8)
    table_ax = fig.add_subplot(grid[1, :])
    table_ax.axis("off")
    formatted = [[r.method, str(int(r.number_of_features)), r.selected_features,
                  f"{r.cv_rmse_mean:,.2f}", f"{r.cv_r2_mean:.6f}"]
                 for r in table.itertuples(index=False)]
    artist = table_ax.table(
        cellText=formatted,
        colLabels=["Method", "Features", "Selected Features", "CV RMSE", "CV R-squared"],
        cellLoc="left", colLoc="left", loc="center",
        colWidths=[0.15, 0.07, 0.49, 0.15, 0.14])
    artist.auto_set_font_size(False)
    artist.set_fontsize(8.4)
    artist.scale(1, 1.22)
    for (row, _), cell in artist.get_celld().items():
        if row == 0:
            cell.set_text_props(weight="bold")
        elif row % 2 == 0:
            cell.set_facecolor("#f2f4f7")
    fig.savefig(OUTPUT / "P5_four_methods_feature_count.png", dpi=180,
                bbox_inches="tight")
    plt.close(fig)
    return table


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)

    # P1 — 商業理解：目標是使用公司支出與州別預測 Profit。
    project_info = {"problem": "Predict startup Profit by multiple linear regression",
                    "target": "Profit", "approach": "CRISP-DM", "date": datetime.now().isoformat()}

    # P2 — 資料取得、品質檢查及 EDA：保存結果，不修改原始 CSV。
    df, data_source = acquire_dataset()
    if not set(RAW_COLUMNS).issubset(df.columns):
        raise ValueError(f"資料欄位不完整：{set(RAW_COLUMNS) - set(df.columns)}")
    df = df[RAW_COLUMNS].copy()
    numeric = ["R&D Spend", "Administration", "Marketing Spend", "Profit"]
    for col in numeric:
        df[col] = pd.to_numeric(df[col], errors="raise")
    if df.isna().any().any() or df.duplicated().any():
        raise ValueError("發現缺失值或完全重複資料，請先人工檢核再繼續。")
    if not df["State"].isin(["California", "Florida", "New York"]).all():
        raise ValueError("存在未知 State 類別；目前的固定編碼僅支援三個州。")
    df.describe(include="all").to_csv(OUTPUT / "P2_data_summary.csv", encoding="utf-8-sig")
    df[numeric].corr().to_csv(OUTPUT / "P2_correlation.csv", encoding="utf-8-sig")
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    for ax, col in zip(axes, numeric[:3]):
        ax.scatter(df[col], df["Profit"], alpha=0.8)
        ax.set(xlabel=col, ylabel="Profit", title=f"{col} vs Profit")
    fig.tight_layout()
    fig.savefig(OUTPUT / "P2_feature_scatter.png", dpi=160)
    plt.close(fig)

    # P3 — 固定原始列索引、80/20 切分；測試集不參與選特徵。
    x, y = prepare_features(df), df["Profit"].astype(float)
    row_ids = np.arange(len(df))
    train_idx, test_idx = train_test_split(row_ids, test_size=0.2,
                                           random_state=RANDOM_STATE)
    x_train, x_test = x.iloc[train_idx], x.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    assert not set(train_idx).intersection(test_idx)
    pd.DataFrame({"original_row_index": train_idx}).to_csv(
        OUTPUT / "P3_train_indices.csv", index=False)
    pd.DataFrame({"original_row_index": test_idx}).to_csv(
        OUTPUT / "P3_test_indices.csv", index=False)

    # P5 補充圖表：1～5 特徵子集比較，僅供探索性展示；不能視為獨立測試集指標。
    feature_count_table = plot_feature_count_comparison(x_train, y_train)
    method_feature_table = plot_method_feature_count_comparison(x_train, y_train)

    # P4 / P5 — 四種方法採外層 5-Fold CV；每一外層折內再獨立選特徵。
    methods = ["Exhaustive", "Forward SFS", "RFECV", "LassoCV"]
    outer = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    fold_rows, comparison = [], []
    for method in methods:
        fold_rmse, fold_r2 = [], []
        for fold, (fit_pos, valid_pos) in enumerate(outer.split(x_train), start=1):
            fit_x, valid_x = x_train.iloc[fit_pos], x_train.iloc[valid_pos]
            fit_y, valid_y = y_train.iloc[fit_pos], y_train.iloc[valid_pos]
            selected = choose_features(method, fit_x, fit_y)
            reg = ols().fit(fit_x[selected], fit_y)
            predicted = reg.predict(valid_x[selected])
            score = evaluate(valid_y, predicted)
            fold_rmse.append(score["RMSE"])
            fold_r2.append(score["R2"])
            fold_rows.append({"method": method, "fold": fold,
                              "selected_features": ", ".join(selected), **score})
        comparison.append({"method": method, "cv_rmse_mean": float(np.mean(fold_rmse)),
                           "cv_rmse_std": float(np.std(fold_rmse)),
                           "cv_r2_mean": float(np.mean(fold_r2))})

    result = pd.DataFrame(comparison).sort_values("cv_rmse_mean").reset_index(drop=True)
    result.to_csv(OUTPUT / "P5_methods_comparison.csv", index=False, encoding="utf-8-sig")
    pd.DataFrame(fold_rows).to_csv(OUTPUT / "P5_fold_details.csv", index=False, encoding="utf-8-sig")
    method = str(result.iloc[0]["method"])

    # P5 — 選定方法後，以全訓練集重新選特徵及訓練，最後只評估一次測試集。
    selected = choose_features(method, x_train, y_train)
    final_model = ols().fit(x_train[selected], y_train)
    prediction = final_model.predict(x_test[selected])
    test_metrics = evaluate(y_test, prediction)
    records = pd.DataFrame({"original_row_index": test_idx,
                            "actual_profit": y_test.to_numpy(),
                            "predicted_profit": prediction,
                            "residual": y_test.to_numpy() - prediction})
    records.to_csv(OUTPUT / "P5_test_predictions.csv", index=False, encoding="utf-8-sig")

    fig, axes = plt.subplots(1, 2, figsize=(11, 4))
    axes[0].scatter(y_test, prediction)
    bounds = [min(y_test.min(), prediction.min()), max(y_test.max(), prediction.max())]
    axes[0].plot(bounds, bounds, "--", color="gray")
    axes[0].set(xlabel="Actual Profit", ylabel="Predicted Profit", title="Actual vs Predicted")
    axes[1].scatter(prediction, records["residual"])
    axes[1].axhline(0, linestyle="--", color="gray")
    axes[1].set(xlabel="Predicted Profit", ylabel="Residual", title="Residual Plot")
    fig.tight_layout()
    fig.savefig(OUTPUT / "P5_evaluation_plots.png", dpi=160)
    plt.close(fig)

    # P6 — 模型保存與載入一致性驗證；網站部署另行規劃。
    model_file = OUTPUT / "P6_model.joblib"
    joblib.dump({"model": final_model, "features": selected}, model_file)
    loaded = joblib.load(model_file)
    assert np.allclose(prediction, loaded["model"].predict(x_test[loaded["features"]]))

    summary = {**project_info, "data_source": data_source,
               "total_rows": len(df), "train_rows": len(x_train), "test_rows": len(x_test),
               "best_method": method, "selected_features": selected,
               "nested_cv_results": result.to_dict(orient="records"),
               "feature_count_cv_results": feature_count_table.to_dict(orient="records"),
               "four_methods_feature_count": method_feature_table.to_dict(orient="records"),
               "test_metrics": test_metrics,
               "model_reload_predictions_identical": True}
    (OUTPUT / "P6_experiment_summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    report = ["# 50 Startups — CRISP-DM 六階段成果", "",
              f"- 資料來源：`{data_source}`", f"- 總筆數／訓練／測試：{len(df)}／{len(x_train)}／{len(x_test)}",
              "- 特徵選擇評分：外層 5-Fold CV；選擇器僅使用各折訓練資料", "",
              "## 四種方法比較", "", "```text", result.to_string(index=False), "```", "",
              "## 特徵數量比較（訓練集 CV，探索性）", "", "```text",
              feature_count_table.to_string(index=False), "```",
              "- 圖表：`P5_feature_count_dashboard.png`、`P5_feature_count_rmse.png`、`P5_feature_count_r2.png`",
              "- 四方法趨勢圖：`P5_four_methods_feature_count.png`；詳細 CSV：`P5_four_methods_feature_count.csv`",
              "- 特徵子集依整份訓練集選出，再用同一訓練集 CV 評分；上述趨勢圖屬探索性，可能偏樂觀；勿與巢狀 CV、測試績效混用。", "",
              f"## 最終方法：{method}", f"- 入選特徵：{', '.join(selected)}", "",
              "## 測試集指標", ""]
    report += [f"- {key}: {value:.6f}" for key, value in test_metrics.items()]
    report += ["", "## P6 驗證", "- 模型儲存／載入預測一致：通過", "",
               "## 限制", "- 資料集規模小，交叉驗證結果可能不穩定。",
               "- 在多種方法中選最佳者可能造成估計偏樂觀；留存測試集僅在最後評估。",
               "- 模型不代表因果關係；此處未進行 GitHub Pages 部署。", ""]
    (OUTPUT / "CRISP_DM_execution_report.md").write_text("\n".join(report), encoding="utf-8")
    print(f"完成｜最佳方法：{method}｜特徵：{selected}")
    print(f"Test RMSE={test_metrics['RMSE']:.4f}｜R²={test_metrics['R2']:.4f}")
    print(f"成果目錄：{OUTPUT}")
    # 輸出正式檢核：確保使用者要求的圖表確實寫入磁碟，而不是僅顯示預期檔名。
    expected_charts = [
        "P2_feature_scatter.png",
        "P5_feature_count_dashboard.png",
        "P5_feature_count_rmse.png",
        "P5_feature_count_r2.png",
        "P5_four_methods_feature_count.png",
        "P5_evaluation_plots.png",
    ]
    missing = [name for name in expected_charts
               if not (OUTPUT / name).is_file() or (OUTPUT / name).stat().st_size == 0]
    if missing:
        raise RuntimeError(f"圖表生成失敗，缺少以下檔案：{missing}")
    print("\n=== 圖表輸出驗證：全部完成 ===")
    for name in expected_charts:
        print(f"[OK] {OUTPUT / name}")
    print("\n請打開上方『成果目錄』，不要只查看 src/ 或 results/P5/。")
    print("macOS 可在 Terminal 執行：open \"" + str(OUTPUT) + "\"")
    print("圖表儲存為 PNG，不會自動跳出視窗。")


if __name__ == "__main__":
    main()
