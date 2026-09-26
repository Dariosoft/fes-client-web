# Plan 001 — Storefront con entrada Google opcional

Desglose técnico de `spec.md` para `client-web`. No implementa la feature; solo define cómo cubrirla respetando `AGENTS.md`, el código actual y las skills de planificación.

## 1. Objetivo del corte

Convertir el shell estático actual (`src/main.tsx`) en un escaparate de comercio electrónico usable sin autenticación, con Entrar con Google y Salir opcionales, consumiendo solo los contratos públicos de cuenta (`/accounts/login/google`, `/accounts/session`, `/accounts/logout`) vía la URL base de API del entorno.

Historias cubiertas: H1, H2, H3.

## 2. Estado actual del código

- SPA React 19 + TypeScript estricto + Vite; sin router ni librerías de datos.
- `VITE_API_BASE_URL` tipada en `src/vite-env.d.ts`; fallback actual `http://api.friendly-e-shop.test` (alineado con RF-8).
- UI mínima en `src/main.tsx` + `src/styles.css` (marca, titular, enlace a `/catalog`); no hay sesión ni acciones Entrar/Salir.
- `vite.config.ts` apunta a `src/test/setup.ts` (aún ausente): habrá que crearlo al añadir tests.
- Sin aliases `@/`; sin capas `app/` ni `features/`. Este corte introduce la semilla de arquitectura por features.

## 3. Skills a respetar al implementar

| Skill | Aplicación en este plan |
| --- | --- |
| `feature-arch` | Features autocontenidas, capa `app/`, API pública por feature, fetch colocalizado, tests junto al feature, sin imports cruzados entre features. |
| `vercel-react-best-practices` | Sin waterfalls innecesarios; una sola consulta de sesión al montar; imports directos (sin barrels profundos); render condicional explícito; lógica de clic en event handlers. |
| `vercel-composition-patterns` | Variantes explícitas de chrome de sesión (visitante vs autenticado) en lugar de booleanos de modo; composición por `children`/slots en el layout. |
| `ui-ux-pro-max` | Aspecto de tienda/e-commerce; foco visible; teclado; avisos con `role="alert"`; targets táctiles ≥ 44px; responsive desde 320 px; sin catálogo ni compra (RF-9). |
| `AGENTS.md` | Textos UI en español; código en inglés; no secretos ni client id de Google en el bundle; no hablar con panel-api ni Google directo; no añadir dependencias sin consulta previa. |

**Dependencias:** no introducir TanStack Query, router ni SDKs de Google en este corte. La sesión es un único `GET`/`POST` con `fetch` y estado local del feature (YAGNI; `AGENTS.md` exige consultar antes de nuevas deps).

## 4. Arquitectura objetivo (semilla)

```text
src/
├── main.tsx                          # bootstrap StrictMode + createRoot
├── vite-env.d.ts
├── styles.css                        # tokens globales + layout de escaparate
├── test/
│   └── setup.ts                      # Testing Library + jest-dom
├── app/
│   └── App.tsx                       # compone features; sin lógica de red
├── shared/
│   └── config/
│       └── api-base-url.ts           # lee VITE_API_BASE_URL + fallback Minikube
└── features/
    ├── storefront-home/              # escaparate (sin catálogo ni compra)
    │   ├── components/
    │   │   └── StorefrontPage.tsx
    │   ├── storefront-home.css       # estilos colocalizados si hacen falta
    │   └── index.ts                  # API pública
    └── account-session/              # sesión compartida vía account-api
        ├── api/
        │   ├── get-session.ts
        │   ├── post-logout.ts
        │   └── build-google-login-url.ts
        ├── components/
        │   ├── SessionChrome.tsx     # contenedor: carga sesión, orquesta UI
        │   ├── GuestActions.tsx      # Entrar con Google (+ avisos)
        │   ├── SignedInActions.tsx   # nombre + Salir
        │   └── SessionNotice.tsx     # aviso breve accesible
        ├── hooks/
        │   └── use-account-session.ts
        ├── lib/
        │   └── login-error-from-url.ts
        ├── types.ts
        ├── account-session.css
        └── index.ts
```

Reglas de importación:

- `app` → features (solo `index.ts`) y `shared`.
- `storefront-home` no importa `account-session` por rutas internas; recibe el chrome de sesión por composición desde `app` (props/`children`).
- `account-session` no importa `storefront-home`.
- `shared` solo genérico (config de base URL).

**Cubre:** RF-1, RF-8, RF-9 (estructura que permite escaparate + chrome de auth sin catálogo).

## 5. Configuración de API del entorno

**Archivo:** `src/shared/config/api-base-url.ts`

