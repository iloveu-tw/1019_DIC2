# 50 Startups — CRISP-DM 六階段成果

- 資料來源：`/Users/summer/NCHU_project/AIIS_DIC2/data/50_Startups.csv`
- 總筆數／訓練／測試：50／40／10
- 特徵選擇評分：外層 5-Fold CV；選擇器僅使用各折訓練資料

## 四種方法比較

```text
     method  cv_rmse_mean  cv_rmse_std  cv_r2_mean
      RFECV   9431.967686  3014.936736    0.925302
 Exhaustive   9592.221823  3075.342488    0.922404
Forward SFS   9592.221823  3075.342488    0.922404
    LassoCV   9824.091110  3065.389274    0.916510
```

## 特徵數量比較（訓練集 CV，探索性）

```text
 number_of_features                                                         selected_features  cv_rmse_mean  cv_rmse_std  cv_r2_mean
                  1                                                                 R&D Spend   9745.400782  2884.972538    0.919942
                  2                                                R&D Spend, Marketing Spend   9482.344019  2866.421394    0.924725
                  3                                R&D Spend, Administration, Marketing Spend   9678.076017  3177.796192    0.920983
                  4                R&D Spend, Administration, Marketing Spend, State_New York   9921.630539  3180.207519    0.914937
                  5 R&D Spend, Administration, Marketing Spend, State_Florida, State_New York  10274.909218  3311.214081    0.909200
```
- 圖表：`P5_feature_count_dashboard.png`、`P5_feature_count_rmse.png`、`P5_feature_count_r2.png`
- 四方法趨勢圖：`P5_four_methods_feature_count.png`；詳細 CSV：`P5_four_methods_feature_count.csv`
- 特徵子集依整份訓練集選出，再用同一訓練集 CV 評分；上述趨勢圖屬探索性，可能偏樂觀；勿與巢狀 CV、測試績效混用。

## 最終方法：RFECV
- 入選特徵：R&D Spend, Marketing Spend

## 測試集指標

- MAE: 6886.594588
- MSE: 67220275.375681
- RMSE: 8198.797191
- R2: 0.947439

## P6 驗證
- 模型儲存／載入預測一致：通過

## 限制
- 資料集規模小，交叉驗證結果可能不穩定。
- 在多種方法中選最佳者可能造成估計偏樂觀；留存測試集僅在最後評估。
- 模型不代表因果關係；此處未進行 GitHub Pages 部署。
