# Authorization Center 數據流分析報告

## 📊 當前數據流架構

### 現況分析 (Current State)

```ascii
┌─────────────────────────────────────────────────────────────┐
│  UI 層 (Components)                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │ UserMgmt    │  │ RoleMgmt    │  │ PermissionOverview│   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘    │
│         │                 │                   │              │
│         └─────────────────┼───────────────────┘              │
│                           ↓ 使用/依賴                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         index.tsx (主頁面 - 組合層)                     │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           ↓ 依賴                             │
├───────────────────────────────────────────────────────────────┤
│  Business Logic 層                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         useAuthorizationData Hook                       │ │
│  │         (狀態管理 + useState 硬編碼資料)                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

圖例說明：
↓ 依賴方向 (上層依賴下層)
```

**數據來源**: 全部硬編碼在 `useAuthorizationData.ts` 的 `useState` 初始值中

**數據類型**:

- Users: 3 筆模擬數據
- Roles: 3 筆模擬數據
- Resources: 4 筆模擬數據
- Permissions: 9 筆模擬數據

---

## 🎯 遷移目標架構

### 提案方案 (Proposed State - Service Layer Pattern)

```ascii
┌─────────────────────────────────────────────────────────────┐
│  UI 層 (Components)                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │ UserMgmt    │  │ RoleMgmt    │  │ PermissionOverview│   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘    │
│         │                 │                   │              │
│         └─────────────────┼───────────────────┘              │
│                           │ 依賴                             │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         index.tsx (主頁面 - 組合層)                     │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │ 依賴                             │
│                           ↓                                  │
├───────────────────────────────────────────────────────────────┤
│  Business Logic 層                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         useAuthorizationData Hook                       │ │
│  │         (狀態管理 + 業務邏輯)                            │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │ 依賴                             │
│                           ↓                                  │
├───────────────────────────────────────────────────────────────┤
│  Service 層 (數據來源抽象)                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         getAuthorizationService()                       │ │
│  │         (Factory - 根據配置選擇實作)                     │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │ 創建                             │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         IAuthorizationService (Interface)               │ │
│  │         (統一的服務契約)                                 │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │ 實作                             │
│         ┌─────────────────┴─────────────────┐              │
│         ↓                                   ↓              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │ MockAuthService  │              │ ApiAuthService   │    │
│  └────────┬─────────┘              └────────┬─────────┘    │
│           │ 依賴                             │ 依賴         │
│           ↓                                  ↓              │
├───────────────────────────────────────────────────────────────┤
│  Data 層 (數據源)                                            │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │ Local Mock Data  │              │ authorization.ts │    │
│  │ (記憶體數據)      │              │ (HTTP API)       │    │
│  └──────────────────┘              └────────┬─────────┘    │
│                                              │ 依賴         │
│                                              ↓              │
│                                    ┌──────────────────┐    │
│                                    │ Backend API      │    │
│                                    └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘

圖例說明：
→ 依賴方向 (上層依賴下層，下層不知道上層存在)
↓ 創建/實作關係
```

## 🔄 數據遷移方案對比

### 方案 A: 採用 Service Layer Pattern（推薦）✅

#### 優點 ✅

1. **統一介面抽象化**
   - 透過 `IAuthorizationService` 定義標準契約
   - Mock 和 API 實作必須遵循相同的方法簽名
   - TypeScript 確保型別安全

2. **關注點分離**
   - Hook 專注於狀態管理與業務邏輯
   - Service 層統一管理數據來源（Mock 或真實 API）
   - 各層職責清晰明確

3. **切換便利性**
   - 透過環境變數 `VITE_USE_MOCK_AUTH_DATA` 輕鬆切換
   - Factory Pattern 自動選擇對應實作
   - 不需修改 Hook 或 Component 代碼

4. **易於測試**
   - Service 層可獨立進行單元測試
   - Hook 層可注入 Mock Service 進行測試
   - 完全解耦的架構設計

5. **符合 SOLID 原則**
   - Single Responsibility: 每層職責單一
   - Open/Closed: 易於擴展新實作
   - Dependency Inversion: 依賴抽象接口

