# Plan 001 — Storefront con entrada Google opcional

Plan técnico alineado al código actual de `client-web` en la rama `001/feat-storefront-google-login`.

## Objetivo

Mantener una tienda pública usable sin autenticación y ofrecer, de forma opcional, Entrar con Google, consultar la sesión compartida y Salir. El cliente consume exclusivamente los contratos públicos de cuenta bajo la URL de API configurada.

## Estado tecnológico

- React 19.3, TypeScript estricto y Vite 8.
- SPA con `react-router-dom` 7.18.4.
- Tailwind CSS 4 mediante `@tailwindcss/vite` y tokens en `src/styles.css`.
- Vitest 5 + Testing Library.
- Dependencias fijadas a versiones exactas; audit actual sin vulnerabilidades.
- `main.tsx` solo monta `App` dentro de `StrictMode` e importa estilos globales.

## Arquitectura actual

```text
src/
├── main.tsx
├── styles.css
├── vite-env.d.ts
├── test/
│   └── setup.ts
└── app/
    ├── App.tsx                         # RouterProvider
    ├── routes.tsx                      # Layout + ruta index Storefront
    ├── views/
    │   ├── Layout/
    │   │   ├── Layout.tsx              # chrome global + Outlet
    │   │   └── Layout.test.tsx
    │   └── Storefront/
    │       ├── Storefront.tsx          # vista index
    │       └── Storefront.test.tsx
    └── shared/
        ├── config/
        │   └── api-base-url.ts
        ├── api/
        │   └── account/
        │       ├── constants.ts
        │       ├── types.ts
        │       ├── get-session/
        │       ├── post-logout/
        │       └── build-google-login-url/
        └── components/
            └── AccountSession/
                ├── constants.ts
                ├── ui/
                │   ├── AccountSession.tsx
                │   ├── AccountSession.test.tsx
                │   ├── AccountSession.logout.test.tsx
                │   ├── GuestActions.tsx
                │   ├── SignedInActions.tsx
                │   └── SessionNotice.tsx
                ├── hooks/
                │   └── use-account-session/
                │       ├── use-account-session.ts
                │       └── use-account-session.test.tsx
                └── lib/
                    └── login-error-from-url/
```

### Responsabilidades

| Área | Responsabilidad |
| --- | --- |
| `App.tsx` | Montar `RouterProvider`; no contiene UI ni red. |
| `routes.tsx` | Declarar `Layout` como ruta padre y `Storefront` como index route. |
| `views/Layout` | Mantener header, marca, favicon, sesión global y `<Outlet />`. |
| `views/Storefront` | Renderizar solo el contenido de la vista inicial, sin chrome global. |
| `shared/config` | Resolver configuración transversal, hoy `VITE_API_BASE_URL`. |
| `shared/api/account` | Centralizar paths, parámetros, DTOs, clientes HTTP y URL de login del dominio de cuenta. |
| `AccountSession/ui` | Renderizar las variantes visible, anónima, autenticada y de aviso. |
| `AccountSession/hooks` | Orquestar estado, ciclo de vida, consulta de sesión y logout. |
| `AccountSession/lib` | Alojar lógica privada no React ni HTTP, como consumir `login_error`. |
| `AccountSession/constants.ts` | Centralizar estados y avisos estables de la UI de sesión. |

## Composición SPA

`App` monta el router. `Layout` permanece activo entre navegaciones y renderiza la vista actual mediante `<Outlet />`. La ruta index (`/`) muestra `Storefront`.

El header global usa `/favicon.svg` y monta `AccountSession`. `Storefront` no conoce la sesión ni duplica el header.

**Cubre:** RF-1, RF-2, RF-5, RF-9, RF-10.

## Configuración de API

`src/app/shared/config/api-base-url.ts` exporta `getApiBaseUrl()`:

```ts
import.meta.env.VITE_API_BASE_URL ?? 'https://api.friendly-e-shop.duckdns.org'
```

Todos los contratos de cuenta usan esa función. Las rutas relativas, parámetros y DTOs viven en `shared/api/account/`; no se hardcodean hosts ni endpoints en UI, vistas o hooks.

**Cubre:** RF-8.

## Contratos de cuenta

### Consultar sesión

