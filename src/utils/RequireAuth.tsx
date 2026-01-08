import { useAppSelector } from '@/store';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

/**
 * 檢查傳入的 token 是否為有效字串。
 *
 * @param token - 欲驗證的 token，型別為 unknown。
 * @returns 若 token 為非空白字串則回傳 true，否則回傳 false。
 */
function isValidToken(token: unknown): boolean {
  return typeof token === 'string' && token.trim() !== '' && isJwtFormat(token);
}

/**
 * 檢查 JWT 字串格式是否正確（僅檢查格式，不驗證簽章）。
 * @param token - 欲驗證的 token
 * @returns 若格式正確則回傳 true，否則回傳 false
 */
function isJwtFormat(token: string): boolean {
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
}

interface IProps {
  allowAnonymous: boolean;
  redirectPath: string;
  children: React.ReactNode;
}

function RequireAuth({ allowAnonymous, redirectPath, children }: IProps) {
  const { token } = useAppSelector((state) => state.authSlice);
  const navigate = useNavigate();

  const isAuthenticated = isValidToken(token);

  useEffect(() => {
    // 如果不允許匿名存取且使用者未驗證，導向 redirectPath
    if (!allowAnonymous && !isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }

    // 已經驗證過且允許匿名存取，則導向 redirectPath
    // 避免已登入後又重新訪問登入頁面
    if (allowAnonymous && isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, allowAnonymous, navigate, redirectPath]);

  return <>{children}</>;
}

export default RequireAuth;
