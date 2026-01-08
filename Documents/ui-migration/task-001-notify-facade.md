# Task 001 — 建立 notify facade 並移除 message 直接耦合（Atomic）

## 為什麼要做

目前專案在多處直接使用 Ant Design 的 `message.*`：

- UI 頁面（登入、Users、Tenement、Authorization Center）
- 共用工具（`src/utils/process-table-column.tsx`）
- 最關鍵：HTTP interceptor（`src/utils/http/http.ts`）

這會讓後續遷移到 KendoReact 時「無法乾淨移除 AntD」，因為連非 UI 檔案（http client）都綁死 AntD。

本任務目標：先建立一個 UI facade（`notify`），**先用 AntD 當作 backend**，把所有 `message.*` 呼叫收斂到 `notify.*`，行為不變但解除耦合。

---

## 任務範圍（不可擴大）

只做以下事情：

1. 新增 `notify` facade（AntD backend）
2. 把目前 repo 內的 `message.*`（success/error/info/warning）全面改成 `notify.*`
3. 移除所有 `import { message } from 'antd'`（在本任務涉及的檔案中）
4. 跑 `npm run lint` + `npm run build`，確保通過

### 明確不做

- 不導入 Kendo theme（留給 task-004）
- 不把 Notification backend 改成 Kendo（留到後續 task，或另開 task）
- 不重構 UI layout/tabs/menu
- 不新增或改動 API 行為

---

## 依賴與約束

- TypeScript strict、2 spaces、single quotes、分號必須保留
- 不要在 pages/components 直接 import axios（維持現有規範）
- 如需參考 Kendo 作法，必須查官方文件（但本 task 先用 AntD backend）

---

## 需要修改/新增的檔案

### 新增

- `src/ui/notify.ts`
  - 導出：`notify.success`, `notify.error`, `notify.info`, `notify.warning`
  - backend：目前直接呼叫 AntD `message`（行為對齊現況）
- `src/ui/index.ts`（可選，但建議）
  - re-export `notify`

> 檔名位置：優先用 `src/ui/*`，避免散在 `src/utils/*`。

### 修改（把 `message.*` 全改成 `notify.*`）

- `src/utils/http/http.ts`
- `src/pages/login/index.tsx`
- `src/pages/users/index.tsx`
- `src/pages/users/ClientForm.tsx`
- `src/pages/property-management/tenement/index.tsx`
- `src/pages/property-management/tenement/UpsertModal.tsx`
- `src/pages/authorization-center/hooks/useAuthorizationData.ts`
- `src/pages/authorization-center/components/RoleManagement/index.tsx`
- `src/utils/process-table-column.tsx`

### 額外清理（可選）

- `src/api/auth-management.ts` 內若有示範註解包含 `message.*`，可改成 `notify.*` 或移除示範（避免誤導）。

---

## 實作步驟（sub-agent 必須逐步完成）

1. 建立 `src/ui/notify.ts`
   - 先定義 type-safe API（只包含目前用到的方法）
   - 內部用 AntD `message` 實作
2. 將上述「修改清單」中的 `message.*` 逐一替換成 `notify.*`
   - 同步移除 `message` 的 import
   - 確保參數型態一致（有些地方可能是 `message.error({ ... })` 物件型呼叫）
3. 專案內全文搜尋 `message.` 確認只剩下 `notify` 的實作檔或註解（允許註解，但建議也清）
4. 跑 `npm run lint`
5. 跑 `npm run build`

---

## 驗收條件（Acceptance Criteria）

- `rg "\\bmessage\\." src` 應該只命中：
  - `src/ui/notify.ts`（或同等 facade 實作檔）
  - （可選）文件/註解
- `rg "from 'antd'" src/utils/http/http.ts` 不再包含 `message` 的 import
- `npm run lint` 通過
- `npm run build` 通過

---

## 建議的驗證指令（sub-agent 必跑）

- `rg "\\bmessage\\." -n src`
- `npm run lint`
- `npm run build`
