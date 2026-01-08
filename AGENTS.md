# AGENTS.md

本文件是給「自動化 / AI coding agent」與新進貢獻者的專案導覽：快速了解架構、資料流、修改點與常見踩雷。

## TL;DR (先做對的事)

- 開發指令：`npm run dev` / `npm run lint` / `npm run build` / `npm run preview`
- **頁面不要直接 import axios**；請走 `src/utils/http/http.ts` + `src/utils/http/request.ts`，並在 `src/api/*` 寫 domain API。
- **路由 / 選單是權限驅動**：改 permissions 時，通常要同時改
  - `src/constants/permissions.ts`
  - `src/router/routerMap.tsx`
  - `src/utils/menuItemsGenerator.ts`
- Tabs / 麵包屑依賴 `MENU_NODES` 的路徑 key；新增頁面要記得補。

---

## 1) 專案概覽

- Tech: React 19 + Vite 6 + TypeScript(strict)
- UI: Ant Design 5(`@ant-design/v5-patch-for-react-19` 已在入口載入)
- Router: React Router v7(`createBrowserRouter`/`RouterProvider`)
- State: Redux Toolkit
- HTTP: Axios (集中封裝於 `src/utils/http/*`)
- 可選 UI：KendoReact 相關套件已安裝 (Grid/Inputs/Layout/Theme…)，但目前程式碼中幾乎未直接使用；若要用請先確認 theme / 授權。

### 重要路徑

- 入口：`src/main.tsx`
- Router base：`src/router/index.tsx`
- Router (權限生成)：`src/router/generateRouteFromPermission.tsx`
- Router map(path -> component)：`src/router/routerMap.tsx`
- 權限與路徑常數：`src/constants/permissions.ts`
- Store：`src/store/index.ts`
- Auth slice：`src/store/login/authSlice.ts`
- Auth selectors：`src/store/selectors/authSelectors.ts`
- Layout shell：`src/pages/home/index.tsx`
- Sidebar menu：`src/components/navSidebar/index.tsx`
- Menu nodes (UI 結構)：`src/utils/menuItemsGenerator.ts`
- Tabs：`src/components/tabsManager/index.tsx` + `src/store/tabs/tabsSlice.ts`
- Breadcrumb：`src/components/breadCrumb/index.tsx`
- Route sync (路由 -> tabs)：`src/hooks/useRouteSync.ts`
- HTTP：`src/utils/http/http.ts`、`src/utils/http/request.ts`

---

## 2) 開發與環境

### Node 版本

- 建議 Node `20.19+`(Vite 6 baseline)。

### 環境變數

- 以 `.env.local` 管理 (不要提交 secrets)。
- 目前 HTTP client 會讀：
  - `VITE_API_URL`

### Scripts

- `npm run dev`：Vite dev server
- `npm run lint`：ESLint
- `npm run build`：`tsc -b` + `vite build`
- `npm run preview`：預覽 production build

---

## 3) 核心架構 (資料流)

### 入口渲染

在 `src/main.tsx`：

- 先載入全域樣式：`src/index.scss`
- 載入 AntD React 19 patch：`@ant-design/v5-patch-for-react-19`
- 用 `<Provider store={store}>` 注入 Redux
- 用 `<ConfigProvider locale={enUS}>` 注入 AntD locale
- Render `<App />`

### App：權限驅動路由樹

`src/App.tsx` 的核心行為：

- 若沒有 token：直接使用 `BASE_ROUTES` (只包含 `/`、`/login`、`*`)
- 若有 token：等待 `permissionsLoaded` 後，呼叫 `generateRoutesFromPermissions(permissions)`
- 將權限路由塞進 `BASE_ROUTES` 的根路由 (path `/`) 下面，並視情況把 `/dashboard` 設成 `index`

> 這意味著：
>
> - 權限未載入完成前，App 會顯示 loading spinner。
> - 權限路由是「在 runtime 組裝」的，新增 / 修改 permission 對應頁面要確保三個地方一致 (permissions map /routerMap/ MENU_NODES)。

