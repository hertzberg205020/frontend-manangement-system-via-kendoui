# Authorization Center 前端重構計畫（增量實作）

> 目標：將目前完全依賴硬編碼與本地 state 的授權中心（使用者 / 角色 / 權限）頁面，逐步重構為可對接後端 API、具可維護性與擴充性的模組。採用「低風險、可回滾、可觀測」的增量策略。

---

## 🌐 全域原則

- 優先避免一次性大改，確保每階段可部署且不破壞既有功能。
- 每階段完成後：
  - 型別狀態合法（無 any 暫時污染）
  - 可在瀏覽器實際操作基本流程
  - Console 無新錯誤 (error/warn)
  - 重要操作（新增/更新/刪除）都有錯誤處理
- 新增代碼需符合專案既有規範（React + TS + AntD + axios 封裝 http.ts）。
- 未來若導入 RTK Query / React Query，介面設計需具相容性。

---

## 🧭 階段藍圖總覽

| 階段 | 名稱                 | 核心產出                                  | 可回滾點       | 風險等級 |
| ---- | -------------------- | ----------------------------------------- | -------------- | -------- |
| P0   | 基礎 API 封裝        | `authorization.ts` API                    | 移除檔案       | 低       |
| P1   | Hook 雙層資料來源    | `useAuthorizationData` 支援 mock+API 切換 | 還原 hook      | 低       |
| P2   | 型別過渡             | 新增 `roleIds` 等                         | 移除新欄位     | 中       |
| P3   | 使用者 CRUD 接 API   | User CRUD 改 API                          | 切回 mock flag | 中       |
| P4   | 角色 CRUD 接 API     | Role CRUD 改 API                          | 同上           | 中       |
| P5   | 權限資源載入 API 化  | resources/permissions 改 API              | fallback mock  | 中       |
| P6   | 角色權限設定實作     | PermissionModal 受控 + 提交               | 關閉功能開關   | 高       |
| P7   | 使用者角色分配       | 新增分配角色 Modal                        | 關閉功能開關   | 高       |
| P8   | 清理硬編碼與遺留欄位 | 移除 roles:string[]                       | 版本回滾       | 中       |
| P9   | 最佳化與快取         | 引入 cache / loading skeleton             | 停用快取       | 中       |

---

## 🔧 P0：建立 API 封裝

**目的**：集中未來呼叫點，避免散落 axios 邏輯。

**工作**：

- 建立：`src/api/authorization.ts`
- 封裝：getUsers / createUser / updateUser / deleteUser / getRoles / createRole / updateRole / deleteRole / getResources / getPermissions / getRolePermissions / updateRolePermissions / updateUserRoles / getAuthMe
- 型別：UserDTO / RoleDTO / PermissionDTO / ResourceDTO / PaginatedResponse
- 錯誤：沿用 http.ts 的攔截結果；函式返回已解包 data。

**驗收**：可以在 Story / Console 中手動呼叫並返回 mock/實際資料（若後端未 ready 可暫時回傳 Promise.resolve(mock)）。

---

## 🔁 P1：Hook 支援「來源策略」

**目的**：允許以 feature flag 漸進切換。

**工作**：

- `useAuthorizationData` 新增參數或環境變數：`USE_AUTH_API`。
- 若為 false → 使用現有硬編碼；true → 走 API。
- 新增 loading / error 狀態（例如：`const [loading,setLoading] = ...`）。
- UI 於 Table 外層顯示 Spin。

**驗收**：切換 flag 不報錯；UI 行為一致。

---

## 🧱 P2：型別過渡

**目的**：為避免一次性重構破壞現有顯示，採雙軌策略。

**工作**：

- `types/index.ts`：
  - 新增 `roleIds?: number[]` 至 User
  - 新增 `is_system?: boolean` 至 Role
  - 新增 `PermissionAction = 'read' | 'create' | 'edit' | 'delete'`（避免廣義 string）
- 將現有使用 `roles: string[]` 的顯示邏輯以 fallback：

```ts
const displayRoles = user.roleIds && roles.length
  ? roles.filter(r => user.roleIds!.includes(r.id)).map(r => r.name)
  : user.roles;
```

**驗收**：不破壞現有畫面；TS 無新增嚴重錯誤。

---

## 👤 P3：使用者 CRUD API 化

**目的**：最先驗證 API 串接路徑與錯誤流程。

**工作**：

- 以 flag 控制 create/update/delete 流程是否呼叫 API。
- 新增 try/catch → 失敗回滾本地 optimistic 更新。
- 新增刪除前「是否為最後一個管理員」的守護（若後端尚未提供則前端暫時不做或註記 TODO）。

**驗收**：成功/失敗情境 message 顯示正確；失敗不殘留髒資料。

---

## 🛡️ P4：角色 CRUD API 化

**工作**：

- 同 P3 模式。
- 刪除角色 → 若後端回 409 → 顯示對應 message。
- 更新角色後同步刷新列表（避免 permission_count 不正確）。

**驗收**：快取清理 / 列表資料一致。

---

## 📚 P5：資源與權限載入

**目的**：允許權限樹與權限總覽反映真實後端。

**策略**：若 API 失敗 → fallback 用前端內建靜態（附上 warning log）。

**工作**：

- 於 hook 中新增：`fetchResources` / `fetchPermissions`
- 加入簡易快取（記憶體 ref）避免多次進入重複請求。

