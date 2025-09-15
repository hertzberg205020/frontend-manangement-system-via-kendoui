# Authorization Center 權限管理中心

## 概述

Authorization Center 是科學園區管理系統中的權限管理模組，提供完整的使用者、角色和權限管理功能。此模組採用 RBAC (Role-Based Access Control) 模式，讓管理員能夠靈活配置系統權限。

## 功能特色

- 📱 **使用者管理**: 新增、編輯、刪除使用者資料，管理使用者狀態
- 👥 **角色管理**: 建立和維護角色體系，設定角色權限
- 🔐 **權限總覽**: 視覺化展示系統資源和權限配置
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
│   ├── RoleManagement/       # 角色管理模組
│   ├── PermissionOverview/   # 權限總覽模組
│   └── PermissionModal/      # 權限設定彈窗
│
├── hooks/                    # 自定義 Hooks
│   └── useAuthorizationData.ts # 權限資料管理 Hook
│
├── types/                    # TypeScript 型別定義
│   └── index.ts             # 所有介面型別
│
├── constants/                # 常數定義
│   └── index.ts             # 配置常數、訊息文字
│
└── utils/                    # 工具函式
    └── index.ts             # 資料處理與轉換函式
```

## 核心組件說明

### 主頁面 (`index.tsx`)

- **功能**: 作為權限管理的容器組件，整合三個主要功能模組
- **技術**: 使用 Ant Design Tabs 組件實現分頁切換
- **狀態管理**: 管理權限設定彈窗的顯示狀態

### useAuthorizationData Hook (`hooks/useAuthorizationData.ts`)

- **功能**: 統一管理所有權限相關的資料和操作
- **包含**:
  - 使用者 CRUD 操作
  - 角色 CRUD 操作
  - 權限配置更新
  - Mock 資料管理

### 類型定義 (`types/index.ts`)

主要定義以下介面：

- `User`: 使用者資料結構
- `Role`: 角色資料結構
- `Resource`: 系統資源
- `Permission`: 權限定義
- `PermissionTreeNode`: 權限樹狀結構

## 主要功能模組

### 1. 使用者管理 (UserManagement)

- 使用者列表展示與搜尋
- 新增/編輯使用者表單
- 使用者狀態切換 (啟用/停用)
- 角色分配功能

### 2. 角色管理 (RoleManagement)

- 角色列表與基本資訊管理
- 角色建立與編輯
- 權限配置入口
- 使用者數量統計

### 3. 權限總覽 (PermissionOverview)

- 系統資源清單
- 權限分配視覺化
- 權限矩陣展示

### 4. 權限設定 (PermissionModal)

- 樹狀結構權限選擇
- 批量權限配置
- 權限繼承關係

## 技術棧

- **框架**: React 19+ with TypeScript
- **UI 庫**: Ant Design 5.x
- **狀態管理**: React Hooks (useState)
- **圖示**: Ant Design Icons
- **資料格式**: JSON Mock Data

## 開發規範

### 命名慣例

- 組件名稱: PascalCase (例: `UserManagement`)
- Hook 名稱: camelCase with `use` prefix (例: `useAuthorizationData`)
- 檔案名稱: camelCase for hooks, PascalCase for components
- 型別定義: PascalCase (例: `User`, `Role`)

### 檔案組織

- 每個功能模組獨立成資料夾
- 型別定義集中管理
- 常數與工具函式分離
- 組件內部邏輯透過 hooks 抽離

### Props 設計

- 使用 TypeScript interface 定義明確的 Props 型別
- 事件處理函式命名以 `on` 開頭 (例: `onCreateUser`)
- 避免 props drilling，善用 context 或狀態提升

## API 整合說明

目前使用 Mock 資料進行開發，未來需要整合的 API 端點：

```typescript
// 使用者管理 API
GET    /api/users              # 取得使用者列表
POST   /api/users              # 建立使用者
PUT    /api/users/:id          # 更新使用者
DELETE /api/users/:id          # 刪除使用者

// 角色管理 API
GET    /api/roles              # 取得角色列表
POST   /api/roles              # 建立角色
PUT    /api/roles/:id          # 更新角色
DELETE /api/roles/:id          # 刪除角色

// 權限管理 API
GET    /api/resources          # 取得系統資源
GET    /api/permissions        # 取得權限定義
PUT    /api/roles/:id/permissions # 更新角色權限
```

## 後續開發計畫

### 短期目標

- [ ] 整合後端 API
- [ ] 新增表單驗證規則
- [ ] 實作搜尋和篩選功能
- [ ] 加入分頁處理

### 中期目標

- [ ] 新增權限繼承機制
- [ ] 實作批量操作功能
- [ ] 加入操作日誌記錄
- [ ] 優化效能與使用者體驗

### 長期目標

- [ ] 支援動態權限配置
- [ ] 整合第三方身份驗證
- [ ] 實作多租戶權限管理
- [ ] 加入權限分析報表

## 疑難排解

### 常見問題

**Q: 權限設定後沒有生效？**
A: 檢查 `useAuthorizationData` hook 中的 `updatePermissions` 函式是否正確呼叫

**Q: 新增使用者時表單驗證失敗？**
A: 確認 `constants/index.ts` 中的 `FORM_RULES` 設定是否正確

**Q: 組件重新渲染過於頻繁？**
A: 檢查是否適當使用 `useCallback` 和 `useMemo` 優化效能

### 除錯建議

1. 使用 React DevTools 檢查組件狀態
2. 在 console 中查看 Mock 資料是否正確載入
3. 檢查 TypeScript 編譯錯誤
4. 確認 Ant Design 組件的 props 設定

## 貢獻指南

1. 遵循專案的 TypeScript 嚴格模式設定
2. 新增功能時請同步更新型別定義
3. 撰寫清晰的註解，特別是複雜的業務邏輯
4. 確保新功能與現有設計模式一致
5. 提交前請確認 ESLint 檢查通過

## 聯絡資訊

如有問題或建議，請聯絡開發團隊或在專案 Repository 中建立 Issue。

---

📝 **最後更新**: 2025年9月15日
👨‍💻 **維護者**: 開發團隊
🏷️ **版本**: v1.0.0
