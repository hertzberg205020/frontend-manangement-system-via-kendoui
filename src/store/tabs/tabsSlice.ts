import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface TabItem {
  key: string; // 路由路徑
  label: string; // 顯示標題
  closable: boolean; // 是否可關閉
}

interface TabsState {
  activeKey: string; // 當前展示的 Tab 的 key
  items: TabItem[]; // 所有 Tab 的列表
}

const STORAGE_KEY = 'tabs-state';
const HOME_TAB_KEY = '/dashboard';
const DEFAULT_HOME_TAB: TabItem = {
  key: HOME_TAB_KEY,
  label: 'Dashboard',
  closable: false,
};

/**
 * 檢查物件是否為有效的 TabItem
 * @param item - 欲檢查的物件
 * @returns 是否為有效 TabItem
 */
export const isValidTabItem = (item: unknown): item is TabItem => {
  if (typeof item !== 'object' || item === null) return false;
  const tab = item as Record<string, unknown>;
  return (
    typeof tab.key === 'string' &&
    typeof tab.label === 'string' &&
    (typeof tab.closable === 'boolean' || tab.closable === undefined)
  );
};

const isValidTabsState = (state: unknown): state is TabsState => {
  if (typeof state !== 'object' || state === null) return false;
  const tabsState = state as Record<string, unknown>;

  return (
    typeof tabsState.activeKey === 'string' &&
    Array.isArray(tabsState.items) &&
    tabsState.items.length > 0 &&
    tabsState.items.every(isValidTabItem)
  );
};

const ensureHomeTab = (items: TabItem[]): TabItem[] => {
  const hasHomeTab = items.some((item) => item.key === HOME_TAB_KEY && !item.closable);

  return hasHomeTab ? items : [DEFAULT_HOME_TAB, ...items];
};

const ensureValidActiveKey = (activeKey: string, items: TabItem[]): string => {
  const activeTabExists = items.some((item) => item.key === activeKey);
  return activeTabExists ? activeKey : HOME_TAB_KEY;
};

const getDefaultTabsState = (): TabsState => ({
  activeKey: HOME_TAB_KEY,
  items: [DEFAULT_HOME_TAB],
});

const clearCorruptedStorage = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('清除損壞的 Tab 狀態失敗:', error);
  }
};

/**
 * Loads the Tabs state from sessionStorage.
 * @returns {TabsState} Returns the Tabs state.
 * If no data is found in sessionStorage, returns the default state.
 * @description
 * Attempts to retrieve and parse the 'tabs-state' entry from sessionStorage.
 * If the data structure is valid, returns the parsed state;
 * otherwise, returns the default Tabs state (including the home tab).
 * This 函式 is used to initialize the Tabs state, ensuring tab 資訊 persists after a page refresh.
 * @example
 * const tabsState = loadTabsFromStorage();
 */
const loadTabsFromStorage = (): TabsState => {
  try {
    const saved = sessionStorage.getItem('tabs-state');

    if (!saved) {
      return getDefaultTabsState();
    }

    const parsedState = JSON.parse(saved);

    if (!isValidTabsState(parsedState)) {
      throw new Error('Invalid TabsState structure');
    }

    const items = ensureHomeTab(parsedState.items);
    const activeKey = ensureValidActiveKey(parsedState.activeKey, items);
    return {
      activeKey,
      items,
    };
  } catch (error) {
    console.warn('載入 Tab 狀態失敗:', error);
    clearCorruptedStorage();
    return getDefaultTabsState();
  }
};

/**
 * Saves the Tabs state to sessionStorage.
 * @param {TabsState} state - The Tabs state to save.
 * @description
 * Serializes the Tabs state and stores it in sessionStorage under the key 'tabs-state'.
 * This 函式 is used to persist the current tab state across page reloads.
 */
const saveTabsToStorage = (state: TabsState) => {
  try {
    sessionStorage.setItem('tabs-state', JSON.stringify(state));
  } catch (error) {
    console.warn('儲存 Tab 狀態失敗:', error);
  }
};

const initialState: TabsState = loadTabsFromStorage();

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    // 設定當前活躍的 Tab
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeKey = action.payload;
      saveTabsToStorage(state);
    },

    // 添加新 Tab
    addTab: (state, action: PayloadAction<TabItem>) => {
      const existingTab = state.items.find((item) => item.key === action.payload.key);
      if (!existingTab) {
        state.items.push(action.payload);
      }
      state.activeKey = action.payload.key;
      saveTabsToStorage(state);
    },

    // 移除 Tab
    removeTab: (state, action: PayloadAction<string>) => {
      const tabKey = action.payload;

      // 如果沒有 Tab，則不執行任何操作
      if (state.items.length <= 0) {
        return;
      }

      const tabIndex = state.items.findIndex((item) => item.key === tabKey);

      if (state.activeKey === tabKey) {
        const newActiveIndex = tabIndex - 1;
        state.activeKey = state.items[newActiveIndex].key;
      }

      state.items.splice(tabIndex, 1);
      saveTabsToStorage(state);
    },

    // 關閉其他 Tab
    removeOtherTabs: (state, action: PayloadAction<string>) => {
      const keepTabKey = action.payload;
      state.items = state.items.filter((item) => !item.closable || item.key === keepTabKey);
      state.activeKey = keepTabKey;
      saveTabsToStorage(state);
    },

    // 關閉所有可關閉的 Tab
    removeAllTabs: (state) => {
      state.items = state.items.filter((item) => !item.closable);
      if (state.items.length > 0) {
        state.activeKey = state.items[0].key;
      }
      saveTabsToStorage(state);
    },

    // 清除持久化數據（用於登出時）
    clearTabsStorage: (state) => {
      try {
        sessionStorage.removeItem('tabs-state');
      } catch (error) {
        console.warn('清除 Tab 狀態失敗:', error);
      }
      // 重置 Redux state 為預設狀態
      const defaultState = getDefaultTabsState();
      state.activeKey = defaultState.activeKey;
      state.items = defaultState.items;
    },
  },
});

export const { setActiveTab, addTab, removeTab, removeOtherTabs, removeAllTabs, clearTabsStorage } =
  tabsSlice.actions;

export default tabsSlice.reducer;
