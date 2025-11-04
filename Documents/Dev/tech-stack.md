# Tech Stack Overview

## 前端框架 & 語言

- **React 19.1.0** - 最新版本的 React 前端框架，採用函數式元件與 Hooks
- **TypeScript 5.8.3** - 強型別的 JavaScript 超集，提供更好的程式碼品質與開發體驗
- **React DOM 19.1.0** - React 的 DOM 渲染器

## 建置工具

- **Vite 6.3.5** - 新世代的前端建置工具，提供極快的熱更新與建置速度
  - 使用 ESBuild 進行快速的依賴預打包
  - 原生支援 TypeScript 與 JSX
- **@vitejs/plugin-react 4.4.1** - Vite 的 React 官方插件
  - 支援 Fast Refresh
  - 整合 Babel 轉譯

## UI 與樣式

### UI 元件庫

- **Ant Design 5.25.0** - 企業級 React UI 元件庫
  - 完整的設計系統與元件集
  - 內建主題定製系統
  - 支援國際化

### 樣式處理

- **Sass 1.87.0** - CSS 預處理器，支援巢狀、變數、混合等進階功能
- **classnames** - 動態 className 組合工具

## 狀態管理

### Redux 生態系統

- **@reduxjs/toolkit 2.8.1** - Redux 官方推薦的狀態管理工具集
  - 簡化 Redux 配置與使用
  - 內建 Immer 支援不可變更新
  - 整合 Redux Thunk 用於非同步邏輯
- **react-redux 9.2.0** - React 的 Redux 綁定
- **Immer** - 不可變狀態更新庫（Redux Toolkit 內建）

## 路由管理

- **react-router 7.5.3** - React 應用的路由解決方案
  - 聲明式路由配置
  - 支援巢狀路由
  - 程式化導航

## 資料視覺化

- **ECharts 5.6.0** - 百度開源的強大圖表庫
  - 豐富的圖表類型（折線圖、柱狀圖、餅圖等）
  - 高度可定製化
  - 良好的效能表現
- **echarts-for-react 3.0.2** - ECharts 的 React 封裝元件

## HTTP 與資料處理

### HTTP 客戶端

- **Axios 1.9.0** - 基於 Promise 的 HTTP 客戶端
  - 支援請求/回應攔截器
  - 自動 JSON 轉換
  - 支援取消請求
  - 瀏覽器與 Node.js 通用

### 資料處理

- **jwt-decode 4.0.0** - JWT Token 解碼工具
- **dayjs** - 輕量級日期時間處理庫
- **copy-to-clipboard** - 剪貼簿操作工具

## 開發工具

### 程式碼品質

- **ESLint 9.25.0** - JavaScript/TypeScript 程式碼檢查工具
  - `@eslint/js 9.25.0` - ESLint JavaScript 規則集
  - `eslint-plugin-react-hooks 5.2.0` - React Hooks 規則
  - `eslint-plugin-react-refresh 0.4.19` - React Fast Refresh 規則
  - `@typescript-eslint/*` - TypeScript ESLint 支援
    - `typescript-eslint 8.30.1`
    - 包含 parser、plugin、scope-manager、type-utils 等

### 開發輔助

- **MockJS 1.1.0** - 前端模擬資料生成器
  - 模擬 API 回應
  - 開發階段無需後端支援
