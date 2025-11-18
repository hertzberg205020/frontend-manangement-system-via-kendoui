# AI Coding Playbook

## Stack & workflows

- React 19 + Vite 6 + Ant Design 5; TypeScript strict everywhere. `src/main.tsx` already loads `@ant-design/v5-patch-for-react-19`—keep new entry points consistent.
- Node 20.19+ is required. Primary scripts live in `package.json`: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- Configure `.env.local` with `VITE_API_URL` and `VITE_ENABLE_HTTP_LOG`; never commit secrets. Vite dev server runs at `http://localhost:5173`.

## Architecture map

- Redux Toolkit store (`src/store/index.ts`) wires `authSlice`, `tabsSlice`, `tenementSlice`; selectors under `src/store/selectors` decode the JWT once.
- Permission constants (`src/constants/permissions.ts`) feed router descriptors in `router/generateRouteFromPermission.tsx` and `router/routerMap.tsx`. Changing permissions requires touching those two files plus any sidebar metadata.
- Guards: `utils/RequireAuth.tsx` handles route-level redirects, `components/PrivateRoute` gates children by `requiredPermission`, and `utils/withPermissions.tsx` hides fine‑grained UI.
- Layout shell comes from `components/navSidebar`, `layoutHeader`, `breadCrumb`; tabs state is centralized in `components/tabsManager` + `store/tabs`. The `hooks/useRouteSync` hook keeps tabs aligned with router changes.

## HTTP & APIs

- Never import Axios directly in pages. Use `utils/http/http.ts` (axios instance with JWT injection, retry/backoff, error typing, automatic logout on 401) via `utils/http/request.ts` helpers.
- Domain APIs live in `src/api/<domain>.ts` and return typed `ApiResponse<T>` (see `api/users.ts`, `api/dashboard.ts`). Surfacing business errors via the shared helpers keeps AntD `message` handling uniform.
- Local demo/mocks belong under `src/mock` (e.g., menus) to keep real API modules clean.

## Pages & components

- Feature folders under `src/pages/<feature>` may include colocated `components/`, `hooks/`, `types/`, `utils/`; follow patterns from `pages/users` and `pages/dashboard`.
- Shared UI belongs under `src/components`. Reuse `tabsManager` actions instead of duplicating tab UX; leverage `utils/process-table-column.tsx` for AntD table column builders.
- Routing: `App.tsx` rebuilds the router when permissions change—ensure new routes integrate via the generator rather than hardcoding.

## Coding conventions

- Functional components only; type props with `ComponentNameProps` and default-export at the bottom. Hooks follow `useCamelCase` naming.
- Import order: React → external packages → internal `@/` modules → styles → `import type { ... }`.
- Style: single quotes for strings, double quotes for JSX attributes, 2-space indent, semicolons required. Use `useCallback`/`useMemo` before passing handlers/data-heavy props.
- When adding permissions: define in `constants/permissions.ts`, wire to router map, optionally update `mock/menus`, and gate UI with `withPermissions` or `PrivateRoute`.

## Quality baseline

- ESLint via `npm run lint` is the current guardrail; Vitest/RTL is not wired yet. Keep new code lint-clean and structured for future tests (pure helpers, small hooks, dependency injection where practical).