6. **符合計畫路線圖**
   - 完全符合 `plan.md` 中的 P0-P1 階段設計
   - 為後續 P3-P9 的 API 接入打下堅實基礎

7. **可擴展性**
   - 未來可輕鬆加入 CachedService、OfflineService
   - 支援 A/B Testing 或灰度發布
   - 支援多種數據源策略

#### 缺點 ❌

1. **初期學習成本**
   - 團隊成員需理解 Service Layer Pattern
   - 需要熟悉 Interface 與 Factory 模式
   - 已提供完整文檔緩解此問題

2. **檔案數量增加**
   - 新增 5 個 Service 相關檔案
   - 需要維護 Interface, Mock,API 三個層次
   - 但換來更好的可維護性

3. **型別同步成本**
   - Mock 數據結構需與 DTO 型別保持一致
   - 後端 API 變更時需同步更新 Mock 和 Mapper
   - 可透過自動化測試降低風險

4. **記憶體開銷**
   - Mock 數據會常駐記憶體（但數據量極小，可忽略）

## 📐 實施建議：方案 A 的詳細設計

### 1. 目錄結構調整

```typescript
src/pages/authorization-center/
├── api/
│   └── authorization.ts         # API 封裝（後端通訊）
├── services/                    # ⭐ 新增：Service 層
│   ├── IAuthorizationService.ts       # 統一接口定義
│   ├── MockAuthorizationService.ts    # Mock 實作
│   ├── ApiAuthorizationService.ts     # API 實作
│   ├── AuthorizationServiceFactory.ts # Service 工廠
│   └── index.ts                       # 統一匯出
├── hooks/
│   └── useAuthorizationData.ts  # 修改：使用 Service 層
├── types/
│   └── index.ts                 # 型別定義（需同步 DTO）
└── constants/
    └── index.ts                 # 新增 Feature Flag 常數
```

### 2. Service Interface 設計 ⭐ 核心重點

**新增檔案**: `services/IAuthorizationService.ts`

```typescript
/**
 * 統一的授權服務接口
 * 所有數據操作都透過此接口進行
 */
export interface IAuthorizationService {
  // 使用者相關
  getUsers(params?: PaginationQuery): Promise<PaginatedResponse<UserDTO>>;
  createUser(data: Partial<UserDTO>): Promise<UserDTO>;
  updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO>;
  deleteUser(id: number): Promise<{ success: boolean } | string>;
  updateUserRoles(userId: number, payload: UpdateUserRolesPayload): Promise<{
    userId: number;
    roleIds: number[];
  }>;

  // 角色相關
  getRoles(): Promise<RoleDTO[]>;
  createRole(data: Partial<RoleDTO>): Promise<RoleDTO>;
  updateRole(id: number, data: Partial<RoleDTO>): Promise<RoleDTO>;
  deleteRole(id: number): Promise<{ success: boolean } | string>;
  getRolePermissions(roleId: number): Promise<RolePermissionsResponse>;
  updateRolePermissions(
    roleId: number,
    payload: UpdateRolePermissionsPayload
  ): Promise<RolePermissionsResponse>;

  // 資源與權限
  getResources(): Promise<ResourceDTO[]>;
  getPermissions(): Promise<PermissionDTO[]>;

  // 認證
  getAuthMe(): Promise<AuthMeDTO>;
}
```

**優勢**:

1. **統一介面**: Mock 和 API 實作必須遵循相同的方法簽名
2. **易於切換**: 透過 Factory Pattern 動態選擇實作
3. **類型安全**: TypeScript 確保所有實作符合接口
4. **易於測試**: 可輕鬆注入 Mock Service 進行單元測試

### 3. Mock Service 實作

**新增檔案**: `services/MockAuthorizationService.ts`

```typescript
/**
 * Mock 數據服務實作
 * 實現 IAuthorizationService 接口
 */
export class MockAuthorizationService implements IAuthorizationService {
  private config: Required<ServiceConfig>;

  constructor(config?: Partial<ServiceConfig>) {
    this.config = {
      useMock: true,
      mockDelay: config?.mockDelay ?? 300,
      mockErrorRate: config?.mockErrorRate ?? 0,
      baseUrl: config?.baseUrl ?? '',
    };
  }

  async getUsers(params: PaginationQuery = {}): Promise<PaginatedResponse<UserDTO>> {
    await delay(this.config.mockDelay);
    // Mock 數據邏輯
    // 支援搜尋、分頁等功能
    return { /* ... */ };
  }

  // 其他方法實作...
}
```

