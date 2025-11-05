# Service Layer 使用指南

## 📚 概述

Authorization Center 採用 **Service Layer Pattern** 實現數據來源抽象化，透過統一的 `IAuthorizationService` 接口支援多種數據來源實作。

## 🏗️ 架構圖

```text
┌─────────────────────────────────────────────────────────┐
│                  React Components                        │
│                        ↓                                 │
│              useAuthorizationData Hook                   │
│                        ↓                                 │
│         getAuthorizationService() ← Factory              │
│                        ↓                                 │
│          IAuthorizationService (Interface)               │
│                 ↓            ↓                           │
│    MockAuthorizationService  ApiAuthorizationService     │
│                 ↓            ↓                           │
│            Local Mock Data   HTTP API (authorization.ts) │
└─────────────────────────────────────────────────────────┘
```

## 🎯 核心概念

### 1. IAuthorizationService Interface

所有數據操作的統一接口，定義了完整的 CRUD 方法：

```typescript
interface IAuthorizationService {
  // 使用者管理
  getUsers(params?: PaginationQuery): Promise<PaginatedResponse<UserDTO>>;
  createUser(data: Partial<UserDTO>): Promise<UserDTO>;
  updateUser(id: number, data: Partial<UserDTO>): Promise<UserDTO>;
  deleteUser(id: number): Promise<{ success: boolean } | string>;

  // 角色管理
  getRoles(): Promise<RoleDTO[]>;
  createRole(data: Partial<RoleDTO>): Promise<RoleDTO>;
  // ... 更多方法
}
```

### 2. Service 實作

#### MockAuthorizationService

- 使用本地記憶體數據
- 模擬網路延遲（預設 300ms）
- 支援錯誤模擬
- 實際執行 CRUD 操作（狀態會保留）

#### ApiAuthorizationService

- 透過 HTTP API 與後端通訊
- 使用專案的 `request.ts` wrapper
- 統一錯誤處理

### 3. Service Factory

負責根據配置建立對應的 Service 實例：

```typescript
// 從環境變數讀取配置
const service = AuthorizationServiceFactory.getInstance();

// 或手動指定
const service = AuthorizationServiceFactory.createService({
  useMock: true,
  mockDelay: 500,
});
```

## 🚀 快速開始

### 環境變數配置

在 `.env.development` 中設定：

```bash
# 使用 Mock 數據
VITE_USE_MOCK_AUTH_DATA=true

# 使用真實 API
VITE_USE_MOCK_AUTH_DATA=false
```

### 在 Hook 中使用

```typescript
import { getAuthorizationService } from '../services';

export const useAuthorizationData = () => {
  const service = getAuthorizationService(); // 自動根據環境變數選擇實作

  const loadUsers = async () => {
    try {
      const response = await service.getUsers({ page: 1, pageSize: 10 });
      console.log(response.data); // UserDTO[]
    } catch (error) {
      console.error('載入失敗', error);
    }
  };

  const createNewUser = async (userData: Partial<UserDTO>) => {
    try {
      const newUser = await service.createUser(userData);
      console.log('建立成功', newUser);
    } catch (error) {
      console.error('建立失敗', error);
    }
  };

  return { loadUsers, createNewUser };
};
```

### 在測試中使用

```typescript
import { MockAuthorizationService } from '../services';

describe('useAuthorizationData', () => {
  it('should load users', async () => {
    // 注入 Mock Service
    const mockService = new MockAuthorizationService({
      mockDelay: 0, // 測試時不需要延遲
      mockErrorRate: 0,
    });

    const result = await mockService.getUsers();
    expect(result.data.length).toBeGreaterThan(0);
  });
});
```

## 💡 使用範例

### 範例 1: 載入使用者列表

```typescript
const service = getAuthorizationService();

// 基本查詢
const users = await service.getUsers();

// 帶分頁與搜尋
const filteredUsers = await service.getUsers({
  page: 2,
  pageSize: 20,
  keyword: '張三',
});

console.log(filteredUsers.total); // 總數
console.log(filteredUsers.totalPages); // 總頁數
console.log(filteredUsers.data); // 當前頁數據
```

### 範例 2: CRUD 操作

```typescript
const service = getAuthorizationService();

// 建立
const newUser = await service.createUser({
  username: '新使用者',
  email: 'new@example.com',
  status: 'active',
});

// 更新
const updatedUser = await service.updateUser(newUser.id, {
  status: 'inactive',
});

// 刪除
const result = await service.deleteUser(newUser.id);
if (typeof result === 'string') {
  console.error('刪除失敗:', result);
} else {
  console.log('刪除成功');
}
```

### 範例 3: 角色權限管理

```typescript
const service = getAuthorizationService();

// 取得角色列表
const roles = await service.getRoles();

// 取得角色的權限
const rolePermissions = await service.getRolePermissions(1);
console.log(rolePermissions.permissionIds); // [1, 2, 3, ...]

// 更新角色權限
await service.updateRolePermissions(1, {
  permissionIds: [1, 2, 3, 4, 5],
});

// 指派角色給使用者
await service.updateUserRoles(userId, {
  roleIds: [1, 2],
});
```

