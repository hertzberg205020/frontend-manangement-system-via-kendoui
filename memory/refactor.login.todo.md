# Login 重構與修正計畫

目的：根據後端提供的 `POST /api/auth/login` 合約，修正前端登入流程中的錯誤（headers 寫法、重複請求、token 同步與 API 路徑不一致），並加入驗證步驟以確保登入流程穩定。

前提假設：

- 後端登入端點為 `/api/auth/login`（參見 `api.json`），回傳形態為 ApiResponse，成功時 `data` 包含 `token`。
- 專案使用 axios 並由 `src/utils/http/http.ts` 設定 baseURL 為 `import.meta.env.VITE_API_URL`。

執行清單（優先順序）

1) 立即修正 - Authorization header 錯誤寫法 (高)

- 檔案：`src/utils/http/http.ts`
- 問題：request 攔截器使用 `config.headers.set(...)`，axios headers 為一般物件。
- 動作：改寫為安全賦值 `config.headers = config.headers || {}; config.headers['Authorization'] =`Bearer ${token}`;`
- 驗證：啟動開發伺服器，於 console 與 network 檢查 request header 包含 Authorization。

2) 立即修正 - 避免登入重複呼叫 (高)

- 檔案：`src/pages/login/index.tsx`
- 問題：handleSubmit 先呼叫 `await login(values)` 檢查，再第二次 `await login(values)` 解構 token，造成兩次請求。
- 動作：只呼叫一次 `const res = await login(values);`，檢查 `res` 後使用 `res.data` 或 `res.token`。
- 驗證：在 console 確認只有一個登入請求被送出，並且 UI 的 loading 行為正確。

3) 立即修正 - token 同步至 sessionStorage 以配合 mock 或後端需求 (中)

- 檔案：`src/pages/login/index.tsx`
- 動作：登入成功後執行 `sessionStorage.setItem('token', token);` 並保留 `dispatch(setToken(token))`。
- 驗證：呼叫權限 API（或重新載入）時，mock `/permissions` 能讀到 token 並返回正確權限。

4) API 路徑一致性（中）

- 檔案：`src/api/users.ts`、`src/mock/index.ts`
- 問題：mock 使用 `${BASE_URL}/login`，而 `users.ts` 呼叫 `api/auth/login`。需與後端合約 `/api/auth/login` 對齊。
- 動作：將 mock 或呼叫端統一為 `/api/auth/login`（建議優先修改 `mock` 以模擬後端，或修改 `users.ts` 若後端為 `/login`）。
- 驗證：登入時 mock 能命中，或真實後端回應正確 200/401 格式。

5) 回傳資料與型別一致性（低）

- 檔案：`src/utils/http/http.ts`、`src/utils/http/request.ts`
- 問題：http 攔截器目前回傳 `data`（ApiResponse），而 `request.ts` 型別為 `ApiResponse<T>`；保持一致即可，但若要改為直接回傳 `data.data`（payload），需全站更新。
- 動作：暫不改變行為，但在文件中註明 `http` 目前回傳 ApiResponse（包含 code/message/data）。
- 驗證：型別檢查通過，呼叫端能正確取用 `res.data`。

6) 環境變數檢查與說明（低）

- 檔案：`.env` 或 Vite 設定（外部於 repo）
- 動作：確認 `VITE_API_URL` 在開發時指向 mock base 或 API gateway，例如 `''` 或 `http://localhost:5173`，避免 baseURL 與路徑拼接錯誤。

驗證步驟（測試矩陣）

- 測試 1：使用 mock admin:123456 登入，驗證 network header 包含 Authorization（若設置），sessionStorage 與 Redux 有 token，並導向首頁。
- 測試 2：使用錯誤密碼，驗證收到 401，並顯示錯誤訊息。
- 測試 3：移除/錯誤 `VITE_API_URL`，驗證錯誤訊息為網路/timeout 並顯示友善提示。

回滾策略

- 若修正導致新錯誤，回滾到先前 commit（使用 `git checkout <sha>`）並逐項回補變更以定位問題。

後續優化（非阻斷）

- 將 mock 改為檢查 Authorization header 而非 sessionStorage（更接近真實後端）。
- 加入單元測試或 e2e 測試覆蓋登入流程（happy + error path）。
- 將 token 存放移至安全的 HttpOnly cookie（長期安全性考量）。

交付件

- Patch：修正 `src/utils/http/http.ts`、`src/pages/login/index.tsx`、（必要時）`src/api/users.ts` 或 `src/mock/index.ts`。
- 驗證報告：簡短的驗證輸出與 console/log 截圖（或 terminal logs）。
