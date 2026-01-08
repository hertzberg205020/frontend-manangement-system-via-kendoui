# TabsManager 元件文件

## 概述

`TabsManager` 是一個基於 Ant Design Tabs 的多頁籤管理元件，用於實現類似 VS Code 的多頁籤導航功能。該元件與應用的路由系統深度集成，提供了頁面的標籤化瀏覽體驗。

## 目錄結構

```txt
src/components/tabsManager/
├── index.tsx        # 元件主文件
├── index.scss       # 元件樣式文件
└── README.md        # 本文件
```

## 核心功能

- ✅ 動態創建和管理多個頁籤
- ✅ 與 React Router 同步的路由導航
- ✅ 頁籤的關閉、切換操作
- ✅ 右鍵選單（關閉其他、關閉所有）
- ✅ SessionStorage 持久化
- ✅ 首頁頁籤不可關閉保護
- ✅ 關閉頁籤後自動導航到前一個頁籤

## 依賴關係圖

### 整體架構流程

```txt
┌─────────────────────────────────────────────────────────────────┐
│                      使用者操作                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
      ┌──────────┐   ┌──────────┐   ┌──────────┐
      │ 點擊選單  │   │ 切換頁籤  │   │ 關閉頁籤  │
      └─────┬────┘   └────┬─────┘   └────┬─────┘
            │             │              │
            ▼             ▼              ▼
      ┌──────────────────────────────────────┐
      │         TabsManager 元件               │
      │  - handleTabChange()                  │
      │  - handleTabEdit()                    │
      │  - getContextMenuItems()              │
      └────────────┬─────────────────────────┘
                   │
                   ▼
      ┌─────────────────────────────────────┐
      │    Redux Store (tabsSlice)          │
      │  - setActiveTab()                   │
      │  - addTab()                         │
      │  - removeTab()                      │
      │  - removeOtherTabs()                │
      │  - removeAllTabs()                  │
      └────────────┬────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌─────────┐
   │ State  │ │ Router │ │ Storage │
   │ Update │ │  Sync  │ │ Persist │
   └────────┘ └────────┘ └─────────┘
```

### 數據流向與依賴關係

```txt
┌────────────────────────────────────────────────────────────────┐
│                      入口: Home 元件                             │
│  文件: src/pages/home/index.tsx                                 │
│  職責: 布局容器，掛載 TabsManager 和 useRouteSync              │
└───────────────┬────────────────────────────────────────────────┘
                │
                ├─────────────────────────────────────────────┐
                │                                             │
                ▼                                             ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│    Hook: useRouteSync         │         │   Component: TabsManager      │
│    文件: src/hooks/            │         │   文件: src/components/       │
│          useRouteSync.ts      │         │         tabsManager/index.tsx │
│                               │         │                               │
│  職責:                         │         │  職責:                         │
│  - 監聽 location.pathname     │◄────────│  - 渲染 Tabs UI               │
│  - 查找對應 menu item         │         │  - 處理頁籤切換               │
│  - dispatch addTab()          │         │  - 處理頁籤關閉               │
│  - 自動創建/切換頁籤           │         │  - 右鍵選單功能               │
│                               │         │                               │
│  依賴:                         │         │  依賴:                         │
│  ✓ useLocation (react-router) │         │  ✓ useAppSelector             │
│  ✓ useAppDispatch             │         │  ✓ useAppDispatch             │
│  ✓ MENU_NODES                 │         │  ✓ useNavigate                │
│  ✓ tabsSlice actions          │         │  ✓ tabsSlice state            │
└───────────────┬───────────────┘         └───────────────┬───────────────┘
                │                                         │
                │ dispatch actions                        │ dispatch actions
                └─────────────┬───────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────────────┐
        │         Redux Store: tabsSlice                      │
        │         文件: src/store/tabs/tabsSlice.ts           │
        │                                                     │
        │  State:                                             │
        │    - activeKey: string                              │
        │    - items: TabItem[]                               │
        │                                                     │
        │  Actions (Reducers):                                │
        │    - setActiveTab(key)         // 設置當前活躍頁籤    │
        │    - addTab(TabItem)           // 添加新頁籤         │
        │    - removeTab(key)            // 移除頁籤          │
        │    - removeOtherTabs(key)      // 關閉其他頁籤       │
        │    - removeAllTabs()           // 關閉所有可關閉頁籤  │
        │    - clearTabsStorage()        // 清除持久化數據     │
        │                                                     │
        │  Side Effects:                                      │
        │    - saveTabsToStorage()       // 自動持久化到      │
        │                                   sessionStorage    │
        │    - loadTabsFromStorage()     // 初始化時載入      │
        │                                                     │
        │  數據驗證:                                           │
        │    - ensureHomeTab()           // 確保首頁存在      │
        │    - ensureValidActiveKey()    // 驗證活躍頁籤      │
        └─────────────────┬───────────────────────────────────┘
                          │
                          │ state changes
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐
    │ TabsManager  │ │ NavSidebar│ │ CustomBread  │
    │ Re-render    │ │ 監聽 active│ │  crumb       │
    └──────────────┘ │   Key     │ │ 顯示路徑     │
                     └──────────┘ └──────────────┘
```

