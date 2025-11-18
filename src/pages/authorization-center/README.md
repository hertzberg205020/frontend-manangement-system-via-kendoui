# Authorization Center 權限管理中心

## 概述

Authorization Center 是科學園區管理系統中的權限管理模組，提供完整的使用者、角色和權限管理功能。此模組採用 RBAC (Role-Based Access Control) 模式，讓管理員能夠靈活配置系統權限。

## 功能特色

- 📱 **使用者管理**: 新增、編輯、刪除使用者資料，管理使用者狀態
- 👥 **角色管理**: 建立和維護角色體系，設定角色權限
- 🎯 **權限設定**: 透過樹狀結構介面配置角色權限
- 📊 **狀態監控**: 即時顯示使用者數量和權限分配統計

## 專案結構

```text
src/pages/authorization-center/
├── index.tsx                 # 主頁面組件 - Tabs 容器
├── README.md                 # 專案說明文件
│
├── components/               # 功能組件
│   ├── UserManagement/       # 使用者管理模組
│   │   ├── index.tsx         # 容器組件 - 整合表格與表單
│   │   ├── UserTable.tsx     # 使用者資料表格
│   │   └── UserModal.tsx     # 使用者新增/編輯表單
│   │
│   └── RoleManagement/       # 角色管理模組
│       ├── index.tsx         # 容器組件 - 整合表格與權限設定
│       ├── RoleTable.tsx     # 角色資料表格
│       └── RoleModal.tsx     # 角色新增/編輯表單
│
├── hooks/                    # 自定義 Hooks
│   └── useAuthorizationData.ts # 權限資料管理 Hook（整合 API 呼叫）
│
├── types/                    # TypeScript 型別定義
│   └── index.ts             # 所有介面型別（包含 User, Role, Actions）
│
├── constants/                # 常數定義
│   └── index.ts             # 配置常數、訊息文字、表單規則
│
└── utils/                    # 工具函式
    └── index.ts             # 資料處理與轉換函式
```

## 核心組件說明

### 主頁面 (`index.tsx`)

- **功能**: 作為權限管理的容器組件，整合兩個主要功能模組（使用者管理、角色管理）
- **技術**: 使用 Ant Design Tabs 組件實現分頁切換
- **職責**:
  - 呼叫 `useAuthorizationData` 取得資料與操作方法
  - 將 props 傳遞給子組件
  - 管理頁面整體佈局

### useAuthorizationData Hook (`hooks/useAuthorizationData.ts`)

核心資料管理層，負責：

- **API 整合**: 呼叫 `/src/api/auth-management.ts` 中的 API 函式
- **狀態管理**: 管理 users, roles, loading 狀態
- **資料轉換**: 將 API 回應（`UserResponse`, `RoleDto`）轉換為內部型別（`User`, `Role`）
- **CRUD 操作**: 提供完整的使用者和角色 CRUD 方法
- **錯誤處理**: 統一處理 API 錯誤並顯示訊息

**提供的操作方法**:

- 使用者: `createUser`, `updateUser`, `deleteUser`, `restoreUser`, `assignRole`
- 角色: `createRole`, `updateRole`, `deleteRole`, `updatePermissions`
- 重新整理: `refetchUsers`, `refetchRoles`

### 類型定義 (`types/index.ts`)

定義了以下核心介面：

- **資料型別**:
  - `User`: 使用者資料結構（empId, name, isActive, roleIds 等）
  - `Role`: 角色資料結構（id, name, description, permissionIds 等）
  - `UserFormValues`: 使用者表單資料
  - `RoleFormValues`: 角色表單資料

- **操作介面**:
  - `UserActions`: 使用者操作集合（onAdd, onEdit, onDelete, onRestore, onAssignRole）
  - `RoleActions`: 角色操作集合（onAdd, onEdit, onDelete, onPermissionConfig）

- **API 型別**: 重新匯出 `UserResponse`, `RoleDto`, `ApiPermissionTreeNode` 以便使用

## 主要功能模組

### 1. 使用者管理 (UserManagement)

**組件結構**:

- `UserManagement/index.tsx`: 容器組件
  - 管理 Modal 和 Transfer 的開關狀態
  - 處理使用者和角色分配的業務邏輯
  - 整合 UserTable 和 UserModal

- `UserTable.tsx`: 資料表格組件
  - 顯示使用者列表（員工編號、姓名、狀態、角色）
  - 提供操作按鈕（編輯、停權/恢復、分配角色）
  - 支援分頁和載入狀態

- `UserModal.tsx`: 表單彈窗組件
  - 新增/編輯使用者表單（員工編號、姓名、密碼、狀態）
  - 表單驗證
  - 編輯模式下員工編號為唯讀

