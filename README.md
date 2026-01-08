# 🏢 Science Park Management System (Frontend)

Operational cockpit for science/industrial parks built with React 19, TypeScript, Redux Toolkit, Ant Design 5 and Vite 6. The app drives tenant onboarding, contracts, billing, energy and equipment dashboards through strict role-based permissions.

> The stack already targets the latest stable releases: **React 19** (new Actions/useOptimistic hooks) [[React team, 2024-12-05]](https://react.dev/blog/2024/12/05/react-19), **Vite 6** (Environment API, Node 20.19+ baseline, stricter security defaults) [[Vite changelog]](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#600-2024-11-26), **Ant Design 5** with the React 19 compatibility patch [[antd docs]](https://ant.design/docs/react/v5-for-19), and **React Router 7.5** (data loaders/actions, deferred routing) [[React Router overview]](https://reactrouter.com/en/main/start/overview).

New to the codebase? Start with [AGENTS.md](AGENTS.md) for the architecture map, conventions, and common change checklists.

---

## 📋 Table of Contents

- [🏢 Science Park Management System (Frontend)](#-science-park-management-system-frontend)
  - [📋 Table of Contents](#-table-of-contents)
  - [Why this stack](#why-this-stack)
  - [System architecture](#system-architecture)
  - [Feature modules](#feature-modules)
  - [Auth \& permissions](#auth--permissions)
  - [HTTP client \& API layer](#http-client--api-layer)
  - [State, layout, and tabs](#state-layout-and-tabs)
  - [Development workflow](#development-workflow)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
    - [Environment variables](#environment-variables)
    - [Scripts](#scripts)
    - [Ant Design React 19 patch](#ant-design-react-19-patch)
  - [Directory reference](#directory-reference)
  - [Adding a new permission or module](#adding-a-new-permission-or-module)
  - [Testing \& quality](#testing--quality)
  - [Deployment checklist](#deployment-checklist)
  - [Backlog](#backlog)
  - [Reference docs](#reference-docs)
  - [🤝 Contributing](#-contributing)

---

## Why this stack

- **React 19.1** — unlocks Actions, `useOptimistic`, `useActionState`, metadata and stylesheet primitives that keep forms responsive while mutations run [[React 19 release](https://react.dev/blog/2024/12/05/react-19)]. Hooks-first functional components keep the codebase small and testable.
- **Vite 6.3** — modern dev server with ESM-first builds, Environment API, enforced Node 20.19+ runtime, HTTP/2 dev proxies and hardened host/CORS defaults [[Vite 6.0 notes](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#600-2024-11-26)].
- **Ant Design 5 + React 19 patch** — enterprise-ready components plus the `@ant-design/v5-patch-for-react-19` shim to keep waves, Modals and global messages stable on the new renderer [[compat guide](https://ant.design/docs/react/v5-for-19)].
- **React Router 7.5** — `createBrowserRouter`, data loaders/actions, deferred data, Suspense integration and middleware-ready navigation keep routes declarative [[docs](https://reactrouter.com/en/main/start/overview)].
- **Redux Toolkit + RTK selectors** — centralises auth, tenant, and tab state with memoised selectors that decode JWT payloads once.
- **Axios-based HTTP core** — resilient request pipeline with retry/backoff, detailed telemetry and Ant Design `message` surfacing for both transport and business errors.

---

## System architecture

```text
┌──────────────┐     decode via selectors      ┌─────────────────────┐
│  session JWT │ ───────────────────────────▶ │ authSelectors (memo) │
└──────────────┘                              └────────┬─────────────┘
          │                                                    │
          ▼                                                    ▼
┌────────────────┐    guards + derived permissions    ┌─────────────────────┐
│  authSlice     │ ─────────────────────────────────▶ │ RequireAuth / HOCs  │
│  tabsSlice     │                                    └────────┬─────────────┘
└────────┬───────┘                                             │
         │                                                      ▼
         │                                    routes from PERMISSION_ROUTE_MAP
         ▼                                                      │
┌──────────────────────────┐      feeds menus/tabs      ┌─────────────────────┐
│ permissionRouteGenerator │ ─────────────────────────▶ │ NavSidebar / Tabs UI │
└──────────────────────────┘                            └─────────────────────┘

HTTP stack: utils/http/http.ts → utils/http/request.ts → src/api/* (domain calls)
```

Key flows:

- JWT token is persisted in `authSlice` and parsed once through selectors to derive `permissions`, `userInfo`, and `isTokenExpired` without duplicating state.
- `App.tsx` recreates `createBrowserRouter` whenever the permission set changes, ensuring only authorised routes render.
- `PrivateRoute` and `withPermissions` provide gatekeeping at both route and component granularity.
- Tabs and breadcrumbs reflect the router output so navigation stays in sync with Redux state.

---

## Feature modules

| Domain               | Location                                  | Highlights                                                                                                        |
| -------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Dashboard & Energy   | `src/pages/dashboard`, `src/pages/energy` | Lazy-loaded charts, mocked data providers for energy KPIs, Ant Design `Card` + custom `EnergyFigure`/`BarFigure`. |
| Contracts & Finance  | `src/pages/finance`                       | Bill centers, contract detail views and Ant Design tables with `process-table-column.tsx` helpers.                |
| Leasing Hub          | `src/pages/leasing-hub`                   | Merchant portal views for prospecting.                                                                            |
| Property Ops         | `src/pages/property-management`           | Room and vehicle management, ready for granular permissions.                                                      |
| Authorization Center | `src/pages/authorization-center`          | End-user permission matrix (placeholder for future admin tooling).                                                |
| Users                | `src/pages/users`                         | Includes `ClientForm`, `add-user`, and listing page; ties directly into `src/api/users.ts`.                       |

All feature folders follow the same pattern: colocated `components`, `hooks`, `types`, and `README.md` for quick ramp-up.

---

## Auth & permissions

- **JWT handling** — `authSlice` stores the raw token; `authSelectors` decode and memoise payload details (`JwtPayload`, expiration, permissions array). You never parse the token twice.
- **Route generation** — `constants/permissions.ts` defines all permission codes and maps them to descriptors consumed by `router/generateRouteFromPermission.tsx`. Each descriptor links to lazy page components declared in `router/routerMap.tsx`.
- **Guards**
  - `RequireAuth`: redirects anonymous users to `/login`, but also prevents authenticated users from revisiting `/login`.
  - `PrivateRoute`: wraps children and renders nothing unless the active user owns the `requiredPermission` prop.
  - `withPermissions` HOC: hides individual buttons/cards unless any/all permissions are satisfied.
- **New permission workflow** (see [dedicated section](#adding-a-new-permission-or-module)).

---

## HTTP client & API layer

File: `src/utils/http/http.ts`

- `axios.create` instance with:
  - Base URL from `import.meta.env.VITE_API_URL`.
  - 10s timeout, JSON headers, request metadata (`requestId`, `startTime`).
  - Token injection via `store.getState().authSlice.token` (safe try/catch to avoid crashes during bootstrapping).
  - Automatic `Authorization: Bearer <token>` header using Axios v1 header helper APIs.
- **Resilience features**:
  - Exponential backoff retries (network + 5xx errors, configurable via `RetryConfig`).
  - Rich error classification (`NETWORK`, `TIMEOUT`, `SERVER`, `CLIENT`, `BUSINESS`, `UNAUTHORIZED`, `FORBIDDEN`).
  - Ant Design `message` notifications with severity-specific durations.
  - Structured console logging for both requests and responses (duration, payload snapshot, IDs).
  - 401 handler that dispatches `auth/logout`, guards against null store state, and redirects to `/login`.
- **Business error handling** — if the backend responds with `{ code, message }` even on HTTP 200, the interceptor rejects with a custom `HttpError` so UI layers can rely on consistent error shapes.
- `src/utils/http/request.ts` wraps the instance with typed `get/post/put/delete` helpers returning `ApiResponse<T>`, ensuring every API in `src/api/*` remains type-safe.

When building new APIs, keep the domain-specific code inside `src/api/<domain>.ts` and only expose typed functions to pages/components—never import Axios directly from a page.

---

## State, layout, and tabs

- **Redux store** — declared in `src/store/index.ts` with slices for `auth`, `tabs`, `tenement`, and more as the product grows.
- **Tabs manager** (`src/components/tabsManager`) — persists open tabs to `sessionStorage`, keeps `/dashboard` pinned, and provides actions such as close-all/close-others.
- **Layout shell** — `components/layoutHeader`, `components/navSidebar`, and `components/breadCrumb` consume router metadata to keep navigation consistent.
- **Route sync hook** — `useRouteSync` mirrors router events to Redux tabs so deep links rehydrate reliably after refresh.

---

## Development workflow

### Prerequisites

- Node.js **20.19+** (required by Vite 6) or Node 22.12+.
- npm / pnpm / yarn. Commands below use npm.

### Setup

```bash
git clone <repo-url>
cd science-park-management-system
npm install
cp .env.example .env.local   # create if missing; see env list below
npm run dev
```

Visit <http://localhost:5173> once Vite boots.

### Environment variables

`.env.local` (git-ignored) should include:

```env
VITE_API_URL=http://localhost:3000
VITE_ENABLE_HTTP_LOG=true
```

> **Action item:** add `.env.example` (tracked) so contributors can copy defaults (see backlog).

### Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Vite dev server with HMR.                    |
| `npm run build`   | Type-check (tsc) + Vite production build.    |
| `npm run preview` | Serve the production build locally.          |
| `npm run lint`    | ESLint via flat config (`eslint.config.js`). |

### Ant Design React 19 patch

Install the compatibility shim once per app entry point, per the official guide [[source](https://ant.design/docs/react/v5-for-19)]:

```bash
npm install @ant-design/v5-patch-for-react-19 --save
```

```ts
// src/main.tsx
import '@ant-design/v5-patch-for-react-19';
```

Use `unstableSetRender` only if you have UMD or micro-frontend constraints; the compatibility package is the preferred option.

---

## Directory reference

```text
src/
  api/                # Domain-specific fetch wrappers (users, dashboard, tenement...)
  assets/             # Static assets and icons
  components/         # Shared UI primitives (nav sidebar, layout header, tabs manager, breadcrumb)
  constants/          # Permission constants, enums
  hooks/              # Reusable hooks (auth, route sync)
  mock/               # Sample data + menu descriptions for local demos
  pages/              # Feature modules (dashboard, users, finance, property-management, etc.)
  router/             # Router factory, maps, guards
  store/              # Redux Toolkit store and slices
  types/              # Shared DTOs (JWT payloads, pagination, tenant types)
  utils/              # Cross-cutting helpers (permissions, route gen, table columns, HTTP)
    http/
```

Naming conventions:

- Components → `PascalCase.tsx`
- Hooks → `useCamelCase.ts`
- Types/Interfaces → `PascalCase`
- Constants → `UPPER_SNAKE_CASE`

---

## Adding a new permission or module

1. **Define permission constant** in `constants/permissions.ts` (export both the literal and label metadata).
2. **Map to routes** inside `router/generateRouteFromPermission.tsx` or `router/routerMap.tsx` using lazy imports.
3. **Add menu metadata** in `mock/menus` if the feature should appear in the sidebar, including icon references.
4. **Create the page** under `src/pages/<domain>/<Feature>.tsx`. Use Ant Design forms/tables per coding standards and wrap API calls with `src/api/<domain>.ts` helpers.
5. **Backend update** — ensure JWTs minted by the auth service contain the new permission code for relevant roles.
6. **Relogin** to refresh the token. The sidebar, breadcrumbs, tabs, and router will now surface the new module automatically.

When only a subset of a page requires the permission, wrap the fragment with `withPermissions` so the rest of the view still renders.

---

## Testing & quality

Testing scaffolding is not yet wired. Recommended plan:

1. **Unit/component tests** — add Vitest + React Testing Library to exercise hooks (`useRouteSync`, `useAuth`) and components (`PrivateRoute`).
2. **API mocking** — adopt MSW to stub REST endpoints, aligning with the typed `ApiResponse<T>` shape.
3. **CI** — GitHub Actions pipeline to run `npm run lint`, `npm run test` (once added), and `npm run build` on every PR.
4. **Error boundaries** — add React 19 `onCaughtError`/`onUncaughtError` hooks or top-level error boundaries to catch rendering faults proactively.

See [Backlog](#backlog) for tracking items.

---

## Deployment checklist

1. `npm run build` to emit the Vite production bundle (`dist/`).
2. Serve via Nginx/Apache/CDN with `Cache-Control` + gzip/brotli compression.
3. Configure environment-specific `.env` files (`VITE_API_URL`, analytics toggles, logging flags).
4. Consider wiring `logError` to monitoring platforms (Sentry, LogRocket) in production builds.
5. Harden CSP/headers when exposing Ant Design global components to multi-tenant users.

---

## Backlog

- [ ] Commit `.env.example` with documented defaults.
- [ ] Introduce Vitest + RTL harness and MSW fixtures.
- [ ] GitHub Actions workflow (lint + test + build).
- [ ] Route-level caching or nested Suspense fallbacks to avoid re-fetching heavy dashboards.
- [ ] Dark mode + i18n skeleton.
- [ ] ECharts theme abstraction + code splitting of chart configs.
- [ ] Permission caching strategy (compress payload once tokens grow large).
- [ ] Global Error Boundary hooking into React 19 `onCaughtError`.

---

## Reference docs

- React 19 release announcement — <https://react.dev/blog/2024/12/05/react-19>
- React 19 upgrade guide & Actions/useOptimistic docs — <https://react.dev/blog/2024/04/25/react-19-upgrade-guide>
- Vite 6.0 announcement/changelog — <https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#600-2024-11-26>
- Ant Design React 19 compatibility — <https://ant.design/docs/react/v5-for-19>
- Ant Design getting started — <https://ant.design/docs/react/introduce>
- React Router feature overview — <https://reactrouter.com/en/main/start/overview>

---

## 🤝 Contributing

Read [AGENTS.md](AGENTS.md) first for the repo-specific architecture and workflows.

1. Fork and branch from `main` (`feature/<topic>`).
2. Follow the coding standards inside `.github/copilot-instructions.md` (hooks-first, strict typing, Ant Design best practices).
3. Update docs/tests alongside code.
4. Run `npm run lint` (and tests once available) before opening a PR.
5. Describe motivation, scope, and verification steps in the PR template.

Licensed under the **MIT License**. Contributions are welcome! 🚀
