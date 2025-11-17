import { configureStore } from '@reduxjs/toolkit';
import authSlice from './login/authSlice';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import tenementSlice from './tenement/tenementSlice';
import tabsSlice from './tabs/tabsSlice';

export const store = configureStore({
  reducer: {
    authSlice,
    tenementSlice,
    tabsSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 導出所有 auth 相關的 selector
export {
  selectToken,
  selectPermissions,
  selectPermissionsLoaded,
  selectUserInfo,
  selectIsTokenExpired,
  selectIsAuthenticated,
} from './selectors/authSelectors';