### 範例 4: 取得當前使用者資訊

```typescript
const service = getAuthorizationService();

const currentUser = await service.getAuthMe();
console.log(currentUser.username);
console.log(currentUser.roleIds); // [1, 2]
console.log(currentUser.permissions); // ['user.profile:read', 'dashboard:read', ...]
```

## 🔧 進階配置

### 自訂 Mock 配置

```typescript
import { AuthorizationServiceFactory } from '../services';

const service = AuthorizationServiceFactory.createService({
  useMock: true,
  mockDelay: 1000, // 模擬較慢的網路
  mockErrorRate: 0.1, // 10% 機率發生錯誤
});
```

### 執行時切換 Service

```typescript
// 開發時使用 Mock
if (import.meta.env.DEV) {
  AuthorizationServiceFactory.resetInstance();
  // 強制使用 Mock
}

// 取得新實例
const service = AuthorizationServiceFactory.getInstance();
```

## 🧪 測試建議

### 單元測試

```typescript
import { MockAuthorizationService, resetMockData } from '../services';

describe('MockAuthorizationService', () => {
  let service: MockAuthorizationService;

  beforeEach(() => {
    resetMockData(); // 重置數據
    service = new MockAuthorizationService({ mockDelay: 0 });
  });

  it('should create user', async () => {
    const newUser = await service.createUser({
      username: 'test',
      email: 'test@example.com',
    });

    expect(newUser.id).toBeDefined();
    expect(newUser.username).toBe('test');
  });

  it('should handle pagination', async () => {
    const result = await service.getUsers({
      page: 1,
      pageSize: 2,
    });

    expect(result.data.length).toBeLessThanOrEqual(2);
    expect(result.pageSize).toBe(2);
  });
});
```

### 整合測試

```typescript
import { getAuthorizationService } from '../services';

describe('Authorization Integration', () => {
  it('should work with real API', async () => {
    // 設定環境變數使用真實 API
    process.env.VITE_USE_MOCK_AUTH_DATA = 'false';

    const service = getAuthorizationService();
    const users = await service.getUsers();

    expect(Array.isArray(users.data)).toBe(true);
  });
});
```

## ⚠️ 注意事項

### 1. 型別轉換

Service 回傳的是 DTO 型別，需要轉換為 UI Model：

```typescript
import { mapUserDTOToUser } from '../utils/mappers';

const usersDTO = await service.getUsers();
const users = mapUserDTOToUser(usersDTO.data); // 轉換為 UI Model
```

### 2. 錯誤處理

所有 Service 方法都可能拋出錯誤，務必使用 try-catch：

```typescript
try {
  await service.createUser(userData);
} catch (error) {
  if (error instanceof Error) {
    message.error(error.message);
  }
}
```

### 3. Mock 數據狀態

MockAuthorizationService 的數據會保留在記憶體中：

```typescript
// 建立使用者
await service.createUser({ username: 'test' });

// 再次查詢時會包含新建立的使用者
const users = await service.getUsers();
console.log(users.total); // 原本 3 筆 + 1 筆 = 4 筆
```

如需重置：

```typescript
import { resetMockData } from '../services';
resetMockData(); // 重置為初始狀態
```

## 📈 效能考量

### 1. 單例模式

預設使用單例模式，避免重複建立實例：

```typescript
// ✅ 推薦：使用單例
const service = getAuthorizationService();

// ❌ 避免：每次都建立新實例
const service = new MockAuthorizationService();
```

### 2. 請求合併

盡可能使用 `Promise.all` 合併請求：

```typescript
// ✅ 推薦：並行請求
const [users, roles, permissions] = await Promise.all([
  service.getUsers(),
  service.getRoles(),
  service.getPermissions(),
]);

// ❌ 避免：串行請求
const users = await service.getUsers();
const roles = await service.getRoles();
const permissions = await service.getPermissions();
```

## 🔮 未來擴展

Service Layer 可以輕鬆擴展支援：

1. **快取機制**: 實作 CachedAuthorizationService
2. **離線支援**: 實作 OfflineAuthorizationService (使用 IndexedDB)
3. **批次操作**: 新增 `batchCreate`, `batchUpdate` 方法
4. **請求取消**: 支援 AbortController
5. **樂觀更新**: UI 立即更新，背景同步

範例：

```typescript
class CachedAuthorizationService implements IAuthorizationService {
  private cache = new Map();
  private baseService: IAuthorizationService;

  async getUsers(params?: PaginationQuery) {
    const key = JSON.stringify(params);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const result = await this.baseService.getUsers(params);
    this.cache.set(key, result);
    return result;
  }
}
```

## 📚 相關文件

- [數據流分析報告](./data-flow-analysis.md)
- [重構計畫](./plan.md)
- [API 文件](../api/authorization.ts)
- [型別定義](../types/index.ts)

---

**更新日期**: 2025-11-05
**作者**: GitHub Copilot
