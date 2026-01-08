/**
 * JWT payload interface and helper class
 *
 * This file provides a typed representation of the JWT payload returned by
 * the auth service and a small helper class for common checks (permissions,
 * roles, expiration).
 */

export interface JwtPayload {
  sub?: string;
  jti?: string;
  /** friendly name mapped from 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name' */
  name?: string;
  /** friendly roles mapped from 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role' */
  roles?: string[];
  iss?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  // allow other raw fields
  [key: string]: unknown;
}

/**
 * JwtToken 提供一個輕量的封裝，將 raw payload 映射到友善屬性，並提供常用檢查方法。
 */
export default class JwtToken implements JwtPayload {
  [key: string]: unknown;
  sub?: string;
  jti?: string;
  name?: string;
  roles: string[] = [];
  iss?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  raw: Record<string, unknown>;

  /**
   * 建構子接受解析後的 payload（例如 jwt-decode 回傳的物件）
   */
  constructor(raw: Record<string, unknown>) {
    this.raw = raw;
    this.sub = raw['sub'] as string | undefined;
    this.jti = raw['jti'] as string | undefined;

    // 來源 payload 使用長 URI 欄位名稱，嘗試映射到友善屬性
    this.name =
      (raw['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] as string) ||
      (raw['name'] as string) ||
      undefined;

    const rolesFromUri = raw['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (Array.isArray(rolesFromUri)) {
      this.roles = rolesFromUri.map(String);
    } else if (typeof rolesFromUri === 'string') {
      // 有些實作會以單一字串回傳
      this.roles = [rolesFromUri];
    } else if (Array.isArray(raw['roles'])) {
      this.roles = (raw['roles'] as unknown[]).map(String);
    }

    this.iss = raw['iss'] as string | undefined;
    this.exp = typeof raw['exp'] === 'number' ? (raw['exp'] as number) : undefined;
    this.iat = typeof raw['iat'] === 'number' ? (raw['iat'] as number) : undefined;
    this.nbf = typeof raw['nbf'] === 'number' ? (raw['nbf'] as number) : undefined;
  }

  /** 檢查是否包含指定角色 */
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  /** 檢查是否過期（預設使用目前時間） */
  isExpired(nowSeconds = Date.now() / 1000): boolean {
    if (typeof this.exp !== 'number') return false;
    return nowSeconds >= this.exp;
  }

  /** 回傳原始 payload */
  toJSON(): Record<string, unknown> {
    return this.raw;
  }
}
