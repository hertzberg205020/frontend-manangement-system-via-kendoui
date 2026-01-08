# Ant Design → KendoReact 遷移清單（本 repo）

> 目標：在不破壞「權限驅動路由 / Sidebar / Tabs / Breadcrumb」的前提下，逐步把 UI 從 Ant Design 5 遷移到 KendoReact。
>
> 建議策略：**Strangler Fig（混合）**——先把跨切面依賴（theme / notification / icons / confirm）抽象化，再以「頁面內部」為主逐步替換，最後才換整個 Shell（home layout / sidebar / tabs）。

---

## 0) 本次盤點結果（快速總覽）

### 0.1 AntD 直接匯入（需要遷移的檔案）

> 由 `rg -l "from 'antd'|from \"antd\"|antd/es" src` 產生

- `src/App.tsx`
- `src/main.tsx`
- `src/utils/http/http.ts`
- `src/utils/process-table-column.tsx`
- `src/components/PrivateRoute/index.tsx`
- `src/components/layoutHeader/index.tsx`
- `src/components/navSidebar/index.tsx`
- `src/components/tabsManager/index.tsx`
- `src/components/breadCrumb/index.tsx`
- `src/pages/home/index.tsx`
- `src/pages/login/index.tsx`
- `src/pages/dashboard/index.tsx`
- `src/pages/users/index.tsx`
- `src/pages/users/ClientForm.tsx`
- `src/pages/property-management/tenement/index.tsx`
- `src/pages/property-management/tenement/columns.tsx`
- `src/pages/property-management/tenement/UpsertModal.tsx`
- `src/pages/authorization-center/index.tsx`
- `src/pages/authorization-center/hooks/useAuthorizationData.ts`
- `src/pages/authorization-center/components/RoleManagement/index.tsx`
- `src/pages/authorization-center/components/RoleManagement/RoleModal.tsx`
- `src/pages/authorization-center/components/RoleManagement/RoleTable.tsx`
- `src/pages/authorization-center/components/UserManagement/index.tsx`
- `src/pages/authorization-center/components/UserManagement/UserModal.tsx`
- `src/pages/authorization-center/components/UserManagement/UserTable.tsx`

### 0.2 Ant Icons 匯入（需要替換成 Kendo SVG icons）

> 由 `rg -l "@ant-design/icons" src` 產生

- `src/components/layoutHeader/index.tsx`
- `src/components/navSidebar/icons.tsx`
- `src/components/tabsManager/index.tsx`
- `src/pages/login/index.tsx`
- `src/pages/dashboard/icons.tsx`
- `src/pages/authorization-center/index.tsx`
- `src/pages/authorization-center/components/RoleManagement/index.tsx`
- `src/pages/authorization-center/components/RoleManagement/RoleTable.tsx`
- `src/pages/authorization-center/components/UserManagement/index.tsx`
- `src/pages/authorization-center/components/UserManagement/UserTable.tsx`

### 0.3 `message.*` 使用點（需要先抽象化，否則難以移除 AntD）

> 由 `rg -l "\\bmessage\\." src` 產生

- `src/utils/http/http.ts`（全域錯誤提示耦合）
- `src/pages/login/index.tsx`
- `src/pages/users/index.tsx`
- `src/pages/users/ClientForm.tsx`
- `src/pages/property-management/tenement/index.tsx`
- `src/pages/property-management/tenement/UpsertModal.tsx`
- `src/pages/authorization-center/hooks/useAuthorizationData.ts`
- `src/pages/authorization-center/components/RoleManagement/index.tsx`
- `src/utils/process-table-column.tsx`
- `src/api/auth-management.ts`（這支是註解/文件示範碼，仍建議一起清掉避免誤導）

### 0.4 AntD 專屬 CSS（.ant-*）耦合點

- `src/index.scss`
  - `.search .ant-col { ... }`
- `src/components/navSidebar/index.scss`
  - `.ant-menu { ... }`
- `src/components/tabsManager/index.scss`
  - `.ant-tabs ...`、`.ant-tabs-tab ...`、`.ant-tabs-content-holder ...`
  - `.tab-label .anticon { ... }`
- `src/components/tabsManager/README.md`
  - 文件中出現 `.ant-tabs-tab`（屬於文件，但代表設計仍依賴 AntD class）

### 0.5 入口層耦合

- `src/main.tsx` 目前載入 `@ant-design/v5-patch-for-react-19` + `ConfigProvider`。

---

## 1) 遷移前置（Foundation）— 建議第一週完成

> 目的：先把「移除 AntD 的主要阻礙」拆掉，後續頁面遷移才能快速且低風險。

### 1.1 Kendo Theme 與樣式

- [ ] 確認已引入 Kendo theme（本 repo 目前沒有看到在 `src/main.tsx` 或 `src/index.scss` 引入 `@progress/kendo-theme-default` 的 CSS/SCSS）。
- [ ] 決定策略：
  - (A) precompiled CSS（最快）
  - (B) SCSS build（客製化主題，較重）