**新增檔案**: `services/ApiAuthorizationService.ts`

```typescript
/**
 * API 服務實作
 * 實現 IAuthorizationService 接口
 */
export class ApiAuthorizationService implements IAuthorizationService {
  async getUsers(params: PaginationQuery = {}): Promise<PaginatedResponse<UserDTO>> {
    return authApi.getUsers(params); // 直接調用 authorization.ts
  }

  // 其他方法實作...
}
```

### 4. Service Factory 設計

**新增檔案**: `services/AuthorizationServiceFactory.ts`

```typescript
/**
 * Service 工廠
 * 根據配置創建對應的 Service 實例
 */
export class AuthorizationServiceFactory {
  static createService(config?: Partial<ServiceConfig>): IAuthorizationService {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    if (finalConfig.useMock) {
      return new MockAuthorizationService(finalConfig);
    } else {
      return new ApiAuthorizationService();
    }
  }

  static getInstance(): IAuthorizationService {
    // 單例模式
  }
}

// 便捷函式
export function getAuthorizationService(): IAuthorizationService {
  return AuthorizationServiceFactory.getInstance();
}
```

### 5. Hook 層重構

**修改檔案**: `hooks/useAuthorizationData.ts`

```typescript
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { getAuthorizationService } from '../services'; // ⭐ 使用 Service
import type { User, Role } from '../types';

export const useAuthorizationData = () => {
  const service = getAuthorizationService(); // ⭐ 取得 Service 實例
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          service.getUsers(), // ⭐ 透過 Service 調用
          service.getRoles(),
        ]);
        setUsers(mapUserDTOToUser(usersRes.data));
        setRoles(mapRoleDTOToRole(rolesRes));
      } catch (err) {
        message.error('載入數據失敗');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const createUser = async (values: UserFormValues): Promise<void> => {
    try {
      const newUser = await service.createUser(values); // ⭐ 透過 Service
      setUsers(prev => [...prev, mapUserDTOToUser([newUser])[0]]);
      message.success('使用者建立成功');
    } catch (err) {
      message.error('建立失敗');
    }
  };

  return { users, roles, loading, createUser, /* ... */ };
};
```

### 6. 型別轉換層

需要建立 DTO ↔ Domain Model 的轉換函式：

```typescript
// utils/mappers.ts
import type { UserDTO, RoleDTO } from '../api/authorization';
import type { User, Role } from '../types';

export function mapUserDTOToUser(dtos: UserDTO[]): User[] {
  return dtos.map(dto => ({
    id: dto.id,
    name: dto.username,
    emp_id: `EMP${String(dto.id).padStart(3, '0')}`, // 臨時映射
    is_active: dto.status === 'active',
    roles: dto.roles || [],
    created_at: dto.created_at || '',
  }));
}

export function mapRoleDTOToRole(dtos: RoleDTO[]): Role[] {
  return dtos.map(dto => ({
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    user_count: 0, // 需要額外 API 提供
    permission_count: dto.permission_count || 0,
    created_at: dto.created_at || '',
  }));
}
```

---

## ⚠️ 風險評估

### 高風險項目

| 風險           | 影響                       | 緩解措施                           |
| -------------- | -------------------------- | ---------------------------------- |
| **型別不一致** | API DTO 與 UI Model 差異大 | 建立嚴格的 Mapper 層，加入單元測試 |
| **功能中斷**   | 重構期間破壞現有功能       | 採用 Feature Flag，保留回滾機制    |
| **效能問題**   | Mock 數據過多造成延遲      | 使用 React.memo 與 useMemo 優化    |

### 中風險項目

| 風險         | 影響                   | 緩解措施                   |
| ------------ | ---------------------- | -------------------------- |
| **維護成本** | 需同時維護 Mock 與 API | 建立自動化測試覆蓋兩種模式 |
| **學習曲線** | 團隊成員需理解新架構   | 撰寫詳細文檔與範例         |