## 核心文件與依賴

### 1. 狀態管理 (Store/Slice)

#### `src/store/tabs/tabsSlice.ts`

**關聯性**: 🔴 強耦合（TabsManager 的核心數據源）

**接口定義**:

```typescript
interface TabItem {
  key: string; // 路由路徑
  label: string; // 顯示標題
  closable: boolean; // 是否可關閉
}

interface TabsState {
  activeKey: string; // 當前活躍頁籤
  items: TabItem[]; // 所有頁籤列表
}
```

**提供的 Actions**:

- `setActiveTab(key: string)` - 設置當前活躍頁籤
- `addTab(TabItem)` - 添加新頁籤（如已存在則切換）
- `removeTab(key: string)` - 移除指定頁籤
- `removeOtherTabs(key: string)` - 關閉除指定頁籤外的其他頁籤
- `removeAllTabs()` - 關閉所有可關閉的頁籤
- `clearTabsStorage()` - 清除 sessionStorage 中的持久化數據

**數據流方向**:

```txt
TabsManager (dispatch) → tabsSlice → TabsManager (selector)
```

**持久化機制**:

- 使用 `sessionStorage` 存儲頁籤狀態
- 每次 action 執行後自動調用 `saveTabsToStorage()`
- 頁面刷新時通過 `loadTabsFromStorage()` 恢復狀態

---

### 2. 路由同步 Hook

#### `src/hooks/useRouteSync.ts`

**關聯性**: 🟠 間接耦合（通過 Redux 連接）

**職責**:

- 監聽 `location.pathname` 變化
- 從 `MENU_NODES` 查找對應的選單項
- 自動 dispatch `addTab()` 創建或切換頁籤

**數據流方向**:

```txt
Router 變化 → useRouteSync → dispatch addTab() → tabsSlice
```

**使用位置**:

- `src/pages/home/index.tsx` (在主布局中調用)

**依賴**:

```typescript
import { useLocation } from 'react-router';
import { useAppDispatch } from '@/store';
import { addTab, setActiveTab } from '@/store/tabs/tabsSlice';
import { MENU_NODES } from '@/utils/menuItemsGenerator.ts';
```

---

### 3. 相關元件

#### `src/components/navSidebar/index.tsx`

**關聯性**: 🟡 弱耦合（共享狀態）

**交互方式**:

- 讀取 `tabsSlice.activeKey` 用於高亮當前選單項
- 點擊選單項時 dispatch `addTab()` 創建頁籤
- 使用 `navigate()` 觸發路由變化

**數據流方向**:

```txt
NavSidebar (click) → dispatch addTab() → tabsSlice → TabsManager (re-render)
```

#### `src/components/breadCrumb/index.tsx`

**關聯性**: 🟢 僅讀取狀態

**交互方式**:

- 讀取 `tabsSlice.activeKey` 用於顯示當前路徑
- 不修改 tabsSlice 狀態

**數據流方向**:

```txt
tabsSlice.activeKey → CustomBreadcrumb (display)
```

#### `src/components/layoutHeader/index.tsx`

**關聯性**: 🟡 弱耦合（登出清理）

**交互方式**:

- 使用者登出時調用 `clearTabsStorage()` 清除頁籤緩存

**數據流方向**:

```txt
LayoutHeader (logout) → dispatch clearTabsStorage() → sessionStorage.clear()
```

---

### 4. 路由系統

#### `src/router/index.tsx`

**關聯性**: 🟠 間接依賴

**交互方式**:

- TabsManager 通過 `navigate()` 觸發路由變化
- useRouteSync 監聽路由變化後更新頁籤

