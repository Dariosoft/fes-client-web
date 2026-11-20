# UML 002 — Storefront con grilla de productos y buscador en el header

Diagramas del desarrollo planificado para `client-web`. Reflejan los archivos, contratos y flujos de `spec.md`, `plan.md` y `tasks.md`.

## Estructura de módulos

```text
src/app/
├── shared/
│   ├── api/catalog/
│   │   ├── constants.ts
│   │   ├── types.ts
│   │   └── get-published-products/
│   │       ├── get-published-products.ts
│   │       └── get-published-products.test.ts
│   └── config/
│       ├── api-base-url.ts
│       └── catalog-search.ts
└── views/
    ├── Layout/
    │   ├── Layout.tsx
    │   ├── Layout.test.tsx
    │   └── ProductSearch/
    │       ├── ProductSearch.tsx
    │       └── ProductSearch.test.tsx
    └── Storefront/
        ├── Storefront.tsx
        ├── Storefront.test.tsx
        ├── constants.ts
        ├── hooks/use-published-products/
        ├── lib/read-catalog-search/
        ├── lib/format-price/
        ├── ProductGrid/
        ├── ProductCard/
        ├── ProductGridPagination/
        └── ProductGridStatus/
```

## Composición de componentes

```mermaid
flowchart TB
  Main["main.tsx<br/>StrictMode + createRoot"] --> App["App<br/>RouterProvider"]
  App --> Routes["routes.tsx"]
  Routes --> Layout["Layout<br/>header sticky + Outlet"]
  Layout --> Brand["Marca Friendly E-Shop"]
  Layout --> Search["ProductSearch<br/>form role=search"]
  Layout --> Account["AccountSession<br/>sin cambios de contrato"]
  Layout --> Storefront["Storefront<br/>index route"]

  Search --> SearchConfig["CATALOG_SEARCH_PARAMS<br/>page=1 + name"]
  Storefront --> ReadSearch["readCatalogSearch<br/>normaliza name y page"]
  Storefront --> Hook["usePublishedProducts"]
  Hook --> Client["getPublishedProducts"]
  Client --> BaseUrl["getApiBaseUrl<br/>VITE_API_BASE_URL"]
  Client --> CatalogApi["catalog-api<br/>GET /catalog/products/published"]

  Storefront --> Grid["ProductGrid"]
  Grid --> Card["ProductCard"]
  Card --> FormatPrice["formatPrice<br/>Intl es-AR"]
  Storefront --> Pagination["ProductGridPagination"]
  Storefront --> Status["ProductGridStatus<br/>loading · empty · error"]
  Status --> Retry["retry()"]
  Retry --> Hook
  Pagination --> SearchConfig
  ReadSearch --> SearchConfig
```

## Modelo de datos y contrato

```mermaid
classDiagram
  class PublishedProductsResponse {
    +List~PublishedProduct~ items
    +number page
    +number size
    +number totalItems
    +number totalPages
  }

  class PublishedProduct {
    +string id
    +string name
    +number price
    +string currency
    +number stock
    +List~ProductImage~ images
  }

  class ProductImage {
    +string id
    +string url
  }

  class CatalogSearch {
    +string name
    +number page
    +boolean shouldCanonicalizePage
  }

  class CatalogSearchConfig {
    +number CATALOG_PAGE_SIZE
    +number CATALOG_SEARCH_MAX_LENGTH
    +normalizeCatalogSearchTerm(raw) string
  }

  class GetPublishedProductsInput {
    +string name
    +number page
    +AbortSignal signal
  }

  class GetPublishedProducts {
    +getPublishedProducts(input) PublishedProductsResponse
  }

  class PublishedProductsState {
    <<union>>
    +string status
    +PublishedProductsResponse data
    +Error error
  }

  PublishedProductsResponse *-- PublishedProduct
  PublishedProduct *-- ProductImage
  CatalogSearch ..> CatalogSearchConfig
  GetPublishedProducts ..> GetPublishedProductsInput
  GetPublishedProducts ..> PublishedProductsResponse
  PublishedProductsState ..> PublishedProductsResponse
```

- `price` se recibe como número JSON (`BigDecimal` serializado por `catalog-api`).
- `currency` se espera `ARS` o `USD`; `formatPrice` produce `$ 1.234,50` y `US$ 1.234,50`.
- `images` puede ser vacío: `ProductCard` muestra el marcador `ImageOff` con «Sin imagen».
- `totalPages = 0` con `totalItems = 0` representa catálogo o búsqueda sin resultados, no un error.

