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
- 模型不代表因果關係；此處未進行網站部署。
