# UML 001 — Storefront con entrada Google opcional

Diagramas y prosa alineados al código de la rama `001/feat-storefront-google-login`.

## 1. Árbol de features (as-built)

`main.tsx` solo hace bootstrap (`StrictMode` + `createRoot`) e importa `styles.css` (Tailwind 4 + `@theme`). `app/App.tsx` no habla con la red: compone el escaparate y el chrome de sesión vía slot.

```text
src/
├── main.tsx
├── styles.css                        # @import "tailwindcss" + @theme (tokens)
├── vite-env.d.ts                     # VITE_API_BASE_URL?
├── test/setup.ts
├── app/
│   └── App.tsx                       # StorefrontPage + sessionSlot={SessionChrome}
├── shared/config/
│   └── api-base-url.ts               # getApiBaseUrl(); fallback DuckDNS
└── features/
    ├── storefront-home/
    │   ├── components/StorefrontPage.tsx
    │   ├── components/StorefrontPage.test.tsx
    │   └── index.ts
    └── account-session/
        ├── api/get-session.ts
        ├── api/post-logout.ts
        ├── api/build-google-login-url.ts
        ├── hooks/use-account-session.ts
        ├── lib/login-error-from-url.ts   # login_error=1
        ├── components/SessionChrome.tsx
        ├── components/GuestActions.tsx
        ├── components/SignedInActions.tsx
        ├── components/SessionNotice.tsx
        ├── types.ts
        └── index.ts                      # exporta SessionChrome (+ tipos)
```

**Base URL:** `getApiBaseUrl()` = `import.meta.env.VITE_API_BASE_URL ?? 'https://api.friendly-e-shop.duckdns.org'`. Todos los `fetch` y la URL de login Google pasan por esta función. No hay CSS colocalizado por feature: utilidades Tailwind en los componentes.

## 2. Composición en App

```mermaid
flowchart TB
  main["main.tsx<br/>StrictMode + createRoot"] --> App["app/App.tsx"]
  App --> SP["StorefrontPage<br/>features/storefront-home"]
  App --> SC["SessionChrome<br/>vía sessionSlot"]
  SP -->|"sessionSlot en header"| SC
  SC --> Hook["useAccountSession"]
  Hook --> API["api: get-session / post-logout / build-google-login-url"]
  API --> Base["getApiBaseUrl()<br/>VITE_API_BASE_URL o DuckDNS"]
  Hook --> Lib["consumeLoginErrorFromUrl<br/>login_error=1"]
  SC --> Guest["GuestActions"]
  SC --> Signed["SignedInActions"]
  SC --> Notice["SessionNotice"]
```

## 3. Flujo de componentes (chrome)

```mermaid
flowchart TD
  Start([SessionChrome monta]) --> Load[useAccountSession: GET /accounts/session]
  Load --> Status{status}
  Status -->|loading| Idle[Escaparate usable; sin CTA]
  Status -->|authenticated| Signed[SignedInActions: nombre + Salir]
  Status -->|anonymous| Guest[GuestActions: Entrar con Google]
  Status -->|unreachable| Unreach[GuestActions + SessionNotice sesión]
  Load --> ErrURL{login_error=1<br/>y sin sesión válida?}
  ErrURL -->|sí| LoginFail[SessionNotice: No se pudo entrar]
  ErrURL -->|no| Skip[Sin aviso de login]
  Signed -->|Salir OK| PostOut[POST /accounts/logout] --> Anon[anonymous]
  Guest -->|clic| Nav[location.assign login Google]
```

## 4. Secuencia — carga en frío (sesión OK anónima o autenticada)

```mermaid
sequenceDiagram
  actor U as Visitante
  participant App as App / StorefrontPage
  participant SC as SessionChrome
  participant Hook as useAccountSession
  participant API as account-api

  U->>App: Abre la tienda
  App->>SC: sessionSlot monta chrome
  SC->>Hook: montaje
  Hook->>Hook: consumeLoginErrorFromUrl (sin param)
  Hook->>API: GET /accounts/session credentials include
  alt authenticated false
    API-->>Hook: { authenticated: false }
    Hook-->>SC: anonymous
    SC-->>U: Entrar con Google
  else authenticated true
    API-->>Hook: { authenticated, name, ... }
    Hook-->>SC: authenticated + account
    SC-->>U: nombre + Salir
  end
  Note over App,U: El escaparate no se bloquea durante loading
```

## 5. Secuencia — Entrar con Google

```mermaid
sequenceDiagram
  actor U as Visitante
  participant Guest as GuestActions
  participant Build as buildGoogleLoginUrl
  participant API as account-api / Google

  U->>Guest: Clic «Entrar con Google»
  Guest->>Build: buildGoogleLoginUrl(window.location.origin)
  Build-->>Guest: {apiBase}/accounts/login/google?return_to=...
  Guest->>API: location.assign(url)
  Note over U,API: OAuth fuera del bundle; sin client id en client-web
  API-->>U: Redirect a return_to (origin de la tienda)
```

## 6. Secuencia — retorno con `login_error=1`

```mermaid
sequenceDiagram
  actor U as Visitante
  participant Hook as useAccountSession
  participant Lib as consumeLoginErrorFromUrl
  participant API as account-api
  participant UI as SessionChrome

  U->>Hook: Carga con ?login_error=1
  Hook->>Lib: consumeLoginErrorFromUrl()
  Lib->>Lib: detecta login_error=1
  Lib->>Lib: history.replaceState (limpia query)
  Lib-->>Hook: true
  Hook->>API: GET /accounts/session
  API-->>Hook: authenticated false (o red falla)
  Hook-->>UI: anonymous|unreachable + notice login-failed
  UI-->>U: «No se pudo entrar.» + Entrar con Google
```

## 7. Secuencia — Salir

```mermaid
sequenceDiagram
  actor U as Usuario
  participant Signed as SignedInActions
  participant Hook as useAccountSession
  participant API as account-api

  U->>Signed: Clic «Salir»
  Signed->>Hook: logout()
  Hook->>API: POST /accounts/logout credentials include
  API-->>Hook: OK
  Hook-->>Signed: status anonymous, account null
  Note over U,Signed: Si el POST falla, no se finge salida
```

## 8. Secuencia — sesión inalcanzable

```mermaid
sequenceDiagram
  actor U as Visitante
  participant Hook as useAccountSession
  participant API as account-api
  participant UI as SessionChrome

  U->>Hook: Carga fría
  Hook->>API: GET /accounts/session
  API-->>Hook: red caída / no OK / JSON inválido
  Hook-->>UI: unreachable + notice session-unreachable
  UI-->>U: Escaparate usable + Entrar + «No se pudo comprobar la sesión.»
```
