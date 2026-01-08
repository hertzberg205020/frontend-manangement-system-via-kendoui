# UI Migration (AntD → KendoReact) — Atomic Tasks

這個資料夾的目的：把 UI 遷移工作拆成「可一次完成、不可再切分」的原子化任務（Atomic Task），讓 sub-agent 可以拿到單一 task 檔後，**獨立從 0 到 1 完成實作 + 驗證**。

## 使用方式

- 每個 `task-XXX-*.md` 都是一個獨立任務：包含背景、目標、不可改動的約束、要改哪些檔、具體步驟、驗收條件、以及最後必跑的指令。
- sub-agent 執行任務時，必須：
  1) 嚴格依照「約束/範圍」避免擴大修改
  2) 完成後跑 `npm run lint` 與 `npm run build`
  3) 若失敗，只修與該任務直接相關的問題

## 任務清單（Roadmap）

1. `task-001-notify-facade.md`
   - 建立 `notify` facade（先用 AntD 作為 backend），把 repo 內所有 `message.*` 收斂到 facade，解除全域耦合。
2. `task-002-confirm-facade.md`
   - 建立 `confirm` facade（先用 AntD 作為 backend），把 `Popconfirm` / `Modal.confirm` 類用法收斂到 facade。
3. `task-003-icon-facade.md`
   - 建立 `AppIcon` facade（Kendo SVG icons 為主），逐步替換 `@ant-design/icons`。
4. `task-004-kendo-theme-enable.md`
   - 啟用 Kendo theme（以官方建議方式引入），並完成最小可視覺驗收。

> 註：真正替換 Shell（Sidebar/Tabs/Breadcrumb）屬於較大工作，建議在以上 foundation 完成後再拆成新的 atomic tasks。