#### `src/utils/menuItemsGenerator.ts`

**關聯性**: 🔴 強依賴

**導出的重要數據**:

```typescript
export const MENU_NODES: MenuItemForDisplay[];
```

**作用**:

- 提供選單結構和路由映射
- useRouteSync 用它來查找路由對應的標題和配置
- NavSidebar 用它來生成選單

---

### 5. Redux Store 配置

#### `src/store/index.ts`

**關聯性**: 🔴 強依賴

**提供的工具**:

```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**在 TabsManager 中的使用**:

```typescript
const dispatch = useAppDispatch();
const { activeKey, items } = useAppSelector((state) => state.tabsSlice);
```

---

## 完整數據流示例

### 場景 1: 使用者點擊側邊欄選單

```txt
1. 使用者點擊 NavSidebar 的選單項（例如：Dashboard）
   ↓
2. NavSidebar.handleMenuItemClick() 被觸發
   ↓
3. dispatch(addTab({
     key: '/dashboard',
     label: 'Dashboard',
     closable: false
   }))
   ↓
4. tabsSlice.addTab reducer 執行
   - 檢查頁籤是否已存在
   - 如不存在則添加到 items 數組
   - 設置 activeKey = '/dashboard'
   - 調用 saveTabsToStorage() 持久化
   ↓
5. TabsManager 通過 useAppSelector 檢測到狀態變化
   ↓
6. TabsManager.useEffect 監聽到 activeKey 變化
   ↓
7. navigate('/dashboard', { replace: true }) 觸發路由跳轉
   ↓
8. React Router 更新 location.pathname
   ↓
9. useRouteSync 的 useEffect 檢測到路由變化
   - 但因為頁籤已存在，addTab() 只會切換不會重複添加
   ↓
10. 頁面內容更新（通過 Outlet 渲染對應元件）
```

### 場景 2: 使用者關閉當前頁籤

```txt
1. 使用者點擊頁籤的關閉按鈕
   ↓
2. TabsManager.handleTabEdit('remove') 被觸發
   ↓
3. dispatch(removeTab(targetKey))
   ↓
4. tabsSlice.removeTab reducer 執行
   - 找到要關閉的頁籤索引
   - 如果關閉的是當前活躍頁籤：
     * 計算新的 activeKey（前一個頁籤）
     * 更新 state.activeKey
   - 從 items 數組中移除該頁籤
   - 調用 saveTabsToStorage() 持久化
   ↓
5. TabsManager 檢測到 activeKey 變化
   ↓
6. 自動導航到新的 activeKey 對應的路由
   ↓
7. 頁面內容更新
```

### 場景 3: 頁面刷新後恢復頁籤

```txt
1. 使用者刷新頁面
   ↓
2. Redux Store 初始化
   ↓
3. tabsSlice 的 initialState = loadTabsFromStorage()
   ↓
4. loadTabsFromStorage() 執行
   - 從 sessionStorage.getItem('tabs-state') 讀取數據
   - 驗證數據結構 (isValidTabsState)
   - 確保首頁存在 (ensureHomeTab)
   - 驗證 activeKey 有效性 (ensureValidActiveKey)
   - 返回恢復的狀態
   ↓
5. TabsManager 渲染時獲得恢復的 activeKey 和 items
   ↓