---

## 4) Auth、權限與守門

### Auth state

`src/store/login/authSlice.ts`：

- `token: string | null` (sessionStorage 持久化)
- `permissions: Permission[]`(sessionStorage 持久化)
- `permissionsLoaded: boolean`

### Auth selectors & hook

- `src/store/selectors/authSelectors.ts`：
  - `selectUserInfo`：使用 `jwt-decode` 解析 user info (name/roles/sub/exp)
  - `selectIsTokenExpired`：用 `JwtToken` helper 判斷是否過期
  - `selectIsAuthenticated`：token 存在且未過期
- `src/hooks/useAuth.ts`：包一層便利 API (`hasPermission`/`hasAnyPermission`/`hasAllPermissions`)

### Guard 元件 (兩套角色不同)

- `src/utils/RequireAuth.tsx`：
  - 用在 base routes：`/` 與 `/login`
  - 核心目標：
    - 未登入不能進 Home
    - 已登入不能回 login
- `src/components/PrivateRoute/index.tsx`：
  - 用在「權限路由」
  - 若缺權限，顯示 AntD `Result 403`

---

## 5) 路由、頁面與選單

### Permission -> Route

- 定義：`src/constants/permissions.ts`
  ் - `PERMISSIONS.*`：權限 code
  - `RESOURCES.*`：path 常數
  - `PERMISSION_ROUTE_MAP`：把 Permission 映到 `{ path, label, description, icon, parentPath }`

- 產生路由：`src/router/generateRouteFromPermission.tsx`
  - 讀 `PERMISSION_ROUTE_MAP`
  - 用 `getRoute(path)` 取得頁面 element
  - 外層包 `PrivateRoute requiredPermission={permission}`

- path -> component：`src/router/routerMap.tsx`
  - 用 `React.lazy` 動態載入 pages

### Menu(Sidebar)

- UI 結構定義：`src/utils/menuItemsGenerator.ts` 的 `MENU_NODES`
  - 這是「前端定義的資訊架構」
  - `requiredPermissions` 控制葉子節點顯示
- 依權限產生：`generateMenuFromPermissions(permissions)`
- Sidebar：`src/components/navSidebar/index.tsx`
  - 把 `MenuItemForDisplay` 轉成 AntD Menu items
  - 點擊時會 `dispatch(addTab(...))` 並 `navigate(key)`

### Breadcrumb

- `src/components/breadCrumb/index.tsx`
- 以 `MENU_NODES` 做遞迴搜尋與快取，顯示路徑 label。

---

## 6) Tabs (路由同步)

- Slice：`src/store/tabs/tabsSlice.ts`
  - sessionStorage key：`tabs-state`
  - Home tab 固定 `/dashboard` 且不可關閉
- UI：`src/components/tabsManager/index.tsx`
  - 切換 tab 會 `setActiveTab`；close / close-others / close-all
- 同步：`src/hooks/useRouteSync.ts`
  - 監聽 `location.pathname`
  - 用 `MENU_NODES` 找到對應節點後 `addTab`
  - 若找不到，會 `setActiveTab('/dashboard')`

> Agent 常見踩雷：新增頁面若沒加入 `MENU_NODES`，會造成 useRouteSync 找不到、Tab 被強制切回 dashboard。

---

## 7) HTTP 與 API 分層 (務必遵守)

### 禁止事項

- **不要在 page/component 直接 import axios**。

### 正確分層

- HTTP client：`src/utils/http/http.ts`
  - baseURL：`import.meta.env.VITE_API_URL`
  - request interceptor：加 requestId/startTime、從 store 注入 Bearer token
  - response interceptor：
    - 統一 log
    - 支援 business error (data.code 非 2xx)
    - 401 時嘗試 dispatch logout / 導向 `/login`
    - retry/backoff (network 或 5xx)
  - 使用 AntD `message` 統一吐錯

