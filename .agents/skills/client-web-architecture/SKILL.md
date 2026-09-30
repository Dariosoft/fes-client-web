---
name: client-web-architecture
description: Use when creating, moving, testing, or reviewing client-web React views, layouts, shared components, hooks, API clients, utilities, routes, and colocated files.
---

# Client Web Architecture

Apply these rules to `client-web` structure and ownership.

## SPA Composition

- Treat `src/app/` as the application architecture root; keep only Vite entry concerns such as `main.tsx` directly under `src/`.
- Keep `App` small: it mounts the router provider. Keep route definitions in `src/app/routes.tsx`.
- Keep route-rendered pages and router layouts under `src/app/views/<ViewName>/`.
- Keep global storefront chrome in `views/Layout/`: header, brand, global navigation, session controls, footer, and `<Outlet />`.
- Keep each view's main definition at the root of its folder, for example `views/Storefront/Storefront.tsx`; do not place the view itself under a redundant `components/` folder.
- A view may own private components. Keep them at the view root while the set is small; introduce `components/` only when it improves navigation.
- Views must not import another view's private implementation.
- Put cross-view configuration in `app/shared/config/`, all external API clients in `app/shared/api/`, and reusable UI units in `app/shared/components/`.
- Namespace `shared/api/` by external domain or service, for example `shared/api/account/`, so endpoints, DTOs, paths, parameters, and tests remain centralized without becoming a flat generic bucket.
- Components and views consume API clients; they do not implement `fetch` or own endpoint paths.
- `shared/` is not a generic dumping ground: code belongs there only when it is global chrome, cross-view infrastructure, or concretely reusable.
- Keep constants close to their owner. API paths and parameters live with their API domain; UI state constants remain owner-local, such as `AccountSession/constants.ts`.
- Extract contract paths, parameter names, and stable state values; do not abstract one-off UI copy, styling classes, or test descriptions.

## Files And Folders

- Do not create a folder for every file mechanically.
- Keep a single standalone file flat when it has no companion resources, for example `GuestActions.tsx`, a type file, or a small presentational component.
- Create a named folder when files form one unit: implementation plus tests, CSS/module styles, stories, fixtures, mocks, assets, or closely coupled subcomponents.
- Colocate each definition with its companions, for example `api/get-session/get-session.ts` with `get-session.test.ts`.
- Inside a reusable unit, use `ui/` for its main component, private presentational components, and UI tests; keep state orchestration, utilities, constants, and types outside `ui/` by responsibility.
- Keep custom React hooks under `hooks/`; give a tested hook its own companion folder, for example `hooks/use-account-session/`.
- Keep standalone files flat inside their responsibility folder, but give tested API clients and utilities their own companion folders.
- Create nested `lib/` or other responsibility categories inside an owner only when multiple files make the category useful.
- Do not create trivial tests merely to justify a folder, and do not create folders that only add navigation depth.

## Testing

- Test behavior and contracts, not file existence or implementation details.
- Simple presentational wrappers do not need direct tests when they add no branching, state, transformation, accessibility contract, or independent interaction.
- Hooks and state orchestration require direct tests for meaningful transitions, success, failure, and cleanup/cancellation when relevant.
- API clients require direct tests for URL, method, credentials, payload/response validation, and error handling.
- Utilities with branching or transformation require focused direct tests.
- Component tests should cover rendering, accessibility, and user-visible integration; they do not replace direct tests for substantial hook/API logic.
- Avoid duplicate tests that assert the same behavior at every layer unless the boundary itself is important.

## Component Design

- Keep page content separate from `Layout`; route changes occur inside `<Outlet />` while global chrome remains mounted.
- Reusable components may privately own their orchestration hooks and UI-specific utilities; external API contracts remain centralized under `shared/api/`.
- Extract an internal concern from a shared component only when another owner needs it independently.
- Keep state ownership near the behavior that coordinates it. Presentational components receive data and callbacks.
- Prefer composition over broad components with many conditional props or generic slots without a concrete reuse case.
- Use English for code and Spanish for user-facing copy.
- Preserve responsive behavior from 320 px, semantic HTML, keyboard operation, visible focus, and accessible status/error announcements.

## Dependencies And Verification

- Pin dependency versions exactly and update the lockfile.
- Do not use forced audit fixes without reviewing breaking changes.
- After production or structural changes, run `npm test` and `npm audit --audit-level=moderate`.
- Keep the Vite/nginx SPA fallback intact when adding routes.
