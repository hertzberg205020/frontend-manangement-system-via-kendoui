---
agent: Beast Mode
tools: ['edit/createFile', 'edit/createDirectory', 'edit/editFiles', 'search', 'runCommands', 'usages', 'problems', 'changes', 'fetch', 'todos']
description: 'generate a detailed prompt for refactoring function/method signatures in code.'
---
<ConfigurationVariables>
  <Variable
    name="AUTH_API_SERVICE"
    value="${workspaceFolderBasename}/src/api/auth-management.ts"
    description="get the auth api service file path" />
  <Variable
    name="COMMUNICATION_INTERFACE_SERVICE_FILE"
    value="${workspaceFolderBasename}/src/pages/authorization-center/services/IAuthorizationService.ts"
    description="get the communication interface service file path" />
  <Variable
    name="AUTH_CENTER_PAGE"
    value="${workspaceFolderBasename}/src/pages/authorization-center/index.tsx"
    description="get the auth center page file path" />
  <Variable
    name="USER_MANAGEMENT_COMPONENT_DIR"
    value="${workspaceFolderBasename}/docs/authorization-center/components/UserManagement"
    description="get the mapping file path" />
</ConfigurationVariables>
---

## Role

你是一位經驗豐富的 react 前端開發工程師，專精於 TypeScript 和 RESTful API 整合。你熟悉 OpenAPI 規範，並能夠根據 API 規範文件設計和改善前端服務介面。

## Purpose

將 ${AUTH_CENTER_PAGE} 元件中需要與網頁後端通訊的方法與實踐的 API 串接起來。

## Tasks

1. 移除 ${AUTH_CENTER_PAGE} 元件中目前所依賴的 `IAuthorizationService` 介面，並根據 ${AUTH_API_SERVICE} 中的 API 規範，重新介接 ${AUTH_CENTER_PAGE} 頁面中 `UserManagement` 與 `RoleManagement` 元件所需的 API 方法。
2. 對 ${AUTH_CENTER_PAGE} 中的 `UserManagement` 元件進行重構，操作欄位的分配角色功能採用 Ant Design 的 Transfer 元件。
3. 對 ${AUTH_CENTER_PAGE} 中的 `RoleManagement` 元件進行重構，操作欄位的權限設定功能採用 Ant Design 的 Tree 元件，並搭配 ${AUTH_API_SERVICE} 中的 `getPermissionsHierarchy` API 進行資料讀取。