### Contrato HTTP

| Operación | Método | Path | Query | Credenciales |
| --- | --- | --- | --- | --- |
| Leer productos publicados | GET | `/catalog/products/published` | `name` opcional, `page` desde 1, `size=24` | `omit` |

El host se resuelve con `getApiBaseUrl()` a partir de `VITE_API_BASE_URL`. La tienda no envía cookies ni cabeceras de sesión.

## Flujo principal de búsqueda y carga

```mermaid
sequenceDiagram
  actor V as Visitante
  participant PS as ProductSearch
  participant R as Router/URL
  participant S as Storefront
  participant RS as readCatalogSearch
  participant H as usePublishedProducts
  participant C as getPublishedProducts
  participant A as catalog-api

  V->>PS: escribe término y presiona Enter o la lupa
  PS->>PS: trim + slice(0, 100)
  PS->>R: navigate /?name=...&page=1
  R-->>S: cambian searchParams
  S->>RS: readCatalogSearch(searchParams)
  RS-->>S: { name, page, shouldCanonicalizePage }
  opt page presente e inválida
    S->>R: replace ?name=...&page=1
  end
  S->>H: usePublishedProducts(name, page)
  H->>C: getPublishedProducts({ name, page, signal })
  C->>A: GET /catalog/products/published?name&page&size=24<br/>credentials omit
  alt respuesta válida
    A-->>C: 200 { items, page, size, totalItems, totalPages }
    C-->>H: PublishedProductsResponse validada
    H-->>S: state success
    alt page > totalPages o totalPages = 0 con page > 1
      S->>R: replace ?name=...&page=1
      S-->>V: estado de carga y nueva consulta
    else página válida
      S-->>V: grilla de hasta 24 tarjetas + paginación
    end
  else HTTP fallido, red o JSON inválido
    A-->>C: error / respuesta inválida
    C-->>H: Error
    H-->>S: state error
    S-->>V: alerta en español + botón Reintentar
    V->>S: clic Reintentar
    S->>H: retry()
    H->>C: nueva consulta
  end
```

## Flujo de paginación

```mermaid
sequenceDiagram
  actor V as Visitante
  participant P as ProductGridPagination
  participant R as Router/URL
  participant S as Storefront
  participant H as usePublishedProducts
  participant A as catalog-api

  V->>P: elige Página N
  P->>R: ?name=<término activo>&page=N
  R-->>S: cambian searchParams
  S->>H: usePublishedProducts(name, N)
  H->>A: GET /catalog/products/published?name&page=N&size=24
  A-->>H: items de la página N + totales
  H-->>S: success
  S-->>V: 24 productos de la página N y paginación actualizada
```

## Estados de la lectura

```mermaid
stateDiagram-v2
  [*] --> loading
  loading --> success: respuesta válida
  loading --> error: HTTP, red o JSON inválido
  error --> loading: Reintentar
  success --> loading: cambia name o page
  success --> corrigiendo: page fuera de rango
  corrigiendo --> loading: replace a page=1
  loading --> loading: aborto por cambio de parámetros
```

- `loading` muestra esqueletos con `role="status"` y mantiene el buscador del header usable.
- `success` con `totalItems > 0` muestra `ProductGrid` y `ProductGridPagination`.
- `success` con `totalItems = 0` muestra vacío por búsqueda si hay `name`, o catálogo vacío si no lo hay.
- `error` muestra `role="alert"` y el botón «Reintentar», que vuelve a `loading`.
- `corrigiendo` nunca renderiza la página ajustada por la API: la URL se reemplaza por `page=1` y se consulta de nuevo.

## Reglas de URL

| Caso | Resultado |
| --- | --- |
| `/` | `name = ''`, `page = 1`, sin reescritura. |
| `/?page=2` | Consulta página 2 sin filtro. |
| `/?name=zapatilla&page=3` | Consulta página 3 filtrada por «zapatilla». |
| `/?name=%20%20&page=1` | Se aplica sin filtro y `name` se omite al enviar. |
| `/?page=abc` | Se consulta `page=1` y la URL se reemplaza por `?page=1`. |
| `/?page=99` con `totalPages=3` | Se reemplaza la URL por `?page=1` y se consulta de nuevo. |
| Término de más de 100 caracteres | Se recorta a 100 antes de navegar y consultar. |