---

## 📋 實施檢查清單

### Phase 0: 準備階段 ✅ 已完成

- [x] 建立 `services/IAuthorizationService.ts` 定義統一接口
- [x] 建立 `services/MockAuthorizationService.ts` Mock 實作
- [x] 建立 `services/ApiAuthorizationService.ts` API 實作
- [x] 建立 `services/AuthorizationServiceFactory.ts` 工廠類別
- [x] 在 `.env` 中新增 `VITE_USE_MOCK_AUTH_DATA=true`
- [ ] 更新 `types/index.ts` 確保與 DTO 型別相容
- [ ] 建立 `utils/mappers.ts` 型別轉換函式

### Phase 1: Service 層測試

- [ ] 測試 MockAuthorizationService 所有方法
- [ ] 驗證 Mock 數據的 CRUD 操作正確性
- [ ] 測試 Service Factory 切換機制
- [ ] 撰寫 Service 層單元測試

### Phase 2: Hook 層重構

- [ ] 移除 `useAuthorizationData` 中的硬編碼數據
- [ ] 改為透過 `getAuthorizationService()` 載入數據
- [ ] 實作 DTO → UI Model 轉換（使用 Mapper）
- [ ] 加入 `loading` 與 `error` 狀態
- [ ] 實作錯誤重試機制

### Phase 3: UI 層適配

- [ ] 為 Table 加入 loading 狀態顯示
- [ ] 處理空數據狀態
- [ ] 加入錯誤提示 UI
- [ ] 測試所有 CRUD 操作

### Phase 4: 測試與驗證

- [ ] 功能測試：所有操作在 Mock 模式下正常
- [ ] 切換測試：開關 Feature Flag 無報錯
- [ ] 效能測試：無明顯延遲
- [ ] 型別檢查：`tsc --noEmit` 通過

## 🎓 最佳實踐建議

### 1. Feature Flag 管理

```typescript
// constants/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_MOCK_AUTH_DATA: import.meta.env.VITE_USE_MOCK_AUTH_DATA === 'true',
  ENABLE_AUTH_CACHE: false,
  ENABLE_OPTIMISTIC_UPDATE: false,
} as const;
```

### 2. 錯誤處理統一化

```typescript
// utils/errorHandler.ts
export function handleAuthError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '未知錯誤';
}
```

### 3. Loading 狀態管理

```typescript
// hooks/useAuthorizationData.ts
const [loadingStates, setLoadingStates] = useState({
  users: false,
  roles: false,
  resources: false,
  permissions: false,
});
```

### 4. 快取策略 (未來擴展)

```typescript
// 可選：使用 React Query
const { data: users, isLoading } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => service.getUsers(filters),
  staleTime: 5 * 60 * 1000, // 5 分鐘
});
```

## 🚀 總結與建議

### ✅ 推薦採用方案 A

**核心理由**:

1. **符合專案規劃**: 完全對齊 `plan.md` 中的 P0-P1 階段
2. **關注點分離**: Hook 專注業務邏輯，API 層管理數據來源
3. **可漸進式遷移**: Feature Flag 確保零風險切換
4. **易於測試**: Mock 與真實 API 可獨立測試
5. **未來可擴展**: 為 P3-P9 階段打下堅實基礎

### 📅 建議實施順序

1. **Week 1**: 完成 Phase 0-1 (建立 Mock 數據層與 API 層)
2. **Week 2**: 完成 Phase 2 (重構 Hook 層)
3. **Week 3**: 完成 Phase 3-4 (UI 適配與測試)

### ⚡ 下一步行動項目

```bash
# 1. 建立型別轉換工具 (Mapper 層)
touch src/pages/authorization-center/utils/mappers.ts

# 2. 測試 Service 層
npm run test:services

# 3. 開始重構 Hook 層
# 修改 useAuthorizationData.ts 使用 getAuthorizationService()

# 4. 驗證功能
# 在瀏覽器中測試所有 CRUD 操作
```

---

**文件版本**: v2.0
**建立日期**: 2025-11-05
**最後更新**: 2025-11-05
**作者**: GitHub Copilot
**實作狀態**: Phase 0 已完成 ✅
