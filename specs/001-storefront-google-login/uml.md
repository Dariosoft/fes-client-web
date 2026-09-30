# UML 001 — Storefront con entrada Google opcional

Diagramas alineados con la implementación actual de `client-web`.

## Estructura

```text
src/app/
├── App.tsx
├── routes.tsx
├── views/
│   ├── Layout/
│   │   ├── Layout.tsx
│   │   └── Layout.test.tsx
│   └── Storefront/
│       ├── Storefront.tsx
│       └── Storefront.test.tsx
└── shared/
    ├── config/api-base-url.ts
    ├── api/account/
    │   ├── constants.ts
    │   ├── types.ts
    │   ├── get-session/
    │   ├── post-logout/
    │   └── build-google-login-url/
    └── components/AccountSession/
        ├── constants.ts
        ├── ui/
        │   ├── AccountSession.tsx
        │   ├── GuestActions.tsx
        │   ├── SignedInActions.tsx
        │   └── SessionNotice.tsx
        ├── hooks/use-account-session/
        └── lib/login-error-from-url/
```

## Composición SPA

```mermaid
flowchart TB
  Main["main.tsx<br/>StrictMode + createRoot"] --> App["App<br/>RouterProvider"]
  App --> Router["routes.tsx"]
  Router --> Layout["Layout<br/>header + AccountSession + Outlet"]
  Layout --> Storefront["Storefront<br/>index route"]
  Layout --> Account["AccountSession"]
  Account --> UI["ui<br/>Guest · SignedIn · Notice"]
  Account --> Hook["useAccountSession"]
  Hook --> API["shared/api/account"]
  Hook --> Lib["consumeLoginErrorFromUrl"]
  API --> Config["getApiBaseUrl"]
  API --> Contract["paths · params · DTOs"]
  Account --> Constants["states · notices"]
```

## Estados de sesión

```mermaid
stateDiagram-v2
  [*] --> loading
  loading --> authenticated: sesión válida
  loading --> anonymous: authenticated=false
  loading --> unreachable: red, HTTP o JSON inválido
  authenticated --> anonymous: logout exitoso
  authenticated --> authenticated: logout fallido
  anonymous --> anonymous: login_error consume aviso
  unreachable --> unreachable: login_error prioriza aviso de entrada
```

## Carga inicial

```mermaid
sequenceDiagram
  actor U as Visitante
  participant L as Layout
  participant AS as AccountSession
  participant H as useAccountSession
  participant URL as login-error-from-url
  participant API as account-api

  U->>L: abre la SPA
  L->>AS: monta chrome global
  AS->>H: monta hook
  H->>URL: consume login_error
  URL-->>H: presente o ausente
  H->>API: GET /accounts/session<br/>credentials include
  alt sesión autenticada
    API-->>H: authenticated true + identidad
    H-->>AS: authenticated + account
    AS-->>U: nombre + Salir
  else sesión anónima
    API-->>H: authenticated false
    H-->>AS: anonymous
    AS-->>U: Entrar con Google
  else error
    API-->>H: red / HTTP / JSON inválido
    H-->>AS: unreachable + aviso
    AS-->>U: Entrar + aviso
  end
  Note over L,U: Storefront permanece usable durante loading
```

## Entrar con Google

```mermaid
sequenceDiagram
  actor U as Visitante
  participant G as GuestActions
  participant B as buildGoogleLoginUrl
  participant API as account-api

  U->>G: clic Entrar con Google
  G->>B: window.location.origin
  B-->>G: apiBase + /accounts/login/google + return_to
  G->>API: window.location.assign(url)
  Note over U,API: OAuth ocurre fuera del bundle
  API-->>U: redirect al origen de la tienda
```

## Salir

```mermaid
sequenceDiagram
  actor U as Usuario
  participant UI as SignedInActions
  participant H as useAccountSession
  participant API as account-api

  U->>UI: clic Salir
  UI->>H: logout()
  H->>API: POST /accounts/logout<br/>credentials include
  alt respuesta OK
    API-->>H: éxito
    H-->>UI: anonymous + account null
  else error
    API-->>H: error
    H-->>UI: conserva authenticated
  end
```

## Contrato HTTP

| Operación | Método | Path | Credenciales |
| --- | --- | --- | --- |
| Entrar con Google | GET por navegación | `/accounts/login/google?return_to=...` | Navegación completa |
| Consultar sesión | GET | `/accounts/session` | `include` |
| Salir | POST | `/accounts/logout` | `include` |
