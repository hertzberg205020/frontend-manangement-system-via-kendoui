---
agent: Beast Mode
tools: ['edit/createFile', 'edit/createDirectory', 'edit/editFiles', 'search', 'runCommands', 'usages', 'problems', 'changes', 'fetch', 'todos']
---
<ConfigurationVariables>
  <Variable
    name="OpenAPI_SPEC"
    value="${workspaceFolderBasename}/Documents/contract/api.json"
    description="get the API specification file" />
  <Variable
    name="OUTPUT_DIR"
    value="${workspaceFolderBasename}/src/pages/authorization-center/docs"
    description="get the output directory for the extracted API documentation" />
  <Variable
    name="OUTPUT_FILE_NAME"
    value="contract.json"
    description="get the output file name for the extracted API documentation" />
  <Variable
    name="EXTRACTION_SCOPED_TAGS"
    description="Tags used to scope API extraction (e.g., only extract endpoints with these tags)">
    <Value>Auth</Value>
    <Value>Resources</Value>
</Variable>
</ConfigurationVariables>
---

# Tasks

1. 仔細閱讀位於 `${OpenAPI_SPEC}` 的 OpenAPI 規範文件。
2. 根據 `${EXTRACTION_SCOPED_TAGS}` 中指定的標籤，從 OpenAPI 規範中提取相關的 API Endpoint 資訊。
3. 將提取的 API Endpoint 資訊整理成一個新的 OpenAPI 規範文件。
4. 將整理好的 OpenAPI 規範文件保存到 `${OUTPUT_DIR}` 目錄下，文件名為 `${OUTPUT_FILE_NAME}`。
5. 確保生成的 OpenAPI 規範文件格式正確，並包含所有必要的資訊 (例如：API Endpoint、請求參數、響應格式、schema 等)。務必將完整的 `$ref` 解析為實際內容，而非保留 `$ref` 鍵。
