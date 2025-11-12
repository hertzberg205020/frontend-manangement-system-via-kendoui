// src/store/selectors/authSelectors.ts

import { createSelector } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import JwtToken from '@/types/jwtPayload';
import type { RootState } from '@/store';

// 基礎 selector 用於選取 token
export const selectToken = (state: RootState) => state.authSlice.token;

// Selector 用於計算 permissions
export const selectPermissions = (state: RootState) => state.authSlice.permissions;

// Selector 用於取得用戶信息
export const selectUserInfo = createSelector(
  [selectToken],
  (token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return null;
    }

    try {
      const payload = jwtDecode<Record<string, unknown>>(token);
      const jwt = new JwtToken(payload);
      return {
        name: jwt.name,
        roles: jwt.roles,
        sub: jwt.sub,
        exp: jwt.exp,
      };
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }
);

// Selector 用於檢查 token 是否過期
export const selectIsTokenExpired = createSelector(
  [selectToken],
  (token): boolean => {
    if (!token) {
      return true;
    }

    try {
      const payload = jwtDecode<Record<string, unknown>>(token);
      const jwt = new JwtToken(payload);
      return jwt.isExpired();
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return true;
    }
  }
);

// Selector 用於檢查是否已認證
export const selectIsAuthenticated = createSelector(
  [selectToken, selectIsTokenExpired],
  (token, isExpired): boolean => {
    return Boolean(token && !isExpired);
  }
);
