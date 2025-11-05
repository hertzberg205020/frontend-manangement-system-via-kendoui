/**
 * Authorization Service Factory
 *
 * 根據配置建立對應的 Service 實例：
 * - 統一的服務創建入口
 * - 支援環境變數配置
 * - 支援執行時切換
 */

import type { IAuthorizationService, ServiceConfig } from './IAuthorizationService';
import { MockAuthorizationService } from './MockAuthorizationService';
import { ApiAuthorizationService } from './ApiAuthorizationService';

/**
 * 預設配置
 */
const DEFAULT_CONFIG: ServiceConfig = {
  useMock: import.meta.env.VITE_USE_MOCK_AUTH_DATA === 'true',
  mockDelay: 300,
  mockErrorRate: 0,
};

/**
 * 當前使用的 Service 實例（單例模式）
 */
let serviceInstance: IAuthorizationService | null = null;

/**
 * Service Factory 類別
 */
export class AuthorizationServiceFactory {
  /**
   * 建立 Service 實例
   */
  static createService(config?: Partial<ServiceConfig>): IAuthorizationService {
    const finalConfig: ServiceConfig = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    if (finalConfig.useMock) {
      return new MockAuthorizationService(finalConfig);
    } else {
      return new ApiAuthorizationService();
    }
  }

  /**
   * 取得單例 Service 實例
   */
  static getInstance(config?: Partial<ServiceConfig>): IAuthorizationService {
    if (!serviceInstance) {
      serviceInstance = this.createService(config);
    }
    return serviceInstance;
  }

  /**
   * 重設單例實例（用於測試或重新配置）
   */
  static resetInstance(): void {
    serviceInstance = null;
  }

  /**
   * 檢查當前是否使用 Mock 模式
   */
  static isMockMode(): boolean {
    return import.meta.env.VITE_USE_MOCK_AUTH_DATA === 'true';
  }
}

/**
 * 便捷函式：取得預設 Service 實例
 */
export function getAuthorizationService(): IAuthorizationService {
  return AuthorizationServiceFactory.getInstance();
}