- Exportar `getApiBaseUrl(): string` = `import.meta.env.VITE_API_BASE_URL ?? 'http://api.friendly-e-shop.test'`.
- Usar siempre esta función (o constante de módulo) al construir URLs de cuenta; no hardcodear hosts en componentes.
- Docker ya inyecta `VITE_API_BASE_URL` en build (`Dockerfile`); no tocar manifiestos de `infra` en este repo.

**Cubre:** RF-8.

## 6. Contratos públicos de cuenta (cliente)

Tipos en `features/account-session/types.ts` (alineados a account-api RF-11/RF-12; solo campos públicos):

```ts
type AccountSessionResponse =
  | { authenticated: false }
  | { authenticated: true; id: string; email: string; name: string };
```

En UI con sesión válida se muestra **solo** `name` (RF-10); `email`/`id` se tipan por fidelidad al contrato pero no se renderizan en este corte.

### 6.1 Consulta de sesión al cargar

`get-session.ts` + `use-account-session.ts`:

- `GET {apiBase}/accounts/session` con `credentials: 'include'`.
- Disparar al montar el contenedor de sesión (una vez por carga de página).
- Estados del hook: `status: 'loading' | 'anonymous' | 'authenticated' | 'unreachable'`, más `account | null` y `notice | null`.
- Si la respuesta no es OK, red falla o JSON inválido → `unreachable` (no tumbar la página).
- Si `authenticated: false` → `anonymous`.
- Si `authenticated: true` → `authenticated` con `name`.

**Cubre:** RF-4, RF-11.

### 6.2 Entrar con Google

`build-google-login-url.ts`:

- Construir `GET {apiBase}/accounts/login/google?return_to={encodeURIComponent(origen)}`.
- `origen` = `window.location.origin` de la tienda (no inventar hosts).
- En `GuestActions`, el CTA navega con asignación de ubicación (`window.location.assign` / `href`); no hay llamada XHR a Google ni client id en el bundle.

**Cubre:** RF-2, RF-3.

### 6.3 Salir

`post-logout.ts`:

- `POST {apiBase}/accounts/logout` con `credentials: 'include'`.
- Tras éxito (respuesta OK según contrato), el hook pasa a `anonymous`, limpia `account` y deja de mostrar Salir/nombre.
- Si el POST falla, este corte de la spec de tienda no define un aviso de fallo de logout (a diferencia de panel-web); mantener sesión visible y no inventar requisitos. Documentar en implementación: reintentar o dejar estado autenticado hasta éxito (mínimo: no fingir salida si el POST falló).

**Cubre:** RF-5, RF-6, RF-7.

### 6.4 Indicador de error al volver de Google

`login-error-from-url.ts`:

- Al montar, inspeccionar `window.location.search` por el indicador de error que account-api añade al `return_to` cuando Google falla/cancela (account-api RF-10; client-web RF-12).
- Nombre del parámetro: el del contrato público de account-api (consumir el mismo que publique ese servicio; no inventar un canal paralelo ni hablar con Google).
- Si el indicador está presente **y** la sesión resultante no es válida → estado visitante + aviso «No se pudo entrar» (texto en español).
- Tras leer el indicador, limpiarlo de la URL con `history.replaceState` para no remostrar el aviso en refrescos.

**Cubre:** RF-12 (y refuerza RF-2, RF-11 en el mismo shell usable).

## 7. UI del escaparate y chrome de sesión

### 7.1 Página de tienda (`storefront-home`)

- Sustituir el enlace «Comprobar catálogo» como foco principal: hero de escaparate Friendly E-Shop (marca visible, un titular, una frase de apoyo) sin listado de productos ni flujo de compra.
- Layout semántico: `header` (marca + slot de sesión) + `main` (mensaje de tienda).
- Mantener el carácter amigable/moderno del CSS actual (verdes, tipografía expresiva), evolucionándolo a tokens CSS (`--color-*`) sin rediseño ajeno a la marca ni catálogo.

**Cubre:** RF-1, RF-9.

### 7.2 Variantes de sesión (composición, no booleanos de modo)

En `app/App.tsx`:

```tsx
<StorefrontPage
  sessionSlot={<SessionChrome />}
/>
```

- `GuestActions`: botón/enlace «Entrar con Google» visible solo sin sesión (incl. `unreachable` y fallo de login). No mostrar Salir.
- `SignedInActions`: texto con **solo el nombre** + control «Salir». No mostrar Entrar.
- Mientras `loading`: no bloquear el escaparate; el chrome puede omitir acciones o mostrar un estado neutro no modal (la página sigue usable — RF-1).
- `SessionNotice`: avisos breves con `role="alert"` / `aria-live="polite"` para:
  - no se pudo comprobar la sesión (RF-11);
  - no se pudo entrar (RF-12).

