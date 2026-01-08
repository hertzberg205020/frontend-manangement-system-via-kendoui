// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 共用設定 ------------------------------------------------------------------
  {
    // 忽略目錄：編譯輸出、套件與 CI / GitHub configs
    ignores: ['dist', 'node_modules', '.github'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
    },
  },

  // TypeScript / React 檔案 ---------------------------------------------------
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    /*
     * 推薦規則
     *  - js.configs.recommended   → 通用 JS 規則
     *  - tseslint.configs.recommended → TypeScript 專屬
     */
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    rules: {
      /* -----------------
       * TypeScript 專屬
       * ----------------- */
      // 明確回傳型別可省略 (由 TS 推斷)
      '@typescript-eslint/explicit-function-return-type': 'off',
      // import type 需分開寫 (可讀性)
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      // 未使用變數：允許以下劃線開頭作為佔位
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      /* -----------------
       * React / Hooks
       * ----------------- */
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // 讓 Prettier 負責排版，並關閉與 Prettier 衝突的 ESLint 規則
  eslintConfigPrettier
);
