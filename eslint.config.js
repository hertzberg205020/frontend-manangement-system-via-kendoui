// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

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
             * 排版 / 風格 (Stylistic)
             * ----------------- */
            // 2 空格縮排，Switch 內部額外縮排
            indent: ['error', 2, { SwitchCase: 1 }],
            // 單引號，允許字串內含單引再自動改用雙引
            quotes: ['error', 'single', { avoidEscape: true }],
            // 行末必須有分號
            semi: ['error', 'always'],
            // 物件/陣列最後一項保留逗號 (ES5+ 可用)
            'comma-dangle': ['error', 'only-multiline'],
            // key: value 之間加一格
            'key-spacing': ['error', { beforeColon: false, afterColon: true }],
            // 花括號內左右各留一空格
            'object-curly-spacing': ['error', 'always'],
            // 箭頭函式 => 前後要有空格
            'arrow-spacing': ['error', { before: true, after: true }],
            // 單行長度 100 字元
            'max-len': ['warn', { code: 100, ignoreUrls: true }],
            // 禁止多餘空白 (行尾、行首的混入 tab 等)
            'no-trailing-spaces': 'error',
            // 一律以 Unix 換行
            'linebreak-style': ['error', 'unix'],

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
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
)