- Typed wrapper：`src/utils/http/request.ts`
  - `get/post/put/del` 回傳 `Promise<ApiResponse<T>>`

- Domain API：`src/api/*.ts`
  - 只做「endpoint + 型別 + 最小的 response shape 驗證」
  - UI 層只呼叫 domain API，不直接碰 http instance

---

## 8) UI：Ant Design 與 KendoReact

### Ant Design (預設)

- 入口已載入 `@ant-design/v5-patch-for-react-19`
- `ConfigProvider` 目前使用 `enUS` locale

### KendoReact (已安裝，但使用前先確認)

本 repo 已包含：

- `@progress/kendo-react-*`(Grid/Inputs/Buttons/Layout/…)
- `@progress/kendo-theme-default`
- `@progress/kendo-licensing`
- repo root 有 `telerik-license.txt`

#### 授權 (官方流程摘要)

依官方文件 (Updated on Aug 13, 2025)：

- 將 `telerik-license.txt` 放在 repo root (與 `package.json` 同層)\*\* 或 \*\* 設定 `TELERIK_LICENSE` 環境變數
- 安裝 `@progress/kendo-licensing`
- 執行：`npx kendo-ui-license activate`

注意：不要在 PR/Issue/ 日誌貼出 license key 內容。

參考：

- <https://www.telerik.com/kendo-react-ui/components/my-license>

#### Theme(Default)

Kendo theme 可用兩種方式 (依官方 Default theme docs)：

- 使用 precompiled CSS (例如 `dist/default-main.css`)
- 或使用 SCSS (例如 `@use '@progress/kendo-theme-default/scss/all.scss' as *;`)

本專案目前 **沒有** 在 `src/main.tsx` 或 `src/index.scss` 看到 Kendo theme 的 import。
若要新增 Kendo 元件，請先補上其中一種 theme 引入，避免元件無樣式。

參考：

- <https://www.telerik.com/design-system/docs/themes/kendo-themes/default/>
- <https://www.telerik.com/kendo-react-ui/components/styling>

> KendoReact API/props 變動快：新增任何 Kendo 元件時，請先查官方文件 (或使用專案內的 Kendo 助手工具)。

---

## 9) Coding style (本 repo 約定)

- Functional components + Hooks
- TypeScript strict；避免 `any`
- 檔案 / 命名：Component `PascalCase.tsx`、Hook `useCamelCase.ts`
- 2 spaces、字串用單引號、JSX attribute 用雙引號、分號
- import 順序：React → 外部套件 → 內部 `@/` → styles → `import type`

參考：

- `.github/copilot-instructions.md`
- `.github/instructions/coding-style.instructions.md`

---

## 10) 常見改動指南 (Agent Checklist)

### 新增一個「需要權限」的新頁面

1. 建立 page：`src/pages/<feature>/index.tsx` (或沿用現有 feature 結構)
2. 加 route path 常數：`src/constants/permissions.ts` 的 `RESOURCES`
3. 加 permission code：`PERMISSIONS` + `PERMISSION_ROUTE_MAP`
4. 加 routerMap 對應：`src/router/routerMap.tsx`(lazy import + map)
5. 加 sidebar/menu node：`src/utils/menuItemsGenerator.ts` 的 `MENU_NODES`
6. 若要在 UI 內做細粒度控制：
   - route-level：用 `PrivateRoute requiredPermission`
   - component-level：用 `useAuth().hasPermission(...)` 或 `withPermissions`

### 新增 API

1. 在 `src/api/<domain>.ts` 新增函式
2. 型別：定義 request/response interface
3. 呼叫 `get/post/put/del` (不要用 axios)
4. UI 層只 import domain API

---

## 11) 驗證

修改後至少跑：

- `npm run lint`
- `npm run build`

需要手動驗證的常見點：

- 登入 / 登出後 router 是否重建正確
- 權限不足時是否能正確顯示 403 (不是白畫面)
- 新增頁面是否能出現在 sidebar、breadcrumb、tabs
