# Authorization Center 分析報告

> 本文件說明 `src/pages/authorization-center` 目錄下授權 / 使用者 / 角色 / 權限管理頁面目前的前端實作狀態、資料流、問題點與後端 API 整合建議。

## 1. 目錄與組成概覽

```txt
authorization-center/
  index.tsx                # 主頁面 (Tabs: 使用者 / 角色 / 權限總覽)
  hooks/
    useAuthorizationData.ts # 目前所有資料的來源 (硬編碼 + 本地 state 操作)
  components/
    UserManagement/
      index.tsx
      UserTable.tsx
      UserModal.tsx
    RoleManagement/
      index.tsx
      RoleTable.tsx
      RoleModal.tsx
    PermissionOverview/
      index.tsx
      PermissionCard.tsx
    PermissionModal/
      index.tsx             # 角色權限設定 (目前僅 UI 無資料綁定)
  constants/index.ts        # UI 常數：表單規則 / 訊息 / 分頁設定
  types/index.ts            # 型別定義 (User/Role/Permission/Resource 等)
  utils/index.ts            # 工具：權限樹轉換、action 文字、ID/日期
```

## 2. 主頁面與資料流

### AuthorizationCenter (index.tsx)

- 使用 `useAuthorizationData` 取得全部清單 (users / roles / resources / permissions)
- 三個分頁：
  1. 使用者管理 → `UserManagement`
  2. 角色管理 → `RoleManagement`
  3. 權限總覽 → `PermissionOverview`
- 權限設定按鈕 (於角色列表) 會開啟 `PermissionModal`
- 目前所有資料為前端狀態 (無網路請求)

### useAuthorizationData

| State       | 說明       | 現況   | 問題                                       |
| ----------- | ---------- | ------ | ------------------------------------------ |
| users       | 使用者清單 | 硬編碼 | 無法同步後端 / ID 本地產生 / roles 僅字串  |
| roles       | 角色清單   | 硬編碼 | user_count / permission_count 不會實際變動 |
| resources   | 系統資源   | 硬編碼 | 無法反映後端模組調整                       |
| permissions | 權限清單   | 硬編碼 | 無角色關聯 / 無層級                        |

操作方法（全部僅改本地 state）：

- createUser / updateUser / deleteUser
- createRole / updateRole / deleteRole
- assignRole：僅顯示 message (未實作)
- updatePermissions：僅顯示 message (未更新)

### UserManagement

- Table + Modal CRUD
- 分配角色按鈕僅觸發 `assignRole` (無 UI, 無資料結構)
- `User.roles` 是字串陣列（應改為 roleIds 或包含 Role 物件）

### RoleManagement

- Table + Modal CRUD + 權限設定按鈕
- 刪除/新增/編輯同樣在前端本地 state
- 權限數 / 使用者數僅為靜態欄位

### PermissionOverview

- 顯示每個資源下的權限，純呈現
- 無任何互動或過濾

### PermissionModal

- 以 `generatePermissionTreeData` 生成 Antd Tree (checkable)
- 目前：
  - 缺少 `checkedKeys` 控制與回填角色現有權限
  - 儲存只呼叫 `updatePermissions()`，未提交任何資料
  - 未綁定角色 → 權限資料未真正修改

### utils

- `generatePermissionTreeData`：根據 resources + permissions 組合
- `generateId`：使用 Date.now()（與後端整合後改由後端回傳）

### types 目前限制

- `User.roles: string[]` → 缺少 role id 關聯
- `Role` 缺少 permissionIds / is_system
- `Permission.action` 無限定型別 (建議 union type)
- 無分頁介面型別 (若後端有分頁)

## 3. 必須後端化的資料與行為

| 項目           | 目前        | 需改為                                   | 說明                     |
| -------------- | ----------- | ---------------------------------------- | ------------------------ |
| 使用者列表     | 硬編碼      | GET /api/users                           | 支援過濾 / 分頁 / 排序   |
| 新增使用者     | 本地 push   | POST /api/users                          | 後端產生 id / created_at |
| 更新使用者     | 本地 map    | PATCH /api/users/:id                     | 局部更新                 |
| 刪除使用者     | 本地 filter | DELETE /api/users/:id                    | 檢查角色關聯             |
| 使用者角色分配 | 未實作      | PUT /api/users/:id/roles                 | 傳 roleIds               |
| 角色列表       | 硬編碼      | GET /api/roles                           | 附帶統計欄位             |
| 新增角色       | 本地 add    | POST /api/roles                          | 名稱唯一檢查             |
| 更新角色       | 本地 map    | PATCH /api/roles/:id                     | 系統角色保護             |
| 刪除角色       | 本地 filter | DELETE /api/roles/:id                    | 使用中禁止刪除           |
| 資源列表       | 硬編碼      | GET /api/resources                       | 可快取                   |
| 權限列表       | 硬編碼      | GET /api/permissions                     | 或嵌在資源裡             |
| 角色權限讀取   | 無          | GET /api/roles/:id/permissions           | 用於 Modal 初始勾選      |
| 角色權限更新   | 假動作      | PUT /api/roles/:id/permissions           | 傳 permissionIds         |
| 使用者有效權限 | 無          | GET /api/users/:id/effective-permissions | Optional 快取            |
| 當前登入者資訊 | 由他處處理  | GET /api/auth/me                         | 整合 roles + permissions |