- [ ] 驗收：任一 Kendo 元件（例如 Button/Notification）在本機跑起來有完整樣式、不變形。

參考（官方）：

- <https://www.telerik.com/kendo-react-ui/components/styling>
- <https://www.telerik.com/design-system/docs/themes/kendo-themes/default/>

### 1.2 License（Grid 等 premium 功能）

- [ ] 確認 repo root 有 `telerik-license.txt`（已存在）。
- [ ] 確認開發機已完成啟用（通常用 `npx kendo-ui-license activate`）。
- [ ] 驗收：引入 Grid（premium 特性）不出現 license error。

參考（官方）：

- <https://www.telerik.com/kendo-react-ui/components/my-license>

### 1.3 建立「UI Facade」：通知、確認、icons（**遷移加速器**）

> 這是避免你在遷移期間同時維護兩套 UI API 的關鍵。

- [ ] 新增 `src/ui/`（或 `src/utils/ui/`）資料夾，放以下 facade：
  - `notify.success/error/warn/info`（替代 `message.*`）
  - `confirm(...)`（替代 `Modal.confirm` / `Popconfirm`）
  - `AppIcon`（替代 `@ant-design/icons`，統一改 Kendo `SvgIcon`）
- [ ] 先做 AntD backend（確保不改行為），之後再切成 Kendo backend。
- [ ] 驗收：`src/utils/http/http.ts`、常見 CRUD 頁面完全改用 facade，且功能不變。

Kendo 對應：

- Notification（npm：`@progress/kendo-react-notification`）
  - <https://www.telerik.com/kendo-react-ui/components/notification/>
- Dialog（npm：`@progress/kendo-react-dialogs`）
  - <https://www.telerik.com/kendo-react-ui/components/dialogs/>
- SVG Icons（npm：`@progress/kendo-svg-icons` + `@progress/kendo-react-common`/`SvgIcon`）
  - <https://www.telerik.com/kendo-react-ui/components/icons/>

---

## 2) Shell 與導航（建議最後做，但先規劃）

### 2.1 Tabs（AntD Tabs → Kendo TabStrip）

現況：`src/components/tabsManager/index.tsx` 用 AntD Tabs + Dropdown + Ant icons，且 SCSS 直接改 `.ant-tabs*`。

Kendo 對應：TabStrip（npm：`@progress/kendo-react-layout`）

- <https://www.telerik.com/kendo-react-ui/components/layout/tabstrip/>

Checklist：

- [ ] 先把 Tabs UI 與「狀態/路由同步」分離（Redux tabs slice + router sync 邏輯保留，UI 只是 view）。
- [ ] 用 TabStrip 重做 tabs view（可先做 POC，不一定馬上替換 production）。
- [ ] 右鍵選單/更多選單：可用 Kendo Popup/ContextMenu 或保留你們自製 Dropdown 方案。
- [ ] 清掉 `.tabs-manager` 下所有 `.ant-tabs*` 與 `.anticon` 依賴。
- [ ] 驗收：
  - 切 tab 會 navigate
  - 關閉 tab / 關閉其他 / 關閉全部 OK
  - Reload 後 tabs-state 還原 OK

### 2.2 Sidebar Menu（AntD Menu → Kendo Menu/Drawer/PanelBar）

現況：`src/components/navSidebar/index.tsx` 用 AntD Menu；`src/components/navSidebar/index.scss` 直接改 `.ant-menu`。

Kendo 對應：

- Menu（npm：`@progress/kendo-react-layout`）
  - <https://www.telerik.com/kendo-react-ui/components/layout/menu/>
- Drawer（同在 layout）
  - <https://www.telerik.com/kendo-react-ui/components/layout/drawer/>

Checklist：

- [ ] 決策：
  - 需要「多層展開」→ Menu / PanelBar
  - 需要「側欄抽屜、可收合」→ Drawer
- [ ] 保留你們的 `generateMenuFromPermissions` 產出資料模型，再 mapping 成 Kendo 的 items。
- [ ] 驗收：
  - 權限變動後 menu 正確刷新
  - 點選會 `dispatch(addTab)` + `navigate`
  - scroll 行為一致

### 2.3 Breadcrumb（AntD Breadcrumb → Kendo Breadcrumb）

現況：`src/components/breadCrumb/index.tsx` 使用 `MENU_NODES` 尋路 + cache。

Kendo 對應：Breadcrumb（npm：`@progress/kendo-react-layout`）

- <https://www.telerik.com/kendo-react-ui/components/layout/breadcrumb/>

Checklist：

- [ ] 保留 `MENU_NODES` 尋路邏輯，輸出 `data=[{ id, text, ... }]` 給 Kendo Breadcrumb。
- [ ] 用 `onItemSelect` 連回 router navigate。
- [ ] 驗收：breadcrumb 顯示與 AntD 時期一致；多層路徑正確。

