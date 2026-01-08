# Task 002 — 建立 confirm facade（Popconfirm/Modal.confirm 收斂）（Atomic）

## 目標

建立一個 `confirm` facade，統一「二次確認」的呼叫方式，避免頁面與工具層直接依賴 AntD 的 `Popconfirm` / `Modal.confirm`。

## 範圍

- 新增 `src/ui/confirm.ts`（先用 AntD backend）
- 將專案中用於 delete/危險操作的確認流程，逐步改為 `confirm(...)`
- 驗證 `npm run lint`、`npm run build`

## 不做

- 不更換成 Kendo Dialog backend（另開 task）
- 不改變任何刪除/更新 API 行為

## 驗收

- 重要刪除流程不再直接使用 AntD confirm API（或至少集中在 facade）
- lint/build 通過