6. 頁籤和路由狀態完全恢復
```

---

## TabsManager 元件 API

### Props

無（該元件不接受 props）

### 內部 State

無（所有狀態由 Redux 管理）

### Hooks 使用

```typescript
const dispatch = useAppDispatch(); // Redux dispatch
const navigate = useNavigate(); // React Router 導航
const { activeKey, items } = useAppSelector((state) => state.tabsSlice);
```

### 核心方法

#### `handleTabChange(key: string)`

當使用者點擊頁籤切換時觸發

```typescript
const handleTabChange = (key: string) => {
  if (key !== activeKey) {
    dispatch(setActiveTab(key));
  }
};
```

#### `handleTabEdit(targetKey, action)`

處理頁籤編輯操作（目前只支持 'remove'）

```typescript
const handleTabEdit = (
  targetKey: React.MouseEvent | React.KeyboardEvent | string,
  action: 'add' | 'remove'
) => {
  if (action === 'remove') {
    dispatch(removeTab(targetKey as string));
  }
};
```

#### `getContextMenuItems(tabKey: string)`

生成右鍵選單配置

```typescript
const getContextMenuItems = (tabKey: string): MenuProps['items'] => [
  {
    key: 'close-others',
    label: '關閉其他',
    onClick: () => dispatch(removeOtherTabs(tabKey)),
  },
  {
    key: 'close-all',
    label: '關閉所有',
    onClick: () => dispatch(removeAllTabs()),
  },
];
```

---

## 樣式結構

### 文件: `index.scss`

**主要樣式類**:

- `.tabs-manager` - 元件根容器
- `.tab-label` - 頁籤標籤容器
- `.tab-text` - 頁籤文本（帶省略號）
- `.tabs-more-btn` - 右上角更多操作按鈕

**關鍵樣式定制**:

```scss
.ant-tabs-tab {
  border-radius: 6px 6px 0 0; // 圓角
  border: 1px solid #d9d9d9; // 邊框
  background: #fafafa; // 背景色

  &.ant-tabs-tab-active {
    background: #fff; // 活躍狀態背景
    border-color: #1890ff; // 活躍狀態邊框
  }
}
```

---

## 擴展開發指南

### 添加新功能

#### 1. 添加頁籤拖動排序功能

**需要修改的文件**:

- `src/store/tabs/tabsSlice.ts` - 添加 `reorderTabs` action
- `src/components/tabsManager/index.tsx` - 集成拖動庫（如 react-beautiful-dnd）

**示例代碼**:

```typescript
// 在 tabsSlice.ts 中添加
reorderTabs: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
  const { fromIndex, toIndex } = action.payload;
  const [removed] = state.items.splice(fromIndex, 1);
  state.items.splice(toIndex, 0, removed);
  saveTabsToStorage(state);
};
```

#### 2. 添加頁籤右鍵選單的「重新載入」功能

**需要修改的文件**:

- `src/components/tabsManager/index.tsx` - 修改 `getContextMenuItems`

**示例代碼**:

```typescript
const getContextMenuItems = (tabKey: string): MenuProps['items'] => [
  {
    key: 'reload',
    label: '重新載入',
    onClick: () => {
      navigate(tabKey, { replace: true });
      window.location.reload(); // 或使用更優雅的刷新方式
    },
  },
  // ... 其他選單項
];
```

#### 3. 添加頁籤固定功能（Pin Tab）

**需要修改的文件**:

- `src/store/tabs/tabsSlice.ts` - 在 `TabItem` 添加 `pinned` 屬性
- `src/components/tabsManager/index.tsx` - 添加固定/取消固定邏輯

**示例代碼**:

```typescript
// TabItem 接口
interface TabItem {
  key: string;
  label: string;
  closable: boolean;
  pinned?: boolean; // 新增
}

// reducer
togglePinTab: (state, action: PayloadAction<string>) => {
  const tab = state.items.find((item) => item.key === action.payload);
  if (tab) {
    tab.pinned = !tab.pinned;
    // 將固定的頁籤移到前面
    state.items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    saveTabsToStorage(state);
  }
};
```

---

### 常見問題與解決方案

#### Q1: 為什麼關閉頁籤後沒有自動導航？

**原因**: `removeTab` reducer 只更新了 state，但沒有觸發導航。

**解決方案**: TabsManager 的 `useEffect` 會監聽 `activeKey` 變化並自動調用 `navigate()`。

```typescript
useEffect(() => {
  if (activeKey) {
    navigate(activeKey, { replace: true });
  }
}, [activeKey, navigate]);
```

#### Q2: 如何防止某些頁面不創建頁籤？

**解決方案**: 在 `useRouteSync` 中添加路徑白名單邏輯。

```typescript
const NO_TAB_ROUTES = ['/login', '/404'];

export const useRouteSync = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const currentPath = location.pathname;

    // 跳過不需要頁籤的路由
    if (NO_TAB_ROUTES.includes(currentPath)) {
      return;
    }

    // ... 原有邏輯
  }, [location.pathname, dispatch]);
};
```

#### Q3: 頁籤數量過多時如何優化？

**建議方案**:

1. 限制最大頁籤數量（例如：10 個）
2. 實現 LRU（最近最少使用）淘汰策略
3. 添加頁籤搜索/篩選功能

**示例代碼**:

```typescript
// 在 tabsSlice.ts 的 addTab reducer 中
const MAX_TABS = 10;

