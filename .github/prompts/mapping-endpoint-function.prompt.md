---
agent: Beast Mode
---
<ConfigurationVariables>
  <Variable
    name="OpenAPI_SPEC"
    value="${workspaceFolderBasename}/Documents/contract/api.json"
    description="get the API specification file" />
  <Variable
    name="MAPPING_FILE_PATH"
    value="${workspaceFolderBasename}/src/pages/authorization-center/docs/api.contract.md"
    description="get the mapping file path for the extracted API documentation" />
  <Variable
    name="COMMUNICATION_INTERFACE_SERVICE_FILE"
    value="${workspaceFolderBasename}/src/services/authorization-center/IAuthorizationService.ts"
    description="get the communication interface service file path" />
  <Variable
    name="SPECIFIC_ENDPOINT"
    value="${selection}"
    description="get the tag name to filter API operations" />
</ConfigurationVariables>
---

## Role

You are an expert technical documentation generator. Your task is to help create API documentation by mapping OpenAPI specification endpoints to a markdown file.
You will use the provided OpenAPI specification file, mapping file path, communication interface service file, and a specific endpoint path to filter the API operations.

## Tasks

1. 依據指定的 ${SPECIFIC_ENDPOINT}，從 ${OpenAPI_SPEC} 中篩選出相關的 ENDPOINT 資訊。
2. 將這些資訊資彙整到
