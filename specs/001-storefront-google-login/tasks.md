# Tasks 001 — Storefront con entrada Google opcional

Estado as-built de la implementación. Las rutas indican la ubicación actual de cada responsabilidad.

## Base SPA

- [x] **T1.** Mantener `src/main.tsx` como bootstrap y `src/app/App.tsx` como montaje de `RouterProvider`.
  **RF:** RF-1, RF-9
  **Done when:** `main.tsx` no contiene UI de negocio ni red y `App` solo monta el router.

- [x] **T2.** Definir en `src/app/routes.tsx` un `Layout` padre y `Storefront` como index route.
  **RF:** RF-1, RF-9
  **Done when:** `/` renderiza `Storefront` dentro del `<Outlet />` de `Layout`.

## Vistas

- [x] **T3.** Implementar `app/views/Layout/Layout.tsx` con header global, `/favicon.svg`, `AccountSession` y `<Outlet />`.
  **RF:** RF-1, RF-2, RF-5
  **Done when:** el chrome permanece fuera de la vista routeada y rodea el contenido activo.

- [x] **T4.** Implementar `app/views/Storefront/Storefront.tsx` como vista index, sin catálogo ni compra.
  **RF:** RF-1, RF-9
  **Done when:** la vista muestra el escaparate inicial y no contiene header ni sesión duplicados.

## Configuración y contratos

- [x] **T5.** Resolver `VITE_API_BASE_URL` en `app/shared/config/api-base-url.ts` con fallback DuckDNS.
  **RF:** RF-8
  **Done when:** ningún componente hardcodea el host de API.

- [x] **T6.** Centralizar paths, parámetros y DTOs del dominio de cuenta en `app/shared/api/account/`; mantener estados y avisos de UI en `AccountSession/constants.ts`.
  **RF:** RF-3, RF-4, RF-6, RF-11, RF-12
  **Done when:** contratos externos están namespaced en shared API y los estados de presentación permanecen junto a AccountSession.

- [x] **T7.** Implementar y probar `shared/api/account/get-session/`: GET con credenciales, validación de respuesta y errores.
  **RF:** RF-4, RF-8, RF-11
  **Done when:** acepta respuestas válidas y rechaza HTTP o payload inválido.

- [x] **T8.** Implementar y probar `shared/api/account/build-google-login-url/` con `return_to` codificado.
  **RF:** RF-3, RF-8
  **Done when:** la URL usa el host configurado, path público y origen de tienda codificado.

- [x] **T9.** Implementar y probar `shared/api/account/post-logout/`: POST con credenciales y propagación de error.
  **RF:** RF-6, RF-7, RF-8
  **Done when:** un error no se interpreta como logout exitoso.

- [x] **T10.** Implementar y probar `lib/login-error-from-url/` para consumir `login_error=1` y preservar otros parámetros.
  **RF:** RF-12
  **Done when:** limpia solo el indicador consumido mediante `history.replaceState`.

## Estado y UI compartida

- [x] **T11.** Implementar y probar `hooks/use-account-session/` con estados loading, anonymous, authenticated y unreachable.
  **RF:** RF-4, RF-7, RF-11, RF-12
  **Done when:** cubre hidratación, avisos, logout exitoso/fallido y cleanup de montaje.

- [x] **T12.** Implementar `AccountSession/ui/` con `AccountSession`, `GuestActions`, `SignedInActions` y `SessionNotice`.
  **RF:** RF-2, RF-3, RF-5, RF-10, RF-11, RF-12
  **Done when:** cada estado muestra acciones mutuamente coherentes y avisos accesibles.

- [x] **T13.** Probar la UI de AccountSession, incluyendo error de login y logout exitoso.
  **RF:** RF-2, RF-5, RF-6, RF-7, RF-10, RF-11, RF-12
  **Done when:** los tests verifican Entrar, nombre, Salir y avisos según estado.

## Calidad

- [x] **T14.** Mantener tests de Layout y Storefront junto a sus definiciones.
  **RF:** RF-1, RF-9
  **Done when:** se verifica chrome persistente y ausencia de catálogo/checkout.

- [x] **T15.** Ejecutar `npm test` y `npm audit --audit-level=moderate`.
  **RF:** RF-1 a RF-12
  **Done when:** unit, lint, build y audit pasan; actualmente 21 tests y 0 vulnerabilidades.

- [ ] **T16.** Realizar comprobación manual móvil/escritorio del flujo completo.
  **RF:** RF-1 a RF-12
  **Done when:** se demuestra carga anónima, login, retorno, sesión, logout y avisos desde 320 px y escritorio.