addTab: (state, action: PayloadAction<TabItem>) => {
  const existingTab = state.items.find((item) => item.key === action.payload.key);

  if (!existingTab) {
    // 如果達到上限，移除最舊的可關閉頁籤
    if (state.items.length >= MAX_TABS) {
      const removeIndex = state.items.findIndex((item) => item.closable);
      if (removeIndex !== -1) {
        state.items.splice(removeIndex, 1);
      }
    }
    state.items.push(action.payload);
  }

  state.activeKey = action.payload.key;
  saveTabsToStorage(state);
};
```

---

## 性能優化建議

### 1. 使用 React.memo 優化渲染

```typescript
const TabsManager: React.FC = React.memo(() => {
  // ... 元件代碼
});
```

### 2. 優化 tabItems 計算

使用 `useMemo` 避免每次渲染都重新計算：

```typescript
const tabItems = useMemo(() =>
  items.map(item => ({
    key: item.key,
    label: (
      <Dropdown menu={{ items: getContextMenuItems(item.key) }} trigger={['contextMenu']}>
        <span className="tab-label">
          <span className="tab-text">{item.label}</span>
        </span>
      </Dropdown>
    ),
    closable: item.closable
  })),
  [items]
);
```

### 3. 防抖導航操作

避免快速切換頁籤時多次觸發導航：

```typescript
import { debounce } from 'lodash';

const debouncedNavigate = useMemo(
  () => debounce((path: string) => navigate(path, { replace: true }), 100),
  [navigate]
);

useEffect(() => {
  if (activeKey) {
    debouncedNavigate(activeKey);
  }
}, [activeKey, debouncedNavigate]);
```

---

## 測試建議

### 單元測試

#### 測試 tabsSlice reducers

```typescript
import { addTab, removeTab, setActiveTab } from './tabsSlice';

describe('tabsSlice', () => {
  it('should add a new tab', () => {
    const initialState = { activeKey: '/dashboard', items: [] };
    const newTab = { key: '/users', label: 'Users', closable: true };

    const newState = tabsSlice.reducer(initialState, addTab(newTab));

    expect(newState.items).toHaveLength(1);
    expect(newState.activeKey).toBe('/users');
  });

  it('should remove a tab and update activeKey', () => {
    const initialState = {
      activeKey: '/users',
      items: [
        { key: '/dashboard', label: 'Dashboard', closable: false },
        { key: '/users', label: 'Users', closable: true },
      ],
    };

    const newState = tabsSlice.reducer(initialState, removeTab('/users'));

    expect(newState.items).toHaveLength(1);
    expect(newState.activeKey).toBe('/dashboard');
  });
});
```

### 集成測試

#### 測試 TabsManager 元件

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import TabsManager from './index';
import { store } from '@/store';

describe('TabsManager', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render tabs correctly', () => {
    renderWithProviders(<TabsManager />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should close tab when close button is clicked', () => {
    renderWithProviders(<TabsManager />);
    const closeButton = screen.getAllByRole('button', { name: /close/i })[0];
    fireEvent.click(closeButton);
    // 驗證頁籤是否被移除
  });
});
```

---

## 版本歷史

### v1.0.0 (當前版本)

- ✅ 基礎多頁籤功能
- ✅ SessionStorage 持久化
- ✅ 右鍵選單
- ✅ 首頁保護機制
- ✅ 自動路由同步

### 未來計劃

- 🔲 拖動排序功能
- 🔲 頁籤固定（Pin）功能
- 🔲 最大頁籤數限制
- 🔲 頁籤搜索功能
- 🔲 雙擊關閉頁籤
- 🔲 中鍵點擊關閉頁籤

---

## 注意事項

⚠️ **重要提醒**:

1. **不要直接修改** tabsSlice 的 state，必須通過 dispatch actions
2. **首頁頁籤** (`/dashboard`) 的 `closable` 必須為 `false`
3. 修改 `TabItem` 接口時，需要同步更新 `isValidTabItem` 驗證函數
4. 添加新的路由時，確保在 `MENU_NODES` 中有對應配置
5. 登出時務必調用 `clearTabsStorage()` 清除緩存

---

## 聯繫與貢獻

如有問題或建議，請聯繫開發團隊或提交 Issue。

**相關文件**:

- [路由系統文件](../../router/README.md)
- [權限系統文件](../../constants/permissions.ts)
- [Redux Store 文件](../../store/README.md)
