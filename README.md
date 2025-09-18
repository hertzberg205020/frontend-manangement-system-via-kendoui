# 🏢 Science Park Management System (Frontend)

基於 React 19 + TypeScript + Vite 6 的科學園區 / 產業園區營運管理前端系統。

提供：儀表板、租戶 / 物業 / 合約 / 帳單、能源監測、招商、營運內容、設備維護、權限中心等模組，並採用細粒度權限與動態選單 / 路由生成機制，提升可維護性與擴充性。

---

## 🔍 核心特色

- ⚛️ React 19 + Vite：快速開發、原生 ESM、HMR。
- 🧩 模組化結構：清楚分離 `pages / components / api / store / utils`。
- 🔐 權限驅動 UI：JWT 解析 + 細粒度 `permission -> route/menu` 映射，動態生成路由與側邊選單。
- 🛡️ Route Guard：登入與匿名頁面雙向導流（登入後避免重訪 `/login`）。
- 🧮 Redux Toolkit：集中管理認證、分頁 tab、臨時業務資料 (tenement)。
- 🔁 HTTP 客戶端：Axios 封裝（重試 / 統一錯誤分類 / 商業錯誤處理 / 自動附掛 Token / 指數回退）。
- 🧠 衍生型 Selectors：權限、使用者資訊、過期狀態以 memoized selector 解析 JWT，避免重複儲存。
- 📦 Lazy Loading：頁面級別 `React.lazy` 降低初始包體。
- 🧪 可測性導向：明確分層（UI / State / HTTP / Permission Utilities），易於撰寫單元/整合測試（TODO）。

---

## 🗂 目錄結構（精簡說明）

```text
src/
  api/                # 與後端 REST 互動的抽象層 (使用封裝的 http/request)
  assets/             # 靜態資源 (圖片 / 圖示 / 字體)
  components/         # 可重用 UI 元件
    breadCrumb/
    layoutHeader/
    navSidebar/
    PrivateRoute/
    tabsManager/
  constants/          # 常數（權限、枚舉等）
  hooks/              # 共用 React Hooks
  mock/               # Mock 資料與 menu 說明
  pages/              # 功能模組頁（按業務域劃分）
    dashboard/
    users/
    property-management/
    finance/
    operation-center/
    authorization-center/
    ...
  router/             # 基礎路由定義與動態路由 map
  store/              # Redux Toolkit store 與各 slice + selectors
  types/              # 共用型別宣告 (JWT / 分頁 / 業務 DTO)
  utils/              # 工具（路由生成 / 權限 / HTTP / 表格處理）
    http/             # axios 封裝與 get/post helper
```

> 命名慣例：
>
> - React 元件：PascalCase (`UserProfile.tsx`)
> - Hooks：`useCamelCase` (`useAuth.ts`)
> - Slice / 常數：camelCase / UPPER_SNAKE_CASE
> - 型別：PascalCase (`JwtPayload`, `PaginatedResponse`)

---

## 🏗 架構概覽

```text
[ JWT Token ] --解析--> selectors/authSelectors
     |                                |
     v                                v
  authSlice (token)        derived permissions / userInfo / isExpired
     |                                |
     v                                v
  RequireAuth / PrivateRoute ----> 動態 Route/選單 (permissionRouteGenerator)
                                       |
                                       v
                                NavSidebar / TabsManager

HTTP Layer: utils/http/http.ts (Axios instance)
  -> request.ts (get/post wrapper with ApiResponse)
  -> api/* (業務 API)
```

權限模型：`PERMISSIONS` 常數 + `PERMISSION_ROUTE_MAP` 描述 path / label / icon / parentPath，產生：

1. Dynamic Route（包裹 `PrivateRoute`）
2. 選單樹 (filter by user permissions)
3. UI 控制（`withPermissions` / `hasPermission` / `hasAnyPermission` / `hasAllPermissions`）

---

## 🧪 權限與路由機制

| 元件/工具                      | 功能             | 說明                                                     |
| ------------------------------ | ---------------- | -------------------------------------------------------- |
| `RequireAuth`                  | 進入點保護       | 未登入導向 `/login`，已登入避免重回登入頁                |
| `PrivateRoute`                 | 單一路由權限檢查 | 需具備 `requiredPermission` 才渲染子元件                 |
| `permissionRouteGenerator.tsx` | 生成路由 / 選單  | Input: Permission[] → Output: RouteObject[] / MenuItem[] |
| `withPermissions` HOC          | 細粒度 UI 控制   | 缺權限即回傳 `null`                                      |
| `authSelectors`                | JWT 解析         | 無需在 slice 重覆儲存 permissions                        |

---

## 🌐 HTTP 客戶端設計

檔案：`utils/http/http.ts`

特色：

- 自動附帶 `Authorization: Bearer <token>`（從 store 讀取）
- 重試策略：指數回退（網路/5xx）
- 統一錯誤分類：NETWORK / TIMEOUT / SERVER / CLIENT / BUSINESS / UNAUTHORIZED / FORBIDDEN
- 商業錯誤（`data.code` 非 2xx）會被攔截並以 `message.error` 呈現
- 結構化 log：request/response 含耗時、追蹤 ID
- 401 自動分流 → 清理狀態 + 導向登入