**主要功能**:

- ✅ 使用者列表展示
- ✅ 新增/編輯使用者
- ✅ 停權/恢復使用者狀態
- ✅ 角色分配（使用 Transfer 組件）

### 2. 角色管理 (RoleManagement)

**組件結構**:

- `RoleManagement/index.tsx`: 容器組件
  - 管理 Modal 和權限樹的開關狀態
  - 從 API 載入權限階層結構
  - 處理權限勾選邏輯
  - 整合 RoleTable 和 RoleModal

- `RoleTable.tsx`: 資料表格組件
  - 顯示角色列表（角色名稱、描述、建立/更新時間）
  - 提供操作按鈕（編輯、刪除、權限設定）
  - 支援分頁和載入狀態

- `RoleModal.tsx`: 表單彈窗組件
  - 新增/編輯角色表單（角色名稱、描述）
  - 表單驗證

**主要功能**:

- ✅ 角色列表展示
- ✅ 新增/編輯角色
- ✅ 刪除角色（含錯誤處理：409 衝突）
- ✅ 權限配置（使用 Tree 組件展示階層式權限）
- ✅ 動態載入權限樹資料

### 3. 權限系統架構

**權限階層**:

權限以樹狀結構組織，透過 `getPermissionsHierarchy` API 取得：

```typescript
PermissionTreeNode {
  key: string;           // 節點唯一識別
  title: string;         // 顯示名稱
  isLeaf: boolean;       // 是否為葉節點
  permissionId?: number; // 權限 ID（僅葉節點有值）
  children?: PermissionTreeNode[]; // 子節點
}
```

**權限設定流程**:

1. 點擊「權限設定」按鈕
2. 載入完整權限階層樹
3. 顯示角色目前已分配的權限（勾選狀態）
4. 管理員調整勾選項目
5. 提取所有葉節點的 `permissionId`
6. 呼叫 `updatePermissions` API 更新

## 技術棧

- **框架**: React 19+ with TypeScript
- **UI 庫**: Ant Design 5.x
- **狀態管理**: React Hooks (useState, useEffect)
- **圖示**: Ant Design Icons
- **API 通訊**: 透過 `/src/api/auth-management.ts` 呼叫後端 API
- **HTTP Client**: Axios (透過 `@/utils/http/request.ts` wrapper)

## 開發規範

### 命名慣例

- **組件名稱**: PascalCase (例: `UserManagement`, `UserTable`)
- **Hook 名稱**: camelCase with `use` prefix (例: `useAuthorizationData`)
- **檔案名稱**: PascalCase for components (例: `UserModal.tsx`)
- **型別定義**: PascalCase (例: `User`, `Role`, `UserActions`)
- **常數**: UPPER_SNAKE_CASE (例: `MESSAGES`, `FORM_RULES`)

### 檔案組織

- 每個功能模組（UserManagement, RoleManagement）獨立成資料夾
- 型別定義集中在 `types/index.ts` 管理
- 常數與工具函式分離（`constants/`, `utils/`）
- 組件內部邏輯透過 hooks 抽離（`useAuthorizationData`）

### Props 設計

- 使用 TypeScript interface 定義明確的 Props 型別
- 事件處理函式命名以 `on` 開頭 (例: `onCreateUser`, `onUpdateRole`)
- 將操作集合封裝成物件 (例: `UserActions`, `RoleActions`)
- 避免 props drilling，統一在最上層取得資料和方法

### 組件職責分離

- **容器組件** (`index.tsx`): 負責狀態管理、事件處理、API 呼叫
- **表格組件** (`*Table.tsx`): 專注於資料展示和操作按鈕
- **表單組件** (`*Modal.tsx`): 專注於表單渲染和驗證
- **Hook** (`useAuthorizationData`): 統一管理 API 呼叫和資料轉換

## 數據流與架構

### 整體架構圖

```text
┌─────────────────────────────────────────────────────────┐
│  AuthorizationCenter (index.tsx)                        │
│  - 使用 useAuthorizationData Hook                       │
│  - 透過 Tabs 切換 UserManagement / RoleManagement      │
└───────────────┬─────────────────────────────────────────┘
                │
                ├─ Props (users, roles, loading, handlers)
                │
    ┌───────────┴──────────┬──────────────────────────────┐
    │                      │                              │
    ▼                      ▼                              ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ UserManagement  │  │ RoleManagement   │  │ useAuthorization │
│                 │  │                  │  │ Data Hook        │
│ - UserTable     │  │ - RoleTable      │  │                  │
│ - UserModal     │  │ - RoleModal      │  │ - API 呼叫      │
│ - Transfer      │  │ - Tree (權限)    │  │ - 資料轉換      │
└─────────────────┘  └──────────────────┘  │ - 錯誤處理      │
                                            └────────┬─────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │ /api/auth-management │
                                          │                      │
                                          │ - getUsers()         │
                                          │ - createUser()       │
                                          │ - getRoles()         │
                                          │ - createRole()       │
                                          │ - ...等             │
                                          └──────────┬───────────┘
                                                     │
                                                     ▼
                                             [ Backend API ]
```

