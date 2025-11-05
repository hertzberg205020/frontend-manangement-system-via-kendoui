/**
 * Services Index
 *
 * 統一匯出所有 Service 相關模組
 */

export { type IAuthorizationService, type ServiceConfig } from './IAuthorizationService';
export { MockAuthorizationService, resetMockData } from './MockAuthorizationService';
export { ApiAuthorizationService } from './ApiAuthorizationService';
export {
  AuthorizationServiceFactory,
  getAuthorizationService,
} from './AuthorizationServiceFactory';