簡化使用：`utils/http/request.ts` 暴露 `get<T>() / post<T,D>()`，回傳 `ApiResponse<T>`。

---

## 📦 安裝與啟動

### 需求

- Node.js 18+ (建議 LTS)
- pnpm / npm / yarn 其一（以下以 npm 為例）

### 步驟

```bash
git clone <repo-url>
cd science-park-management-system
npm install
cp .env.example .env.local   # 建立環境變數檔（若不存在）
npm run dev
```

啟動後預設訪問：<http://localhost:5173>

---

## 🔧 NPM Scripts

| 指令              | 說明                                   |
| ----------------- | -------------------------------------- |
| `npm run dev`     | 開發模式 (Vite HMR)                    |
| `npm run build`   | 建置產出 (tsc type check + Vite build) |
| `npm run preview` | 預覽 production build                  |
| `npm run lint`    | 執行 ESLint                            |

---

## 🔑 環境變數

在 `http.ts` 使用：`import.meta.env.VITE_API_URL`

建立 `.env.local` (開發)：

```env
VITE_API_URL=http://localhost:3000
VITE_ENABLE_HTTP_LOG=true   # 是否輸出詳細 HTTP log (true/false)
```

> 建議：新增 `.env.example` 供新成員複製。

---

## 🧱 型別與資料流

- DTO / 資料結構：`src/types/*`
- 分頁：`PaginatedResponse<T>`
- Tenement 建立：`CreateTenementDataType`
- JWT 封裝：`JwtToken` 類別（解析 roles / permissions / exp）

---

## 🧭 Tabs 管理

檔案：`tabsSlice.ts`

特色：

- 保證固定首頁 Tab (`/dashboard` 不可關閉)
- sessionStorage 持久化 + 結構驗證（防止壞資料）
- 操作：新增 / 關閉 / 關閉其他 / 關閉全部（保留固定）

---

## 🧪 測試 (TODO)

建議導入：

1. Vitest + React Testing Library (component & hooks 測試)
2. MSW 模擬 HTTP
3. CI：GitHub Actions 自動執行 lint + test + build

---

## 🧩 程式碼風格 & 規範

摘要（完整見 `.github/copilot-instructions.md` / 專案規約）：

- Functional Components + Hooks、避免 Class
- 嚴格 TypeScript (`strict: true`)
- Props 型別：`interface ComponentNameProps { ... }`
- 事件命名：`handleXxx`
- 避免 `any`，必要時用 `unknown` + 型別守衛
- 列表 key：穩定且唯一（避免 array index）
- Side Effects：`useEffect` 依賴明確聲明
- 優化：`useMemo`（昂貴計算）、`useCallback`（下傳 handler）
- 權限判斷集中在 utilities，不散落業務邏輯

---

## 🔐 新增一個新權限/頁面流程範例

1. 在 `constants/permissions.ts` 加入新常數 & `PERMISSION_ROUTE_MAP` 映射
2. 在 `router/routerMap.tsx` 加入懶載入頁面
3. (若需側邊選單) 在 `permissionRouteGenerator.tsx -> menuNodes` 加入節點
4. 撰寫 `pages/<module>/<NewPage>.tsx`
5. 後端簽發 JWT 加入對應 permission
6. 重新登入 → 自動看到選單/可訪問路由

---

## 📡 API 呼叫模式

範例：登入

```ts
import { login } from '@/api/users';
const { token } = await login({ account, password });
dispatch(setToken(token)); // 自動驅動權限/使用者資訊 selector
```

範例：取得能源資料

```ts
import { getEnergyData } from '@/api/dashboard';
const data = await getEnergyData();
```

錯誤處理：

- 若後端回傳 `{ code: 400, message: 'X' }` → 攔截器轉為 BUSINESS_ERROR 並以 UI 提示
- 401 → 自動導向登入

---

## 🚀 部署建議 (TODO)

1. Vite build 輸出靜態檔案 → Nginx / CDN
2. 加上 HTTP `Cache-Control` / gzip / brotli
3. 以 `VITE_API_URL` 區分 dev / staging / prod
4. 錯誤追蹤：Sentry（接 `logError` 處）

---

## 🧭 後續優化建議 (Backlog)

- [ ] 新增 `.env.example`
- [ ] 加入 Vitest + RTL 測試基礎
- [ ] 建立 CI (GitHub Actions)
- [ ] 加入路由快取 (React Router lazy boundary suspense 改良)
- [ ] Dark Mode / i18n 架構
- [ ] 整合 MSW 用於本地 API 模擬
- [ ] ECharts 主題抽象 + Lazy import config
- [ ] 權限快取策略（若 JWT 較大可拆分 / 壓縮）
- [ ] 添加 Error Boundary 統一處理渲染層錯誤

---

## 📝 授權

本專案採用 MIT License。

---

## 🙋‍♂️ 貢獻指南 (簡要)

1. fork & branch：`feature/<topic>`
2. 撰寫/更新對應文件與型別
3. 確保 `npm run lint` 通過
4. 提交 PR：說明動機 / 變更範圍 / 測試結果

---

若需更多說明或架構圖可擴增到 `docs/` 資料夾。

歡迎持續改進 🚀