- `GET {apiBase}/accounts/session`.
- `credentials: 'include'`.
- Valida la forma JSON antes de devolverla.
- Respuesta anónima: `{ authenticated: false }`.
- Respuesta autenticada: `{ authenticated: true, id, email, name }`.

### Entrar con Google

- Construye `{apiBase}/accounts/login/google?return_to={origin codificado}`.
- `GuestActions` navega con `window.location.assign`.
- No incluye SDK, client id ni llamadas directas a Google.

### Salir

- `POST {apiBase}/accounts/logout`.
- `credentials: 'include'`.
- Solo pasa a estado anónimo después de una respuesta exitosa.
- Si falla, conserva el estado autenticado.

**Cubre:** RF-3, RF-4, RF-6, RF-7, RF-8.

## Estado de sesión

`useAccountSession` maneja los estados definidos en `constants.ts`:

- `loading`: consulta inicial en curso; no bloquea la vista.
- `anonymous`: muestra Entrar con Google.
- `authenticated`: muestra solo nombre y Salir.
- `unreachable`: mantiene la tienda usable, muestra Entrar y un aviso.

Los avisos estables son `login-failed` y `session-unreachable`.

Al montar, el hook consume `login_error=1`, limpia el parámetro con `history.replaceState` y combina ese resultado con la respuesta de sesión. El cleanup evita actualizar estado después del desmontaje.

**Cubre:** RF-2, RF-4, RF-5, RF-10, RF-11, RF-12.

## UI y accesibilidad

- `AccountSession` selecciona las variantes de UI según el estado.
- `GuestActions` ofrece «Entrar con Google».
- `SignedInActions` muestra el nombre y «Salir»; no muestra email ni id.
- `SessionNotice` usa `role="alert"` y `aria-live="polite"`.
- Controles con foco visible, targets táctiles mínimos y soporte `motion-reduce`.
- Layout responsive desde 320 px.
- `Storefront` mantiene el aspecto de tienda sin catálogo, carrito ni compra en este corte.

## Estrategia de archivos y tests

- Las vistas viven en `app/views/<ViewName>/` y su definición está en la raíz de su carpeta.
- Los componentes reutilizables viven en `app/shared/components/`.
- Todos los clientes de APIs externas viven en `app/shared/api/`, separados por dominio; actualmente `shared/api/account/`.
- Cada definición con companions se agrupa con sus tests, estilos, stories o fixtures.
- Archivos presentacionales simples sin companions permanecen planos dentro de `ui/`.
- Los hooks de componente viven bajo `hooks/`; utilidades privadas bajo `lib/`.
- Los tests de contrato mantienen strings esperados explícitos para no repetir el mismo error de las constantes de producción.

Cobertura actual:

- `AccountSession`: variantes anónima, autenticada, inalcanzable, error de login y logout.
- `useAccountSession`: transiciones de hidratación y logout, incluyendo fallos.
- Clientes API: URL, método, credenciales, validación y errores.
- Utilidad URL: detección y limpieza de `login_error`.
- `Layout`: chrome persistente alrededor de contenido routeado.
- `Storefront`: contenido inicial sin catálogo ni checkout.

Comandos de cierre: `npm test` y `npm audit --audit-level=moderate`.

## Fuera de alcance

- Llamadas a panel-api o a APIs Java de dominio.
- Llamadas directas a Google.
- Catálogo, carrito, checkout o publicación.
- Guardar o administrar cuentas.
- Keycloak u otros proveedores de identidad.

## Matriz RF

| RF | Cobertura técnica |
| --- | --- |
| RF-1 | Layout, Storefront, responsive y carga no bloqueante. |
| RF-2 | Estado anonymous/unreachable y GuestActions. |
| RF-3 | buildGoogleLoginUrl y navegación completa. |
| RF-4 | getSession y useAccountSession. |
| RF-5 | Estado authenticated y SignedInActions. |
| RF-6 | postLogout y acción Salir. |
| RF-7 | Transición a anonymous después de logout exitoso. |
| RF-8 | getApiBaseUrl y contrato centralizado en shared/api/account. |
| RF-9 | Storefront sin catálogo ni compra. |
| RF-10 | SignedInActions muestra solo nombre. |
| RF-11 | Estado unreachable y SessionNotice. |
| RF-12 | consumeLoginErrorFromUrl y aviso login-failed. |
