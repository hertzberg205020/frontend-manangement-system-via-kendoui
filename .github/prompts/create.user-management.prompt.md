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
    name="COMMUNICATION_API_SERVICE_FILE"
    value="${workspaceFolderBasename}/src/pages/authorization-center/services/ApiAuthorizationService.ts"
    description="get the communication api service file path" />
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

將 UserManagement 元件中的的方法與實踐的 API 串接起來，確保方法簽名與 API 規範一致。

## Tasks

1. 分析 ${USER_MANAGEMENT_COMPONENT_DIR} 目錄中的元件，找出所有需要與後端 API 互動的方法。
2. 查詢 ${COMMUNICATION_INTERFACE_SERVICE_FILE} 檔案中的 IAuthorizationService 介面，找出與步驟一中方法對應的方法簽名。
3. 改寫 ${COMMUNICATION_API_SERVICE_FILE} 檔案中的 ApiAuthorizationService 類別，介接 ${AUTH_API_SERVICE} 檔案中的 API 呼叫，確保方法簽名與 IAuthorizationService 介面一致。