---

## 3) 頁面逐步遷移（Bottom-up）

> 建議優先順序：Login → CRUD 列表頁（Users / Tenement）→ 授權中心 → Dashboard。

### 3.1 Login（`src/pages/login/index.tsx`）

AntD：Form/Input/Button/message + Ant icons。

Kendo 對應候選：

- Form：`@progress/kendo-react-form`
- Inputs：`@progress/kendo-react-inputs`
- Buttons：`@progress/kendo-react-buttons`
- Notification：`@progress/kendo-react-notification`

Checklist：

- [ ] 先把 `message.error` 改用 notify facade。
- [ ] 再替換表單元件（保持 validation/UX 一致）。
- [ ] 驗收：登入成功/失敗提示一致；鍵盤操作 OK。

### 3.2 Users / Tenement 列表（Table → Grid）

AntD：Table + columns helper + Popconfirm。

Kendo 對應：Grid（npm：`@progress/kendo-react-grid`）

- <https://www.telerik.com/kendo-react-ui/components/grid/>

Checklist：

- [ ] 先把「資料取得/分頁/搜尋」抽成 hook（UI 無關）。
- [ ] 將 columns 的 render 拆成可重用的 cell components。
- [ ] 用 Grid 實作：paging/sorting/filtering（先對齊現況功能，再加進階）。
- [ ] `Popconfirm` → confirm facade（之後切 Kendo Dialog）。
- [ ] 驗收：
  - 分頁、排序、刪除、編輯流程都與原本一致
  - loading/error 提示一致

相關檔案：

- `src/pages/users/index.tsx`
- `src/pages/users/ClientForm.tsx`
- `src/pages/property-management/tenement/index.tsx`
- `src/pages/property-management/tenement/columns.tsx`
- `src/pages/property-management/tenement/UpsertModal.tsx`
- `src/utils/process-table-column.tsx`

### 3.3 授權中心（Role/User 管理）

AntD：Card/Tabs/Tree/Transfer/Table/Modal/Spin/message + Ant icons。

Kendo 對應可能需要較多元件：

- TabStrip（layout）
- TreeView（treeview）
- Grid（grid）
- Dialog（dialogs）
- Loader（indicators）

Checklist：

- [ ] 先把所有 `message.*` 收斂到 notify facade。
- [ ] 再依畫面拆塊逐一替換（避免一次重寫整頁）。
- [ ] 驗收：權限/角色 CRUD 流程、授權指派、錯誤提示一致。

相關檔案：

- `src/pages/authorization-center/index.tsx`
- `src/pages/authorization-center/hooks/useAuthorizationData.ts`
- `src/pages/authorization-center/components/**`

### 3.4 Dashboard

AntD：Card/Statistic/Timeline/Progress。

Kendo 對應：

- Card（layout）
- ProgressBar（progressbars）
- Charts（charts）

Checklist：

- [ ] 先替換純展示元件（風險最低）。
- [ ] 驗收：視覺一致、資料正確、RWD 不退化。

---

## 4) 收尾（移除 AntD）

- [ ] 全 repo 無 `from 'antd'` / `@ant-design/icons` 匯入
- [ ] 全 repo 無 `.ant-*` selector（含 README/文件）
- [ ] `src/main.tsx` 移除 `@ant-design/v5-patch-for-react-19` 與 `ConfigProvider`（若不再需要）
- [ ] `package.json` 移除 `antd`、`@ant-design/icons`、`@ant-design/v5-patch-for-react-19`
- [ ] 驗收：`npm run lint`、`npm run build` 通過

---

## 5) 風險與注意事項

- 混用 AntD + Kendo 期間：
  - 兩套樣式系統可能互相影響（全域 CSS / reset / font）
  - 建議先把 Kendo theme 放在可控的 import order，並避免寫死 `.ant-*` 類別
- Kendo icons 建議以 SVG 為主（`@progress/kendo-svg-icons`），避免再引入 font-icon 依賴。
- Grid 的進階功能（Advanced Filtering 等）可能是 premium：
  - 先對齊你現在 AntD Table 的功能，再評估要不要上 premium feature。

---

## 6) 官方參考連結（本清單編寫依據）

- Notification：<https://www.telerik.com/kendo-react-ui/components/notification/>
- Grid：<https://www.telerik.com/kendo-react-ui/components/grid/>
- Layout / TabStrip：<https://www.telerik.com/kendo-react-ui/components/layout/tabstrip/>
- Layout / Menu：<https://www.telerik.com/kendo-react-ui/components/layout/menu/>
- Layout / Breadcrumb：<https://www.telerik.com/kendo-react-ui/components/layout/breadcrumb/>
- Styling：<https://www.telerik.com/kendo-react-ui/components/styling>
- License：<https://www.telerik.com/kendo-react-ui/components/my-license>