**Cubre:** RF-1, RF-2, RF-5, RF-9, RF-10, RF-11, RF-12.

### 7.3 Accesibilidad y responsive (NFR)

- Controles operables por teclado; foco visible (`:focus-visible`).
- Ancho mínimo 320 px; acciones en cabecera que no provoquen scroll horizontal.
- Textos de interfaz en español: «Entrar con Google», «Salir», avisos acordados.
- `prefers-reduced-motion` si se añaden transiciones (150–300 ms).

## 8. Flujos (resumen)

| Momento | Comportamiento | RFs |
| --- | --- | --- |
| Carga anónima OK | Escaparate + Entrar; sin Salir ni nombre | RF-1, RF-2, RF-4, RF-9 |
| Carga con sesión | Escaparate + nombre + Salir | RF-1, RF-4, RF-5, RF-9, RF-10 |
| Carga sesión falla | Escaparate + Entrar + aviso breve | RF-1, RF-2, RF-4, RF-11 |
| Clic Entrar | Navegación a login Google con `return_to` = origin | RF-3, RF-8 |
| Retorno Google OK | Cookie compartida; `GET /accounts/session` → autenticado | RF-4, RF-5, RF-10 |
| Retorno Google con indicador de error | Visitante + Entrar + aviso no se pudo entrar | RF-2, RF-12 |
| Clic Salir OK | `POST /accounts/logout` → estado anónimo en tienda | RF-6, RF-7 |

## 9. Pruebas

Crear `src/test/setup.ts` y tests colocalizados (vitest + Testing Library, ya en `package.json`):

| Prueba | Qué verifica | RFs |
| --- | --- | --- |
| `get-session` / hook: mock 200 `authenticated: false` | Muestra Entrar, no Salir | RF-2, RF-4 |
| mock 200 con `name` | Muestra nombre + Salir, no Entrar | RF-5, RF-10 |
| mock red caída / 5xx | Página usable + Entrar + aviso sesión | RF-11 |
| `build-google-login-url` | URL = `{base}/accounts/login/google?return_to=...` encoded | RF-3, RF-8 |
| `login-error-from-url` + sesión anónima | Aviso «no se pudo entrar» | RF-12 |
| logout éxito | Tras POST OK, UI anónima | RF-6, RF-7 |
| `StorefrontPage` | Sin catálogo/compra; aspecto de tienda | RF-1, RF-9 |

Integración ligera en capa `app` con `fetch` mockeado (no E2E obligatorio en este plan).

Comandos de cierre (post-implementación): `npm test` (unit + lint + build).

## 10. Fuera de alcance (no planificar implementación)

- Llamadas a panel-api, APIs Java de dominio o Google desde el cliente.
- Catálogo, carrito, compra, Publicar.
- Guardar/administrar cuenta.
- Keycloak u otros IdP.
- Cambios en `infra` / nginx salvo que el fallback SPA/`/healthz` se rompa (no debería tocarse).

## 11. Orden sugerido de implementación

1. Semilla `app/` + `shared/config` + mover bootstrap (`RF-8`).
2. Feature `account-session`: tipos, API, hook, URL de login, lectura de indicador (`RF-3`, `RF-4`, `RF-6`, `RF-12`).
3. Componentes Guest / SignedIn / Notice (`RF-2`, `RF-5`, `RF-10`, `RF-11`).
4. Feature `storefront-home` + composición en `App` (`RF-1`, `RF-9`).
5. Estilos/accesibilidad NFR.
6. Tests + `src/test/setup.ts`.
7. Verificación manual móvil/escritorio según criterios de finalización de la spec.

## 12. Matriz RF → secciones del plan

| RF | Secciones |
| --- | --- |
| RF-1 | 4, 7.1, 7.2, 8, 9 |
| RF-2 | 6.2, 7.2, 8, 9 |
| RF-3 | 6.2, 8, 9 |
| RF-4 | 6.1, 8, 9 |
| RF-5 | 6.3, 7.2, 8, 9 |
| RF-6 | 6.3, 8, 9 |
| RF-7 | 6.3, 8, 9 |
| RF-8 | 5, 6.2, 9 |
| RF-9 | 4, 7.1, 7.2, 9 |
| RF-10 | 6 (tipos), 7.2, 8, 9 |
| RF-11 | 6.1, 7.2, 8, 9 |
| RF-12 | 6.4, 7.2, 8, 9 |

Todos los RF-1 … RF-12 quedan cubiertos por este plan.
