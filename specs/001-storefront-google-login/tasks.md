# Tasks 001 — Storefront con entrada Google opcional

Tareas pequeñas (≈20–30 min), en orden de dependencia. Cada una indica los RF que cubre y un criterio verificable «Done when:».

## Semilla de arquitectura y config

- [x] **T1.** Crear `src/shared/config/api-base-url.ts` con `getApiBaseUrl()` leyendo `VITE_API_BASE_URL` y fallback `https://api.friendly-e-shop.duckdns.org`.  
  **RF:** RF-8  
  **Done when:** Un módulo exporta la base URL del entorno activo y, sin variable, usa el valor por defecto DuckDNS.

- [x] **T2.** Crear `src/app/App.tsx` (composición sin lógica de red) y reducir `src/main.tsx` a bootstrap StrictMode + `createRoot` montando `App`.  
  **RF:** RF-1, RF-9  
  **Done when:** La SPA arranca desde `App` y el shell deja de concentrar UI y red en `main.tsx`.

## Feature account-session — contratos y datos

- [x] **T3.** Crear `features/account-session/types.ts` con `AccountSessionResponse` (`authenticated: false` | `authenticated: true` + `id`, `email`, `name`) y exportar la API pública en `index.ts` (esqueleto).  
  **RF:** RF-4, RF-10  
  **Done when:** Los tipos públicos de sesión están tipados y el feature expone un `index.ts` sin imports cruzados hacia `storefront-home`.

- [x] **T4.** Implementar `features/account-session/api/get-session.ts`: `GET {apiBase}/accounts/session` con `credentials: 'include'`, usando `getApiBaseUrl()`.  
  **RF:** RF-4, RF-8  
  **Done when:** La función llama al contrato de sesión con credenciales y construye la URL solo desde la config compartida.

- [x] **T5.** Implementar `features/account-session/api/build-google-login-url.ts`: `{apiBase}/accounts/login/google?return_to=` con `encodeURIComponent` del `origin` de la tienda.  
  **RF:** RF-3, RF-8  
  **Done when:** Dado un origin de prueba, la URL resultante apunta al login Google del entorno con `return_to` correctamente codificado.

- [x] **T6.** Implementar `features/account-session/api/post-logout.ts`: `POST {apiBase}/accounts/logout` con `credentials: 'include'`.  
  **RF:** RF-6, RF-8  
  **Done when:** La función publica el logout con credenciales y no hardcodea hosts fuera de `getApiBaseUrl()`.

- [x] **T7.** Implementar `features/account-session/lib/login-error-from-url.ts`: detectar el indicador `login_error=1` del `return_to` (mismo parámetro que account-api) y limpiarlo con `history.replaceState`.  
  **RF:** RF-12  
  **Done when:** Con el indicador presente en `search`, la utilidad lo detecta y, tras leerlo, la URL queda sin ese parámetro; sin indicador, no altera el estado de error.

- [x] **T8.** Implementar `hooks/use-account-session.ts`: al montar consulta sesión una vez; estados `loading | anonymous | authenticated | unreachable`; aplica indicador de error de URL cuando no hay sesión válida.  
  **RF:** RF-4, RF-11, RF-12  
  **Done when:** Mock 200 anónimo → `anonymous`; 200 con nombre → `authenticated`; red/5xx → `unreachable`; indicador de error + sin sesión → aviso de fallo de entrada sin tumbar la página.

## Feature account-session — UI del chrome

- [x] **T9.** Crear `SessionNotice.tsx` con textos en español, `role="alert"` / `aria-live="polite"` para avisos de sesión inalcanzable y de fallo al entrar.  
  **RF:** RF-11, RF-12  
  **Done when:** Cada aviso se anuncia de forma accesible y el copy coincide con «no se pudo comprobar la sesión» / «no se pudo entrar».

