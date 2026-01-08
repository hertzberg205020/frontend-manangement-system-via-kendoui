# Task 004 — 啟用 Kendo theme（Atomic）

## 目標

在專案中正式引入 Kendo theme，確保之後任何 Kendo 元件都能正確顯示樣式。

## 範圍

- 確認專案目前是否已引入 `@progress/kendo-theme-default`
- 若未引入：用官方建議方式引入（CSS 或 SCSS 擇一）
- 增加最小驗收（例如頁面上渲染一個 Kendo Button/Notification）

## 參考（官方）

- <https://www.telerik.com/kendo-react-ui/components/styling>
- <https://www.telerik.com/design-system/docs/themes/kendo-themes/default/>

## 驗收

- 任一 Kendo 元件在 dev server 中有完整樣式
- `npm run lint`、`npm run build` 通過
