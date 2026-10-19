# 50 Startups — Multiple Linear Regression with CRISP-DM

以 **Python / Scikit-learn** 分析 Kaggle **50 Startups** 資料集，遵循 **CRISP-DM**（Cross-Industry Standard Process for Data Mining）六階段建立新創公司利潤預測模型。專案將資料檢查、前處理、特徵選擇、交叉驗證、模型評估及模型儲存整合在**單一 Python 程式**中。

> **目前狀態：** 本機 Python 分析與成果輸出；GitHub Pages 網頁展示規劃中，尚未部署。
>
> **注意：** 圖表與效能數據須由實際執行產生；本 README 不預設或杜撰最終最佳模型及其分數。

## 1. 專案目標

使用公司營運支出與州別資訊預測 `Profit`（利潤），並比較特徵選擇演算法在小型資料集上的表現。主要研究問題：

- 哪些特徵對利潤預測較有幫助？
- 特徵數量從 1 增至 5 時，交叉驗證的 **RMSE** 與 **R²** 如何變化？
- 四種特徵選擇方法何者在目前實驗設定下表現較佳？

## 2. 資料集

- **資料來源：** [Kaggle — 50 Startups](https://www.kaggle.com/datasets/anithabalakrishna/50-startups)
- **資料檔案：** `data/50_Startups.csv`
- **預期資料量：** 50 筆、5 個原始欄位（程式會根據實際 CSV 驗證內容）

| 欄位 | 類型 | 說明 |
|---|---|---|
| `R&D Spend` | 數值 | 研發支出 |
| `Administration` | 數值 | 行政支出 |
| `Marketing Spend` | 數值 | 行銷支出 |
| `State` | 類別 | 公司所在州別 |
| `Profit` | 數值 | 預測目標：利潤 |

`State` 使用 California 作為基準類別，轉成 `State_Florida` 與 `State_New York` 兩個虛擬變數，因此模型共有 **5 個編碼後候選特徵**。

程式**優先讀取本地 CSV**；只有 `data/50_Startups.csv` 不存在時，才會嘗試使用 `kagglehub` 下載上述 Kaggle 資料集。既有原始 CSV 不會被覆寫。

## 3. CRISP-DM 六階段

| 階段 | 名稱 | 本專案工作 |
|---|---|---|
| P1 | Business Understanding | 定義 `Profit` 預測問題及研究目標 |
| P2 | Data Understanding | 讀取資料、檢查缺失／重複值、描述統計、相關係數與散點圖 |
| P3 | Data Preparation | 州別虛擬變數編碼；80/20 訓練／測試切分；標準化納入模型流程 |
| P4 | Modeling | 以 `LinearRegression` 建立多元線性迴歸模型 |
| P5 | Evaluation | 特徵選擇、交叉驗證、MAE／MSE／RMSE／R²、預測與殘差圖 |
| P6 | Deployment Preparation | `joblib` 儲存模型、重新載入及預測一致性檢查（不包含網站部署） |

### 四種特徵選擇演算法

| 方法 | 核心作法 | 使用工具 |
|---|---|---|
| **Exhaustive Search** | 列舉 5 個特徵的全部 **31 個非空子集** | `itertools.combinations`、交叉驗證 |
| **Forward SFS** | 依交叉驗證 RMSE 逐步加入特徵 | 自行實作前向選擇 |
| **RFECV** | 遞迴刪除特徵並透過交叉驗證選擇數量 | `sklearn.feature_selection.RFECV` |
| **LassoCV (L1)** | 利用 L1 正則化壓縮係數、選擇非零特徵 | `sklearn.linear_model.LassoCV` |

**驗證設計：** `random_state=0`，資料按 80% / 20% 切分。四種方法使用訓練集上的**外層 5-Fold CV** 比較；每個外層訓練折內再執行特徵選擇（內層 3-Fold CV），降低選擇階段的資料洩漏風險。最後才以保留的測試集評估選定模型。

> 「特徵數量趨勢圖」屬**探索性分析**：在整份訓練資料中選取特徵組合後，再於同一訓練資料上進行 CV 評分，分數可能偏樂觀。它與正式的外層交叉驗證結果及最終 Test Set 指標**不可混為一談**。由多種方法再選出最低 CV RMSE 的方法，也可能帶來模型比較的選擇偏差。

## 4. 專案結構

```text
50_Startups_Project/
├── README.md
├── 50_startups_crisp_dm_all_in_one.py
├── data/
│   └── 50_Startups.csv
└── results/
    └── CRISP_DM_ALL_IN_ONE/           # 執行程式後自動建立
        ├── CRISP_DM_execution_report.md
        ├── P2_correlation.csv
        ├── P2_data_summary.csv
        ├── P2_feature_scatter.png
        ├── P3_train_indices.csv
        ├── P3_test_indices.csv
        ├── P5_methods_comparison.csv
        ├── P5_fold_details.csv
        ├── P5_feature_count_comparison.csv
        ├── P5_feature_count_dashboard.png
        ├── P5_feature_count_rmse.png
        ├── P5_feature_count_r2.png
        ├── P5_four_methods_feature_count.csv
        ├── P5_four_methods_feature_count.png
        ├── P5_evaluation_plots.png
        ├── P5_test_predictions.csv
        ├── P6_experiment_summary.json
        └── P6_model.joblib
```

主程式也支援置於 `src/` 目錄；會依 Python 檔案位置識別專案根目錄。

## 5. 安裝與執行

### 環境需求

- Python 3（建議 3.10 以上）
- `pandas`、`numpy`、`matplotlib`、`scikit-learn`、`joblib`
- `kagglehub`（僅在需要自動下載資料時使用）

在專案根目錄執行：

```bash
python3 -m pip install pandas numpy matplotlib scikit-learn joblib kagglehub
python3 50_startups_crisp_dm_all_in_one.py
```

如果主程式放在 `src/`：

```bash
python3 src/50_startups_crisp_dm_all_in_one.py
```

macOS 可在執行後開啟成果資料夾：

```bash
open results/CRISP_DM_ALL_IN_ONE
```

> 此程式使用 Matplotlib 的非互動式 `Agg` 後端，**會將圖表儲存為 PNG，但不會自動開啟圖形視窗**。執行結束時會列印六張必要 PNG 的存在性檢查結果。

## 6. 成果圖表

### 6.1 特徵數量與模型表現（含表格）

對照你希望呈現的報告版型：左側 **RMSE by Number of Features**、右側 **R-squared by Number of Features**，下方列出各特徵數量的最佳組合與分數。

![Feature count performance dashboard](results/CRISP_DM_ALL_IN_ONE/P5_feature_count_dashboard.png)

- 圖檔：`P5_feature_count_dashboard.png`
- 明細：`P5_feature_count_comparison.csv`
- 個別圖：`P5_feature_count_rmse.png`、`P5_feature_count_r2.png`

### 6.2 四種特徵選擇方法：RMSE / R² 對照圖

比較 **Exhaustive Search、Forward SFS、RFE ranking、Lasso L1 ranking** 隨特徵數量變化的趨勢，並附結果表格。

![Four feature selection methods comparison](results/CRISP_DM_ALL_IN_ONE/P5_four_methods_feature_count.png)

- 圖檔：`P5_four_methods_feature_count.png`
- 明細：`P5_four_methods_feature_count.csv`

> 圖表中的 **RFE ranking** 與 **Lasso L1 ranking** 是以各自的特徵排序取前 *k* 個，用於探索性比較；與正式外層 CV 的 **RFECV**、**LassoCV** 特徵選擇流程並不完全相同。

### 6.3 實際與預測利潤、殘差分析

![Actual versus predicted and residual plots](results/CRISP_DM_ALL_IN_ONE/P5_evaluation_plots.png)

- 測試集預測：`P5_test_predictions.csv`
- 正式四方法比較：`P5_methods_comparison.csv`
- 外層交叉驗證細節：`P5_fold_details.csv`

以上圖片連結是**相對路徑**；必須先執行程式，並將產生的 PNG 一起加入 Git 儲存庫，GitHub README 才會顯示實際圖表。若專案尚未執行，圖片暫時不會出現。

## 7. 評估指標

| 指標 | 意義 | 解讀方向 |
|---|---|---|
| MAE | 平均絕對誤差 | 越低越好 |
| MSE | 平均平方誤差 | 越低越好 |
| RMSE | 均方根誤差，與 `Profit` 同單位 | 越低越好 |
| R² | 決定係數 | 越高通常越好，也可能為負 |

實際最佳方法、入選特徵與測試集數值，請以執行後的 `CRISP_DM_execution_report.md` 或 `P6_experiment_summary.json` 為準。

## 8. 可重現性與限制

- 固定隨機種子：`random_state=0`。
- 原始 CSV 不覆寫；分析結果集中輸出到 `results/CRISP_DM_ALL_IN_ONE/`。
- 模型標準化由 Pipeline 於各次擬合時進行，不事先使用測試集資訊。
- 50 筆資料規模小，交叉驗證分數與特徵選取可能受到切分方式影響。
- 預測關聯**不等於因果關係**，本專案結果不宜直接用作真實投資決策。
- `joblib` 模型僅應從可信來源載入；其內容不適合在 GitHub Pages 中直接執行。

## 9. GitHub Pages（後續規劃）

未來可將本次產生的 **PNG、CSV、JSON** 整理成 GitHub Pages 靜態成果展示網站，包含特徵數量趨勢圖、四種演算法比較、結果表格與模型評估摘要。

**目前僅完成本機分析程式的規劃與產出流程；尚未加入 HTML／JavaScript 頁面，也未進行 GitHub Pages 部署。** GitHub Pages 不會在伺服器上替你執行 Python 模型訓練；需要先在本機產生成果再發布靜態檔案。

---

**技術：** Python · Scikit-learn · Pandas · NumPy · Matplotlib · Joblib · CRISP-DM