**驗收**：重新整理後仍正確載入；失敗時不阻斷其他操作。

---

## 🌲 P6：角色權限設定真正實作

**目的**：讓 PermissionModal 具備讀取 + 編輯功能。

**工作**：

- Modal 開啟：
  - 加載該角色的 permissionIds
  - 設定 `checkedKeys`
- 點擊儲存：
  - 呼叫 `updateRolePermissions(role.id, { permissionIds })`
  - 成功 → 更新角色 permission_count (依照回傳或重新 GET)
- UI 改為：使用 `Tree` 的 `checkedKeys` 受控；新增 loading 狀態。
- Edge：若後端移除部分 permission → 自動過濾並提示。

**驗收**：連續開關 Modal state 不遺失；儲存後重新開啟維持最新。

---

## 🧩 P7：使用者角色分配功能

**工作**：

- 新增 `UserRoleAssignModal`：顯示所有角色 + Checkbox/Transfer。
- 打開時：GET /api/users/:id/roles（或使用 user.roleIds）
- 提交：PUT /api/users/:id/roles { roleIds }
- 成功後：更新使用者列表該筆紀錄的 roleIds。
- 若為當前登入者 → 觸發 `/api/auth/me` 刷新。

**驗收**：角色變更後列表即時反映；取消不改動。

---

## 🧹 P8：清理與去硬編碼

**工作**：

- 移除初始硬編碼陣列。
- 移除 `User.roles: string[]`，全面改 `roleIds`。
- Utils：刪除 `generateId`（改後端 id）。
- README / docs 更新：說明需要後端 API。

**驗收**：搜尋專案不存在殘留 mock 陣列（grep user_count 初始化等）。

---

## ⚙️ P9：最佳化與快取

**建議技術**：

- 可導入 React Query（或 RTK Query）抽象快取：
  - Key: ['users', page, filters] / ['roles'] / ['permissions'] / ['resources']
- Skeleton / Placeholder 加入：Table 空狀態、權限樹載入中。
- 失效策略：
  - 更新角色權限 → 失效 ['roles','permissions']
  - 更新使用者角色 → 失效 ['users',id] + ['auth','me']

---

## ✅ 驗收清單（總表）

| 項目           | 完成條件                         | 驗證方式           |
| -------------- | -------------------------------- | ------------------ |
| API 封裝       | 所有函式已匯出並 TS 型別正確     | tsc / 單次調用測試 |
| 切換資料來源   | Flag 切換不報錯                  | 本地 .env 變更     |
| User CRUD      | 新增/編輯/刪除成功與失敗都有回饋 | 操作 UI            |
| Role CRUD      | 同上                             | 操作 UI            |
| 資源/權限載入  | API 成功顯示，失敗 fallback      | 模擬 500           |
| 角色權限設定   | 勾選保存後再開啟一致             | 兩次操作比對       |
| 使用者角色分配 | 指派後列表同步                   | 視覺檢查           |
| 移除硬編碼     | 搜尋不到初始陣列                 | grep 驗證          |
| 型別清理       | 無 `any` 漏出                    | tsc                |
| 快取策略       | 重複進入頁面無多次相同請求       | Network Panel      |

---

## 🧪 測試建議（未來可擴充）

| 類別            | 測試案例                                        |
| --------------- | ----------------------------------------------- |
| Hook            | 來源 flag 切換、失敗 fallback、loading 狀態順序 |
| User Flow       | 新增 → 編輯 → 刪除 → 重新載入仍一致             |
| Role Flow       | 新增後立即分配權限仍正常                        |
| PermissionModal | 勾選後取消不應改變資料                          |
| AssignRoleModal | 勾選變更後保存 + 再次開啟一致                   |
| 錯誤回滾        | 建立後 API 失敗 → UI 還原、顯示錯誤             |

---

## 🛑 風險與緩解

| 風險                        | 緩解                                            |
| --------------------------- | ----------------------------------------------- |
| API 尚未就緒                | 建 mock adapter / feature flag                  |
| 權限樹資料量過大            | 分批載入 or 後端提供樹結構                      |
| 角色/權限更新造成快取不一致 | 統一封裝失效函式 invalidateAuthorizationCache() |
| 重構中破壞其他頁面引用      | 把新 API 放入獨立檔案 + 僅授權中心引用          |

---

## 📌 決策紀錄（Architecture Decision Hints）

| 決策                 | 原因             | 備註                |
| -------------------- | ---------------- | ------------------- |
| 保留 mock → API 雙軌 | 降低一次性風險   | 以 flag 統一控制    |
| 先不導入 React Query | 降低初期複雜度   | 後續 P9 再評估      |
| roleIds 取代 roles   | 建立穩定關聯     | 過渡期支援 fallback |
| permissionIds 懶載入 | 減少初始 payload | Modal 開啟時載入    |

---

## 🔄 執行節奏建議

- 每階段提交 PR：命名 `feat/auth-refactor-p{N}`
- PR 模板包含：變更摘要 / 破壞性風險 / 測試步驟 / 截圖
- 通過後才進入下一階段

---

## 🚀 下一步建議立即執行

1. 建立 `authorization.ts`（P0）
2. 為 hook 加入 flag 與 loading/error（P1）
3. 推送 PR 驗證 CI 通過

---

**若需要我可以直接開始執行 P0。請指示。**
