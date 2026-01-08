# Task 003 — 建立 AppIcon facade 並逐步替換 @ant-design/icons（Atomic）

## 目標

將 UI 圖示從 `@ant-design/icons` 收斂到 `AppIcon`（內部以 Kendo SVG icons 為主），降低 icon 系統切換成本。

## 範圍

- 新增 `src/ui/icons/AppIcon.tsx`（或同等路徑）
- 設計一個最小 icon set（只包含目前用到的 icon）
- 把 Sidebar/Header/Tabs/Login/Dashboard/Authorization Center 中的 `@ant-design/icons` 改用 `AppIcon`

## 官方方向（提醒）

Kendo 建議優先用 SVG icons（`@progress/kendo-svg-icons`）。

## 驗收

- `rg "@ant-design/icons" src` 命中數顯著下降（理想：0）
- `npm run lint`、`npm run build` 通過