## 4. 建議後端資料模型

```sql
users (id, emp_id, name, is_active, created_at, updated_at)
roles (id, name, description, is_system, created_at, updated_at)
permissions (id, resource_id, action, description)
resources (id, code, description, is_active)
user_roles (user_id, role_id)
role_permissions (role_id, permission_id)
```

## 5. 前端型別重構建議

```ts
interface User {
  id: number;
  emp_id: string;
  name: string;
  is_active: boolean;
  roleIds: number[];        // 取代舊 roles: string[]
  created_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  permissionIds?: number[]; // 懶載入
  user_count: number;
  permission_count: number;
  created_at: string;
}

interface Permission {
  id: number;
  resource_id: number;
  action: 'read' | 'create' | 'edit' | 'delete';
  description: string;
}

interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

## 6. 權限設定流程（前端）

1. 開啟 `PermissionModal` → 若尚未有角色權限，呼叫 `GET /api/roles/:id/permissions`
2. 同步載入（如未載入過）`resources` + `permissions`
3. 用 permissionIds 建立 `checkedKeys`
4. 使用者調整勾選 → 暫存本地 state
5. 儲存 → `PUT /api/roles/:id/permissions { permissionIds }`
6. 成功後：更新 `roles` 中該角色的 `permission_count`，必要時刷新登入者權限

## 7. 使用者角色分配流程

1. 新增「分配角色」Modal (尚未存在)
2. 載入所有角色 (若未載入) + 使用者現有 roleIds
3. 勾選 → `PUT /api/users/:id/roles { roleIds }`
4. 更新列表該使用者的 roleIds (或映射成角色名稱顯示)
5. 若為當前登入者 → 再呼叫 `/api/auth/me`

## 8. API 介面草稿

```ts
// src/api/authorization.ts (建議新增)
export interface UserDTO { id:number; emp_id:string; name:string; is_active:boolean; roleIds:number[]; created_at:string; }
export interface RoleDTO { id:number; name:string; description:string; is_system:boolean; user_count:number; permission_count:number; created_at:string; }
export interface ResourceDTO { id:number; code:string; description:string; is_active:boolean; }
export interface PermissionDTO { id:number; resource_id:number; action:string; description:string; }
export interface PaginatedResponse<T> { items:T[]; total:number; page:number; pageSize:number; }

// Users
GET    /api/users
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/roles { roleIds:number[] }

// Roles
GET    /api/roles
POST   /api/roles
PATCH  /api/roles/:id
DELETE /api/roles/:id
GET    /api/roles/:id/permissions
PUT    /api/roles/:id/permissions { permissionIds:number[] }

// Resources & Permissions
GET    /api/resources
GET    /api/permissions

// Auth / Session
GET    /api/auth/me
```

## 9. 重構實施優先順序 (建議增量)

1. 新增 API 封裝 (`src/api/authorization.ts`)
2. 重寫 `useAuthorizationData` -> 改為載入 & 提供 loading/error
3. 調整型別 (新增 roleIds，暫時保留舊 roles 相容)
4. 新增「分配角色」Modal + 功能
5. 改造 `PermissionModal` (受控 checkedKeys + 提交)
6. 移除硬編碼陣列 & 清理 generateId / created_at 本地生成
7. 最後移除舊 `roles: string[]`

## 10. 邊界與錯誤情境

| 情境                     | 建議處理                                    |
| ------------------------ | ------------------------------------------- |
| 刪除仍被使用者引用的角色 | 後端回 409 → 前端顯示「角色仍被使用者使用」 |
| 權限下架但角色仍擁有     | Modal 載入時過濾無效權限並提示              |
| 使用者已停用             | UI 顯示 badge 並在登入流程阻擋              |
| 系統內建角色不可修改     | is_system=true → 隱藏刪除/限制編輯          |
| 連線失敗                 | 利用現有 http.ts 的錯誤攔截顯示重試或提示   |

## 11. 風險與建議

| 風險                 | 緩解策略                                                 |
| -------------------- | -------------------------------------------------------- |
| 初次重構影響其他頁面 | 封裝於新 API 檔案 + 漸進替換                             |
| 權限與角色資料量增大 | 加入分頁 / Lazy 載入權限樹                               |
| 前端快取失同步       | 角色/權限更新後失效相關快取 (可用 React Query/RTK Query) |
| 權限樹維護難度       | 後端提供結構化樹資料避免前端組合過多                     |

## 12. 後續可選強化

- 導入 React Query / RTK Query 作為資料快取層
- 加入操作審計 (變更記錄) 視圖
- 權限差異比較（儲存前 vs 變更後）
- 批次匯入/匯出角色與權限策略 JSON

---
**結論**：目前 Authorization Center 完全依賴前端硬編碼與本地 state；為導入真實後端需先抽象 API 層並重構核心 hook，然後再逐步補齊「角色權限設定」「使用者角色分配」兩個尚未真正實作的關鍵流程。

> 若需要，我可以下一步直接建立 `src/api/authorization.ts` 並調整 `useAuthorizationData`。請告知。