### 資料流說明

1. **初始化載入**:
   - `AuthorizationCenter` mount 時呼叫 `useAuthorizationData`
   - Hook 自動執行 `fetchUsers()` 和 `fetchRoles()`
   - 從後端 API 取得資料並轉換為內部型別

2. **使用者操作流程**:
   - 使用者在 UI 點擊操作按鈕（如「新增」、「編輯」）
   - 觸發 `UserManagement` 中的事件處理器
   - 呼叫從 props 傳入的 handler（如 `onCreateUser`）
   - Handler 實際執行 `useAuthorizationData` 中的對應方法
   - 方法內部呼叫 API、處理回應、更新狀態、顯示訊息
   - 操作成功後重新 fetch 資料（`fetchUsers()` / `fetchRoles()`）

3. **權限設定流程**:
   - 點擊「權限設定」按鈕
   - `RoleManagement` 呼叫 `getPermissionsHierarchy` API
   - 取得完整權限樹結構
   - 使用者調整勾選項目
   - 提取所有葉節點的 `permissionId`
   - 呼叫 `updatePermissions` 更新後端

## API 端點

所有 API 端點定義在 `/src/api/auth-management.ts`，透過 Axios 與後端溝通。

### 使用者管理

```typescript
// 取得使用者列表（支援分頁）
getUsers(params?: UserQuery): Promise<ApiResponse<PagedData<UserResponse>>>

// 建立使用者
createUser(data: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>>

// 更新使用者
updateUser(empId: string, data: UpdateUserRequest): Promise<ApiResponse<UserResponse>>

// 刪除使用者（軟刪除 - 設為停權）
deleteUser(empId: string): Promise<ApiResponse<string>>

// 恢復使用者
restoreUser(empId: string): Promise<ApiResponse<null>>

// 取得單一使用者
getUserByEmpId(empId: string): Promise<ApiResponse<UserResponse>>

// 替換使用者角色
replaceUserRoles(empId: string, data: ReplaceUserRolesRequest): Promise<ApiResponse<UserRolesDto>>
```

### 角色管理

```typescript
// 取得角色列表
getRoles(): Promise<ApiResponse<RoleDto[]>>

// 建立角色
createRole(data: CreateRoleRequest): Promise<ApiResponse<RoleDto>>

// 更新角色
updateRole(id: number, data: UpdateRoleRequest): Promise<ApiResponse<RoleDto>>

// 刪除角色
deleteRole(id: number): Promise<ApiResponse<null>>

// 取得單一角色
getRoleById(id: number): Promise<ApiResponse<RoleDto>>

// 替換角色權限
replaceRolePermissions(roleId: number, data: ReplaceRolePermissionsRequest): Promise<ApiResponse<RolePermissionsDto>>
```

### 權限管理

```typescript
// 取得權限階層結構（樹狀）
getPermissionsHierarchy(): Promise<ApiResponse<PermissionTreeNode[]>>
```

### 型別定義

主要 API 請求與回應型別：

```typescript
// 使用者相關
interface UserResponse {
  empId: string;
  name: string;
  isActive: boolean;
  roleIds: number[];
  createdAt: string;
  updatedAt: string;
}

interface CreateUserRequest {
  empId: string;
  name: string;
  password: string;
  roleIds: number[];
}

interface UpdateUserRequest {
  name: string;
  isActive: boolean;
}

// 角色相關
interface RoleDto {
  id: number;
  name: string;
  description?: string;
  permissionIds: number[];
  createdAt: string;
  updatedAt: string;
}

interface CreateRoleRequest {
  name: string;
  description?: string;
}

interface UpdateRoleRequest {
  name: string;
  description?: string;
}

// 權限樹
interface PermissionTreeNode {
  key: string;
  title: string;
  isLeaf: boolean;
  permissionId?: number;
  children?: PermissionTreeNode[];
}
```

## 後續開發計畫

### 已完成功能 ✅

- [x] 使用者 CRUD 操作
- [x] 角色 CRUD 操作
- [x] 角色權限配置
- [x] 使用者角色分配
- [x] 權限階層樹狀展示
- [x] 整合後端 API
- [x] 錯誤處理與訊息提示
- [x] 表單驗證

### 短期優化 🎯

