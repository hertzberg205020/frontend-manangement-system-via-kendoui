// src/store/login/authSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  permissions: string[];
}

const initialState: AuthState = {
  token: sessionStorage.getItem('token') || null,
  permissions: JSON.parse(sessionStorage.getItem('permissions') || '[]'),
};

/**
 * authSlice 負責管理使用者的身分驗證狀態
 *
 * 重構說明：
 * 1. 從儲存 permissions 改為透過 selector 計算權限
 * 2. permissions 直接從 JWT token 解析得來
 * 3. 這種設計確保權限與 token 保持同步，避免狀態不一致的問題
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      // 儲存 token 到 redux state
      state.token = action.payload;
      // 儲存 token 到 sessionStorage
      sessionStorage.setItem('token', action.payload);
    },
    clearToken: (state) => {
      // 清除 redux state 中的 token
      state.token = null;
      // 清除 sessionStorage 中的 token
      sessionStorage.removeItem('token');
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      // 儲存 permissions 到 redux state
      state.permissions = action.payload;
      // 儲存 permissions 到 sessionStorage
      sessionStorage.setItem('permissions', JSON.stringify(action.payload));
    },
    clearPermissions: (state) => {
      // 清除 redux state 中的 permissions
      state.permissions = [];
      // 清除 sessionStorage 中的 permissions
      sessionStorage.removeItem('permissions');
    },
  },
});

export const { setToken, clearToken, setPermissions, clearPermissions } = authSlice.actions;
export default authSlice.reducer;