- [x] **T10.** Crear `GuestActions.tsx`: CTA «Entrar con Google» que navega con `location.assign` a la URL de T5; visible solo sin sesión (incl. `unreachable` y fallo de login); sin Salir.  
  **RF:** RF-2, RF-3  
  **Done when:** En estado visitante/unreachable se muestra Entrar; el clic navega a la URL de login Google con `return_to`; no aparece Salir.

- [x] **T11.** Crear `SignedInActions.tsx`: muestra solo el `name` y el control «Salir»; al éxito de `post-logout` el hook pasa a anónimo (si el POST falla, no fingir salida).  
  **RF:** RF-5, RF-6, RF-7, RF-10  
  **Done when:** Con sesión se ven nombre + Salir (sin Entrar ni email/id); tras POST OK la UI deja de tratar al visitante como autenticado.

- [x] **T12.** Crear `SessionChrome.tsx` que orquesta el hook y las variantes Guest / SignedIn / Notice; en `loading` no bloquea el escaparate.  
  **RF:** RF-1, RF-2, RF-5, RF-11  
  **Done when:** El chrome elige la variante correcta según el estado y, mientras carga, la página del escaparate sigue usable sin modal bloqueante.

## Feature storefront-home y composición

- [x] **T13.** Crear `features/storefront-home` con `StorefrontPage.tsx` (header semántico + slot de sesión + main con hero de tienda) e `index.ts` público; sin catálogo ni compra.  
  **RF:** RF-1, RF-9  
  **Done when:** La página muestra marca, titular y frase de apoyo de escaparate; no hay listado de productos ni flujo de compra; acepta `sessionSlot`/`children` sin importar rutas internas de `account-session`.

- [x] **T14.** Componer en `App.tsx`: `<StorefrontPage sessionSlot={<SessionChrome />} />` importando solo APIs públicas de features.  
  **RF:** RF-1, RF-2, RF-5, RF-9  
  **Done when:** La app monta escaparate + chrome de sesión; no hay imports cruzados entre features por rutas internas.

## Estilos, accesibilidad y responsive

- [x] **T15.** Configurar Tailwind 4 (`tailwindcss` + `@tailwindcss/vite`) y tokens en `src/styles.css` (`@theme` / `--color-*` / tipografía); aspecto de e-commerce amigable, layout usable desde 320 px, `focus-visible`, targets táctiles ≥ 44 px y `motion-reduce` si hay transiciones. Sin CSS colocalizado por feature.  
  **RF:** RF-1, RF-9  
  **Done when:** En 320 px y escritorio no hay scroll horizontal por el chrome; foco visible en Entrar/Salir; textos de UI en español.

## Pruebas

- [x] **T16.** Crear `src/test/setup.ts` (Testing Library + jest-dom) y tests de `build-google-login-url` + SessionChrome/hook (anónimo, autenticado, red caída).  
  **RF:** RF-2, RF-3, RF-4, RF-5, RF-8, RF-10, RF-11  
  **Done when:** `npm test` ejecuta esos casos en verde: Entrar sin Salir; nombre+Salir; aviso si sesión inalcanzable; URL de login con `return_to` encoded.

- [x] **T17.** Tests de `login-error-from-url` + logout exitoso + smoke de `StorefrontPage` (sin catálogo/compra).  
  **RF:** RF-1, RF-6, RF-7, RF-9, RF-12  
  **Done when:** Aviso «no se pudo entrar» con indicador + sesión anónima; tras POST logout OK la UI es anónima; la página de tienda no renderiza catálogo ni compra.

## Verificación de cierre

- [ ] **T18.** Pasada manual móvil/escritorio: tienda usable sin login; Entrar lleva al contrato con `return_to` al origin; carga consulta sesión con credenciales; Salir deja estado sin sesión; avisos RF-11/RF-12.  
  **RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12  
  **Done when:** Los criterios de finalización de la spec se demuestran a mano en ambos anchos y `npm test` (lint, typecheck, build) pasa.