- [ ] 使用者列表搜尋與篩選功能
- [ ] 角色列表搜尋與篩選功能
- [ ] 表格排序功能
- [ ] 批量操作（批量刪除、批量分配角色）
- [ ] 操作確認對話框優化

### 中期目標 📋

- [ ] 新增權限總覽頁面（權限矩陣展示）
- [ ] 實作操作日誌記錄
- [ ] 優化效能（使用 useMemo, useCallback）
- [ ] 加入單元測試
- [ ] 響應式設計優化（移動端適配）

### 長期目標 🚀

- [ ] 支援動態權限配置（無需重新部署）
- [ ] 實作權限分析報表
- [ ] 加入權限模板功能
- [ ] 整合第三方身份驗證（SSO）
- [ ] 多租戶權限管理

## 疑難排解

### 常見問題

**Q: 權限設定後沒有生效？**

A: 檢查以下項目：

1. 確認 `updatePermissions` 是否正確執行
2. 檢查 `extractPermissionIds` 是否正確提取葉節點 ID
3. 確認 API 回應狀態碼為 200
4. 重新整理資料確認 `permissionIds` 已更新

**Q: 新增使用者時表單驗證失敗？**

A:

1. 確認 `constants/index.ts` 中的 `FORM_RULES` 設定正確
2. 檢查表單欄位的 `name` 屬性是否與驗證規則對應
3. 密碼欄位在新增時為必填，編輯時可選

**Q: 刪除角色時出現 409 錯誤？**

A: 該角色已分配給一或多位使用者，需先解除分配才能刪除。錯誤訊息會自動顯示對應提示。

**Q: 使用者列表沒有顯示角色名稱？**

A:

1. 確認 `roles` 資料已正確載入
2. 檢查 `UserTable` 中的 `getRoleNames` 函式邏輯
3. 確認 `user.roleIds` 與 `roles` 的 `id` 欄位對應正確

**Q: 權限樹狀結構沒有展開？**

A: 在 Tree 組件中設定 `defaultExpandAll` prop 為 `true`

### 除錯建議

1. **使用 React DevTools** 檢查組件 props 和 state
2. **查看 Network Tab** 確認 API 請求與回應格式
3. **檢查 Console** 查看錯誤訊息和 API 呼叫日誌
4. **TypeScript 編譯錯誤** 執行 `npm run type-check`
5. **Lint 錯誤** 執行 `npm run lint`

### API 錯誤處理

常見 HTTP 狀態碼處理：

- **400 Bad Request**: 檢查請求參數格式
- **401 Unauthorized**: 檢查 Token 是否有效
- **403 Forbidden**: 檢查使用者權限
- **404 Not Found**: 資源不存在
- **409 Conflict**: 資料衝突（如角色已分配給使用者）
- **500 Server Error**: 後端錯誤，聯絡後端開發人員

## 貢獻指南

1. **遵循 TypeScript 嚴格模式**：確保所有型別定義完整
2. **同步更新型別定義**：新增功能時同步更新 `types/index.ts`
3. **撰寫清晰註解**：特別是複雜的業務邏輯和資料轉換
4. **保持一致的設計模式**：
   - 容器組件 vs 展示組件
   - Props 命名慣例
   - 事件處理模式
5. **API 錯誤處理**：使用統一的錯誤處理方式
6. **提交前檢查**：
   - 執行 `npm run lint` 確保 ESLint 通過
   - 執行 `npm run type-check` 確保型別正確
   - 測試所有 CRUD 操作
7. **Git Commit Message**：遵循 Conventional Commits 規範
   - `feat:` 新功能
   - `fix:` 修復 bug
   - `refactor:` 重構
   - `docs:` 文件更新
   - `style:` 程式碼格式調整

## 元件依賴關係圖

```text
AuthorizationCenter
├── useAuthorizationData (Hook)
│   └── /api/auth-management
│       ├── getUsers()
│       ├── createUser()
│       ├── updateUser()
│       ├── deleteUser()
│       ├── restoreUser()
│       ├── replaceUserRoles()
│       ├── getRoles()
│       ├── createRole()
│       ├── updateRole()
│       ├── deleteRole()
│       ├── replaceRolePermissions()
│       └── getPermissionsHierarchy()
│
├── UserManagement
│   ├── UserTable (展示使用者列表)
│   ├── UserModal (新增/編輯使用者表單)
│   └── Transfer (角色分配組件 - Ant Design)
│
└── RoleManagement
    ├── RoleTable (展示角色列表)
    ├── RoleModal (新增/編輯角色表單)
    └── Tree (權限設定樹 - Ant Design)
```

---

📝 **最後更新**: 2025年11月18日
👨‍💻 **維護者**: 開發團隊
🏷️ **版本**: v2.0.0
✨ **狀態**: 已完成後端整合，生產環境就緒
