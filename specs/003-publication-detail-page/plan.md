# Plan 003 — Detalle público de publicación con descripción y tienda del vendedor

Plan técnico para `client-web` en la rama `003/feat-publication-detail-page`. Implementa `specs/003-publication-detail-page/spec.md` sin modificar manifiestos ni agregar dependencias. Consume los contratos públicos de `catalog-api` y `account-api` y reemplaza la exclusión de detalle y la no interactividad de la tarjeta fijadas en la spec 002.

## Objetivo técnico

Agregar una ruta SPA propia, `/publication/:id`, montada bajo el `Layout` existente, que muestre el detalle público de una publicación: galería de imágenes, nombre, precio formateado, disponibilidad de stock, descripción y nombre público de la tienda del vendedor. La tarjeta de la grilla pasa a ser un enlace accesible que abre el detalle y le informa al detalle el contexto de catálogo (`name`, `page`, `size`) para que la acción de volver lo conserve. Una URL directa o sin contexto válido vuelve al catálogo por defecto.

La URL es la única fuente de verdad de la identidad de la publicación (`/publication/:id`); el detalle no mantiene polling ni actualización automática. Si la publicación deja de ser visible mientras se mira, el contenido ya cargado permanece hasta recargar o navegar.

## Decisiones de arquitectura

| Decisión | Motivo | Regla aplicada / RF |
| --- | --- | --- |
| Ruta hija `publication/:id` dentro del `Layout`. | Conserva header, marca, buscador y `AccountSession` sin duplicarlos; el cambio de vista ocurre en `<Outlet />`. | `struct-app-layer`, `bound-feature-isolation`; RF-13, RF-23, RF-24 |
| El detalle es una vista propia en `views/PublicationDetail/`. | Evita acoplar `Storefront` con el detalle y respeta `import-no-cross-feature`. | `import-no-cross-feature`, `struct-feature-self-contained` |
| `formatPrice` se promueve a `shared/lib/format-price/`. | La grilla y el detalle formatean precios con la misma regla es-AR; el detalle no puede importar una utilidad privada de `Storefront`. | `struct-shared-layer`, `import-no-cross-feature`; RF-8 |
| `ProductImageCarousel` se promueve a `shared/components/ProductImageCarousel/`. | La galería del detalle y la portada de la tarjeta comparten navegación circular, textos accesibles y comportamiento con varias imágenes. | `struct-shared-layer`, `fcomp-single-responsibility`; RF-4, RF-5, RF-6 |
| Los controles del carrusel pasan a un área mínima de 44 px. | La spec 003 exige 44 px para los controles accionables del detalle; se unifica el componente para que la tarjeta también cumpla. | Requisito no funcional; RF-4, RF-5 |
| Se crea `shared/lib/catalog-location/` para construir y validar el contexto de catálogo. | La tarjeta, `Storefront` y el detalle comparten el contrato de retorno (`name`, `page`, `size`) sin duplicar formato de URL ni confiar en `state` sin validar. | `bound-interface-contracts`, `import-unidirectional-flow`; RF-21 |
| Los clientes API viven en `shared/api/catalog/` y `shared/api/account/`. | Las vistas consumen clientes y no implementan `fetch` ni conocen endpoints; cada cliente valida estrictamente la forma JSON y propaga abortos. | `struct-shared-layer`, `fquery-single-responsibility`; RF-14, RF-15, RF-27 |
| El hook del detalle orquesta publicación y tienda por separado. | La tienda es opcional: si su consulta falla, no existe o tarda, el detalle de la publicación sigue operativo y el bloque de tienda se oculta. | `fcomp-error-boundaries`, `bound-minimize-shared-state`; RF-12, RF-27, RF-28 |
| Sin librería de consultas nueva ni polling. | No hay dependencia instalada; `AbortController` + clave de solicitud cubren carga, error, reintento y respuestas viejas. La spec prohíbe actualización automática en vivo. | `fstate-server-state-separation`; RF-17, RF-19, RF-29 |
| La tarjeta usa un `<Link>` con `aria-label` y manejo explícito de Espacio. | Un enlace es navegable con Enter de forma nativa; se agrega Espacio para cumplir RF-2 y un nombre accesible que incluye el nombre de la publicación. | `fcomp-props-as-data-boundary`, `rendering-conditional-render`; RF-1, RF-2, RF-3 |
| El retorno no usa `navigate(-1)`. | Una URL directa no debe expulsar al visitante de la tienda; se usa el contexto validado o `/` por defecto. | `nav-hierarchy`, `bound-interface-contracts`; RF-21 |

## Estructura objetivo

```text
src/app/
├── shared/
│   ├── api/
│   │   ├── catalog/
│   │   │   ├── constants.ts                         # + CATALOG_PATHS.publication
│   │   │   ├── types.ts                             # + PublicationDetail
│   │   │   ├── get-publications/                    # existente
│   │   │   └── get-publication/
│   │   │       ├── get-publication.ts
│   │   │       └── get-publication.test.ts
│   │   └── account/
│   │       ├── constants.ts                         # + ACCOUNT_PATHS.publicShop
│   │       ├── types.ts                             # + PublicShop
│   │       ├── get-session/                         # existente
│   │       ├── post-logout/                         # existente
│   │       ├── build-google-login-url/              # existente
│   │       └── get-public-shop/
│   │           ├── get-public-shop.ts
│   │           └── get-public-shop.test.ts
│   ├── components/
│   │   ├── AccountSession/                          # existente
│   │   └── ProductImageCarousel/                    # promovido desde Storefront
│   │       ├── ProductImageCarousel.tsx
│   │       ├── ProductImageCarousel.test.tsx
│   │       └── constants.ts                         # etiquetas y buildCarouselPosition
│   └── lib/
│       ├── format-price/                            # promovido desde Storefront
│       │   ├── format-price.ts
│       │   └── format-price.test.ts
│       └── catalog-location/
│           ├── catalog-location.ts
│           └── catalog-location.test.ts
└── views/
    ├── Layout/
    │   └── Layout.tsx                               # sin cambios de contrato
    ├── Storefront/
    │   ├── Storefront.tsx                           # pasa el contexto de catálogo y usa la lib compartida
    │   ├── constants.ts                             # sin copias del carrusel
    │   ├── ProductCard/
    │   │   ├── ProductCard.tsx                      # enlace accesible + estado from
    │   │   └── ProductCard.test.tsx
    │   ├── ProductGrid/
    │   │   ├── ProductGrid.tsx                      # prop from hacia la tarjeta
    │   │   └── ProductGrid.test.tsx
    │   └── ProductImageCarousel/                    # se elimina (pasa a shared/components)
    └── PublicationDetail/
        ├── PublicationDetail.tsx
        ├── PublicationDetail.test.tsx
        ├── constants.ts
        ├── hooks/
        │   └── use-publication-detail/
        │       ├── use-publication-detail.ts
        │       └── use-publication-detail.test.tsx
        ├── lib/
        │   └── format-stock-label/
        │       ├── format-stock-label.ts
        │       └── format-stock-label.test.ts
        └── components/
            ├── PublicationGallery/
            │   ├── PublicationGallery.tsx
            │   └── PublicationGallery.test.tsx
            ├── PublicationShop/
            │   ├── PublicationShop.tsx
            │   └── PublicationShop.test.tsx
            └── PublicationDetailStatus/
                ├── PublicationDetailStatus.tsx
                └── PublicationDetailStatus.test.tsx
```

Rutas:

```tsx
createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Storefront /> },
      { path: 'publication/:id', element: <PublicationDetail /> },
    ],
  },
]);
```

### Responsabilidades

| Área | Responsabilidad |
| --- | --- |
| `shared/api/catalog/constants.ts` | Path público `/catalog/publication`; la ruta de detalle agrega `/{id}`. |
| `shared/api/catalog/types.ts` | `PublicationDetail` (incluye `description` y `sellerAccountId`) y reutilización de `ProductImage`. |
| `shared/api/catalog/get-publication` | Construir la URL con el id codificado, ejecutar `fetch`, mapear 404 a `null`, validar la forma y propagar errores/abortos. |
| `shared/api/account/constants.ts` | Path público `/accounts/shops`; la consulta agrega `/{sellerAccountId}`. |
| `shared/api/account/types.ts` | `PublicShop` con `name` y `description`. |
| `shared/api/account/get-public-shop` | Construir la URL, mapear 404 a `null`, validar la forma y propagar errores/abortos. |
| `shared/lib/format-price` | Formatear el precio en es-AR con símbolo de moneda y fallback para monedas no reconocidas. |
| `shared/lib/catalog-location` | Definir `CatalogLocation`, construir `URLSearchParams`/href y validar el `state.from` del router. |
| `shared/components/ProductImageCarousel` | Navegación circular de imágenes, textos accesibles, contador y targets de 44 px. |
| `views/PublicationDetail/PublicationDetail.tsx` | Leer `id` y `state.from`, orquestar el hook, calcular el href de vuelta y componer estados y contenido. |
| `hooks/use-publication-detail` | Estados `loading`, `success`, `not-found` y `error`; publicación y tienda; reintento y cancelación. |
| `lib/format-stock-label` | Traducir `stock` a «Disponible», cantidad exacta o «Sin stock» defensivo. |
| `components/PublicationGallery` | Galería con el carrusel compartido o marcador visual cuando no hay imágenes. |
| `components/PublicationShop` | Bloque de tienda con el nombre público; no se renderiza si no hay tienda. |
| `components/PublicationDetailStatus` | Estados presentacionales de carga, error con reintento y no encontrada. |
| `views/Storefront/ProductCard` | Enlace accesible a la publicación con activación por ratón, Enter y Espacio; transporta `from`. |
| `views/Storefront/ProductGrid`, `Storefront` | Propagar el contexto de catálogo (`name`, `page`, `size`) a cada tarjeta. |

**Cubre:** RF-1 a RF-29 (ver matriz de trazabilidad).

## Contrato HTTP/JSON

### `catalog-api`

```http
GET {VITE_API_BASE_URL}/catalog/publication/{id}
Accept: application/json
credentials: omit
```

Respuesta `200`:

```json
{
  "id": "2f5b0f45-6a3e-4d2c-9a11-0b7e8f9c1d23",
  "name": "Zapatillas urbanas",
  "price": 45999.5,
  "currency": "ARS",
  "stock": 3,
  "description": "Suela de goma, talle 42, uso diario.",
  "sellerAccountId": "8f1c2b7a-3d4e-5f60-7a8b-9c0d1e2f3a4b",
  "images": [
    {
      "id": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "url": "https://cdn.friendly-e-shop.test/zapatillas-1.webp"
    }
  ]
}
```

- `200` con publicación visible: se muestra el detalle.
- `404`: publicación inexistente, no visible o sin stock disponible. El cliente devuelve `null` y la vista muestra el estado de publicación no encontrada.
- `stock`: número o `null`. `null` representa stock ilimitado/no informado y se muestra como «Disponible». Un número mayor a cero se muestra como cantidad exacta. La visibilidad y el 404 son responsabilidad de `catalog-api`, en consistencia con la grilla.
- `description`: `string` o `null`. La API limita el contenido a 1000 caracteres (RF-10); el cliente lo muestra completo.
- `images`: arreglo de `{ id, url }`; puede ser vacío.
- `currency`: código de moneda; si no se reconoce, `formatPrice` no rompe el render.

### `account-api`

```http
GET {VITE_API_BASE_URL}/accounts/shops/{sellerAccountId}
Accept: application/json
credentials: omit
```

Respuesta `200`:

```json
{
  "name": "Bazar del Sur",
  "description": "Artículos para el hogar."
}
```

- `200`: tienda configurada; el detalle muestra el nombre público.
- `404`: el vendedor no tiene tienda configurada; el cliente devuelve `null` y el bloque de tienda se oculta por completo.
- Cualquier otro error HTTP, de red, JSON inválido o aborto: el hook trata la tienda como no disponible y mantiene operativo el resto del detalle (RF-28).
- CORS ya está permitido por `account-api`; no se agrega proxy ni cabeceras adicionales.

### Validación estricta del cliente

- `PublicationDetail`: `id` string no vacío, `name` string, `price` número finito, `currency` string no vacío, `stock` entero no negativo o `null`, `description` string o `null`, `sellerAccountId` string no vacío, `images` arreglo de objetos con `id` y `url` string no vacíos.
- `PublicShop`: `name` string no vacío, `description` string o `null`.
- Un JSON que no cumpla la forma lanza un `Error` visible como fallo de lectura, nunca se renderiza un detalle parcial corrupto.
- Los abortos (`AbortError`) no se convierten en estado de error; el hook los ignora.

**Cubre:** RF-8, RF-9, RF-10, RF-12, RF-15, RF-16, RF-26, RF-27, RF-28.

## Clientes API

### `getPublication`

```ts
type GetPublicationInput = {
  id: string;
  signal?: AbortSignal;
};

function getPublication(input: GetPublicationInput): Promise<PublicationDetail | null>;
```

Comportamiento:

1. Resuelve el host con `getApiBaseUrl()` y arma `${base}${CATALOG_PATHS.publication}/${encodeURIComponent(id)}`.
2. `fetch` con `headers: { Accept: 'application/json' }`, `credentials: 'omit'` y `signal`.
3. `404` devuelve `null` sin lanzar error.
4. Cualquier otro `!response.ok` lanza `Error` con el estado HTTP.
5. Parsea y valida la forma completa antes de devolver el DTO.
6. Deja propagar `AbortError`.

### `getPublicShop`

```ts
type GetPublicShopInput = {
  sellerAccountId: string;
  signal?: AbortSignal;
};

function getPublicShop(input: GetPublicShopInput): Promise<PublicShop | null>;
```

Comportamiento:

1. Arma `${base}${ACCOUNT_PATHS.publicShop}/${encodeURIComponent(sellerAccountId)}`.
2. Usa `Accept: application/json` y `credentials: 'omit'`; es una lectura pública.
3. `404` devuelve `null` (sin tienda).
4. Otro `!response.ok`, JSON inválido o forma inválida lanza `Error`; el hook lo absorbe y oculta el bloque de tienda.
5. Deja propagar `AbortError`.

**Cubre:** RF-12, RF-14, RF-15, RF-16, RF-26, RF-27, RF-28.

## Utilidades compartidas promovidas

### `shared/lib/format-price`

- Se mueve sin cambios de comportamiento desde `views/Storefront/lib/format-price`.
- `formatPrice(price, currency)` usa `Intl.NumberFormat('es-AR', { style: 'currency', currencyDisplay: 'symbol', minimumFractionDigits: 2, maximumFractionDigits: 2 })` y cachea formateadores por moneda.
- Fallback `"<currency> <número es-AR>"` para monedas no reconocidas.
- Se actualizan los imports de `ProductCard` y la ubicación de sus pruebas.

### `shared/components/ProductImageCarousel`

- Se mueve desde `views/Storefront/ProductImageCarousel`.
- Las etiquetas «Foto anterior» y «Foto siguiente» y `buildCarouselPosition` se co-localizan en `shared/components/ProductImageCarousel/constants.ts` para que el componente compartido no dependa de `views/Storefront/constants.ts`.
- Con una sola imagen no muestra controles; con varias muestra flechas circulares, contador `N / M` en `aria-live="polite"` y `alt` con posición (`<nombre> — N`).
- Los botones de navegación pasan de 32 px a un área mínima de 44 px (`size-11`), conservando el ícono compacto y el foco visible.
- Se actualizan imports y pruebas de `ProductCard`; se elimina la copia privada en `Storefront`.
- En el detalle, `PublicationGallery` lo reutiliza y aporta el marcador cuando `images` está vacío.

### `shared/lib/catalog-location`

```ts
type CatalogLocation = {
  name: string;
  page: number;
  size: number;
};

function buildCatalogSearchParams(location: CatalogLocation): URLSearchParams;
function buildCatalogHref(location: CatalogLocation): string;
function readCatalogReturnState(state: unknown): CatalogLocation | null;
```

- `buildCatalogSearchParams` centraliza el orden `name`, `page`, `size` y las reglas actuales: omite `name` vacío y `size` cuando es 24; siempre incluye `page`.
- `buildCatalogHref` devuelve `/` cuando el contexto es el catálogo por defecto (`name` vacío, `page` 1, `size` 24) y `/?<params>` en el resto.
- `readCatalogReturnState` valida `{ from: { name, page, size } }` proveniente del router: `name` string normalizado, `page` entero seguro ≥ 1, `size` entero entre 1 y 100. Cualquier forma inválida devuelve `null`.
- `Storefront` usa `buildCatalogSearchParams` para sus navegaciones y así no duplica el formato de URL.
- El detalle usa `readCatalogReturnState` y `buildCatalogHref` para la acción de volver.

**Cubre:** RF-8, RF-21.

## Hook `use-publication-detail`

`src/app/views/PublicationDetail/hooks/use-publication-detail/use-publication-detail.ts`:

```ts
type PublicationDetailState =
  | { status: 'loading'; publication: null; shop: null }
  | { status: 'not-found'; publication: null; shop: null }
  | { status: 'error'; publication: null; shop: null; error: Error }
  | { status: 'success'; publication: PublicationDetail; shop: PublicShop | null };

function usePublicationDetail(id: string | undefined): {
  state: PublicationDetailState;
  retry: () => void;
};
```

Comportamiento:

1. Si `id` es `undefined` o vacío, el estado es `not-found` sin ejecutar `fetch`.
2. Se monta en `loading`; llama a `getPublication({ id, signal })`.
3. `getPublication` devuelve `null` → `not-found`; un rechazo no abortado → `error`; un aborto se ignora.
4. Cuando la publicación llega con `sellerAccountId`, dispara `getPublicShop` en un efecto separado y con su propio `AbortController`.
5. La tienda exitosa se guarda; `null`, rechazo o aborto de tienda dejan `shop: null`, sin afectar el estado `success` de la publicación.
6. `retry` incrementa un contador de intentos y vuelve a `loading`; la publicación y la tienda se vuelven a consultar.
7. Cada lectura usa una clave compuesta por `id`, intento y (para la tienda) `sellerAccountId`, de modo que una respuesta vieja no pisa a la actual.
8. El cleanup aborta publicación y tienda al cambiar `id` o al desmontar.
9. No hay `setInterval`, `setTimeout` de refresco, listeners de `visibilitychange` ni revalidación automática: el contenido se mantiene hasta recargar, reintentar o navegar (RF-29).

Pruebas directas: transición `loading → success` con tienda; publicación exitosa con tienda 404/error y bloque oculto; `loading → not-found`; `loading → error`; reintento recuperado; aborto al cambiar `id` y al desmontar; respuesta vieja ignorada; `id` ausente sin `fetch`.

**Cubre:** RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-27, RF-28, RF-29.

## Navegación y retorno al catálogo

### Tarjeta → detalle

- `ProductCard` recibe `{ product, from: CatalogLocation }`.
- Renderiza un `<Link>` interno a `/publication/${encodeURIComponent(product.id)}` con `state={{ from }}`.
- El enlace lleva `aria-label={`Ver ${product.name}`}`, por lo que su nombre accesible incluye el nombre de la publicación (RF-3).
- Enter funciona de forma nativa en el enlace; un `onKeyDown` detecta Espacio, previene el scroll y dispara el mismo `click()` del enlace (RF-2).
- El enlace ocupa la tarjeta, conserva la imagen, el nombre, el precio y el borde existentes, y tiene foco visible (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`).
- El `<article>` mantiene `aria-labelledby` apuntando al nombre.
- Los clics en la tarjeta y la activación por teclado navegan sin recargar el documento.

### Detalle → catálogo

- `PublicationDetail` lee `useLocation().state` y aplica `readCatalogReturnState`.
- Si el estado es válido, el href de vuelta es `buildCatalogHref(from)`.
- Si no hay estado, es inválido o la entrada fue directa, el href es `/`.
- La acción es un `<Link>` visible «Volver al catálogo», renderizado siempre: carga, éxito, error y no encontrada (RF-20, RF-25).
- No se usa `navigate(-1)` para evitar salir de la tienda en una URL directa.
- Al volver se conservan `?name=...&page=...&size=...` cuando el contexto existe (RF-21).

**Cubre:** RF-1, RF-2, RF-3, RF-13, RF-20, RF-21, RF-25.

## Vista `PublicationDetail`

`src/app/views/PublicationDetail/PublicationDetail.tsx` actúa como contenedor:

1. `useParams<{ id: string }>()` para el identificador.
2. `useLocation()` para `state.from`.
3. `usePublicationDetail(id)` para el estado y `retry`.
4. Calcula `backHref` como se describió.
5. Renderiza `<section aria-label="Detalle de publicación">` con:
   - El enlace «Volver al catálogo» siempre presente.
   - El estado correspondiente (`PublicationDetailStatus`).
   - El contenido de éxito cuando corresponde.

### Contenido de éxito

- Layout responsive: una columna desde 320 px; dos columnas desde `md` (galería a la izquierda, información a la derecha). Ancho máximo alineado con el escaparate y `min-w-0` para evitar desbordes.
- `<h1>` con el nombre de la publicación (RF-7).
- `PublicationGallery` con las imágenes (RF-4); si no hay imágenes, marcador visual decorativo con `ImageOff`, sin información redundante para lectores de pantalla (RF-6).
- Precio con `formatPrice(publication.price, publication.currency)` (RF-8).
- Disponibilidad con `formatStockLabel(publication.stock)`:
  - `stock === null` → «Disponible» (RF-9).
  - `stock > 0` → cantidad exacta, por ejemplo «12 disponibles»; singular «1 disponible» (RF-9).
  - `stock === 0` → «Sin stock» defensivo (no debería llegar por el 404 de la API).
- Descripción: si `description` es string no vacío se muestra completa (RF-10); si es `null` o vacío se muestra «Este producto no tiene descripción.» (RF-11).
- `PublicationShop` solo si `shop !== null`, con `<h2>Tienda</h2>` y el nombre público; si no hay tienda o falló la consulta, el bloque no se renderiza (RF-12, RF-28).
- No se renderizan botones ni controles de compra, carrito, cantidad o checkout (RF-22).
- El header del `Layout` y `AccountSession` permanecen montados por encima de la ruta (RF-23).

### Subcomponentes

- `PublicationDetailStatus`:
  - `loading`: `role="status"` con `aria-live="polite"` y texto «Cargando publicación…», más esqueletos que reservan espacio.
  - `error`: `role="alert"`, mensaje en español y botón «Reintentar» que invoca `retry`; botón de al menos 44 px y foco visible.
  - `not-found`: título «Publicación no encontrada» y mensaje «La publicación no existe o ya no está disponible.».
- `PublicationGallery`: usa el carrusel compartido; con `images: []` muestra el marcador.
- `PublicationShop`: presenta el nombre público; no decide la carga ni la consulta.

**Cubre:** RF-4 a RF-13, RF-20, RF-22, RF-23, RF-26, RF-27, RF-28.

## Estados y mensajes

| Estado | Condición | Render |
| --- | --- | --- |
| Carga | hook en `loading` | Enlace de vuelta + `role="status"` «Cargando publicación…» con esqueletos. |
| No encontrada | hook en `not-found` (404 o `id` ausente) | Enlace de vuelta + título «Publicación no encontrada» y mensaje explicativo. |
| Error | hook en `error` (red, 5xx, JSON inválido) | Enlace de vuelta + `role="alert"`, mensaje y botón «Reintentar». |
| Éxito | hook en `success` | Enlace de vuelta + galería, nombre, precio, stock, descripción y tienda opcional. |

- El enlace «Volver al catálogo» está fuera del switch de estados, por lo que sigue disponible en todos (RF-25).
- Las copias en español viven en `views/PublicationDetail/constants.ts`.
- No se muestra el detalle parcial si falla la publicación; la tienda es la única consulta tolerante a fallos.

**Cubre:** RF-11, RF-16, RF-17, RF-18, RF-19, RF-20, RF-25, RF-28.

## Accesibilidad, responsive y rendimiento

- HTML semántico: `section`, `article`, `nav`/enlaces, `h1`/`h2`, listas de imágenes.
- Navegación por teclado y foco visible en la tarjeta, el enlace de vuelta, las flechas del carrusel y el botón de reintento.
- Áreas accionables de al menos 44 px en el detalle; el carrusel compartido se ajusta a ese mínimo.
- Nombre accesible de la tarjeta: `aria-label` «Ver <nombre>»; el `article` conserva `aria-labelledby` hacia el nombre.
- Imágenes con `alt`; el marcador sin imágenes es decorativo (`aria-hidden`) y no duplica información.
- Anuncios accesibles: `role="status"` para carga y `role="alert"` para error.
- Responsive desde 320 px: una columna, `min-w-0`, sin scroll horizontal; dos columnas desde `md`.
- Se conservan los tokens de `src/styles.css` y el lenguaje visual de escaparate; no hay rediseño global.
- Imports directos, sin barrels nuevos.
- Sin componentes definidos dentro de componentes.
- La tienda se consulta una vez por publicación/intento, sin N+1 ni cascadas por tarjeta.
- El detalle no hace polling ni revalidación automática (RF-29).
- Solo se usa `VITE_API_BASE_URL`, que ya es pública; no se agregan secretos ni telemetría.

**Cubre:** Requisitos no funcionales y RF-1, RF-3, RF-4, RF-5, RF-6, RF-12, RF-20, RF-25, RF-29.

## Estrategia de pruebas

| Nivel | Archivos | Qué verifica |
| --- | --- | --- |
| Cliente catálogo | `get-publication.test.ts` | URL con id codificado, `credentials: 'omit'`, `Accept`, 200 válido, 404 → `null`, 5xx, JSON inválido, campos inválidos y aborto. |
| Cliente cuenta | `get-public-shop.test.ts` | URL con `sellerAccountId`, `credentials: 'omit'`, 200 válido, 404 → `null`, 5xx, JSON inválido, campos inválidos y aborto. |
| Utilidades compartidas | `format-price.test.ts`, `catalog-location.test.ts` | es-AR/ARS/USD/fallback; construcción de href/params; defaults; `state.from` válido e inválido. |
| Componente compartido | `ProductImageCarousel.test.tsx` | Una imagen sin controles; varias con contador y navegación circular; textos accesibles. |
| Utilidad de stock | `format-stock-label.test.ts` | `null` → «Disponible»; cantidades exactas y singular; caso 0 defensivo. |
| Hook | `use-publication-detail.test.tsx` | Carga, éxito con tienda, tienda 404/error oculto, no encontrada, error, reintento, abortos, respuestas viejas, `id` ausente. |
| Subcomponentes | `PublicationGallery.test.tsx`, `PublicationShop.test.tsx`, `PublicationDetailStatus.test.tsx` | Galería y marcador; tienda visible/oculta; carga, alerta, reintento y no encontrada. |
| Tarjeta | `ProductCard.test.tsx` | Enlace con nombre accesible, clic, Enter, Espacio, foco visible, `state.from`, sin acciones de compra. |
| Grilla | `ProductGrid.test.tsx` | Prop `from` propagada y lista semántica; requiere router para los enlaces. |
| Vista | `PublicationDetail.test.tsx` | Estados, contenido completo, descripción/alternativa, stock exacto/ilimitado, tienda oculta, sin compra, vuelta por contexto y por defecto. |
| Integración | `Storefront.test.tsx`, `PublicationDetail.test.tsx` | Tarjeta → detalle → volver conservando `name`/`page`/`size`; URL directa vuelve a `/`; header visible. |

- Se actualizan las pruebas existentes de `Storefront`, `ProductGrid` y `ProductCard` para envolver con `MemoryRouter` cuando corresponda y reemplazar la afirmación de tarjeta no interactiva.
- Se mantienen strings esperados explícitos en los tests de contrato para no repetir errores de las constantes.
- Cobertura mínima exigida por el repo: 90 % de líneas (`npm run coverage:check`).
- Verificación final con `npm run verify` (lint, cobertura con umbral y build de producción).

## Trazabilidad de RF

| RF | Cobertura técnica |
| --- | --- |
| RF-1 | `ProductCard` es un enlace a `/publication/:id`; `PublicationDetail` monta el detalle. |
| RF-2 | Enlace nativo para Enter; `onKeyDown` de Espacio dispara la misma activación. |
| RF-3 | `aria-label` de la tarjeta «Ver <nombre>» y `aria-labelledby` hacia el nombre. |
| RF-4 | `PublicationGallery` usa `ProductImageCarousel` en el detalle. |
| RF-5 | Carrusel con flechas circulares, contador y `aria-live` cuando hay más de una imagen. |
| RF-6 | `PublicationGallery` muestra un marcador `ImageOff` decorativo si `images` está vacío. |
| RF-7 | `<h1>` con el nombre de la publicación. |
| RF-8 | `formatPrice` compartido en grilla y detalle. |
| RF-9 | `formatStockLabel`: «Disponible» para `null`, cantidad exacta para `> 0`. |
| RF-10 | La descripción se renderiza completa; la API limita a 1000 caracteres. |
| RF-11 | Texto alternativo «Este producto no tiene descripción.» para `null`/vacío. |
| RF-12 | `getPublicShop` y `PublicationShop`; bloque oculto sin tienda. |
| RF-13 | Ruta `/publication/:id` con el identificador en la URL. |
| RF-14 | Apertura, recarga y compartición de la URL pasan por el mismo `id` y hook. |
| RF-15 | `catalog-api` responde 404 para no visible/sin stock; el cliente lo mapea a no encontrada. |
| RF-16 | `getPublication` devuelve `null` en 404; el hook pasa a `not-found`. |
| RF-17 | Hook en `loading` y `PublicationDetailStatus` anuncia la carga. |
| RF-18 | Hook en `error` y `PublicationDetailStatus` muestra alerta y reintento. |
| RF-19 | `retry` incrementa el intento y vuelve a consultar publicación y tienda. |
| RF-20 | Enlace «Volver al catálogo» siempre visible. |
| RF-21 | `CatalogLocation` + `state.from` + `buildCatalogHref`; sin contexto, `/`. |
| RF-22 | La vista no renderiza compra, carrito, cantidad ni checkout. |
| RF-23 | La ruta es hija de `Layout`; header y `AccountSession` siguen montados. |
| RF-24 | Clientes públicos con `credentials: 'omit'`; no se exige sesión. |
| RF-25 | El enlace de vuelta está fuera del switch de estados. |
| RF-26 | El hook solo consulta el `id` de la URL y muestra esa publicación. |
| RF-27 | `sellerAccountId` del detalle alimenta `getPublicShop`. |
| RF-28 | La consulta de tienda se aísla; 404/error/aborto ocultan solo el bloque de tienda. |
| RF-29 | Sin polling ni listeners de refresco; el estado cargado persiste hasta recargar, reintentar o navegar. |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Deriva entre el contrato cross-repo y la validación estricta (`stock`, `description`, 404). | Validar exactamente la forma acordada; 404 mapea a no encontrada; `stock: null` se interpreta como ilimitado; pruebas de contrato explícitas. |
| La tienda tarda o falla y bloquea el detalle. | Consulta de tienda separada y tolerante; el detalle de la publicación se muestra sin esperar la tienda y el bloque se oculta si no hay resultado. |
| Respuestas fuera de orden al cambiar de publicación o reintentar. | `AbortController` + clave de solicitud (`id`, intento, `sellerAccountId`) para descartar respuestas viejas. |
| `state.from` manipulado o con forma inesperada. | `readCatalogReturnState` valida tipos y rangos; ante cualquier fallo, se vuelve a `/`. |
| Entrada directa o recarga sin contexto de catálogo. | Sin `state.from` válido, `backHref` es `/`; no se usa `navigate(-1)`. |
| Regresión visual en la grilla por el enlace y los controles de 44 px del carrusel. | Mantener estructura y tokens; verificar 320 px, tablet y escritorio; pruebas de tarjeta y carrusel. |
| Espacio no activa enlaces de forma nativa. | `onKeyDown` dedicado que previene el scroll y dispara la activación; prueba con teclado. |
| La publicación deja de ser visible mientras se mira. | Sin polling ni revalidación; el contenido cargado permanece y la próxima lectura/navegación recibe 404. |
| Moneda no reconocida. | `formatPrice` conserva el fallback y no rompe el render. |
| Descripción mayor a 1000 caracteres por error de la API. | El cliente muestra el string recibido; la regla de negocio vive en `catalog-api`; se documenta como contrato. |
| Cobertura insuficiente por ramas de error. | Pruebas directas de clientes, hook y utilidades; `npm run coverage:check`. |

## Verificación

- `npm test` (unitarios, lint y build de producción).
- `npm run coverage` y `npm run coverage:check` (mínimo 90 % de líneas).
- `npm run verify` como cierre completo.
- Comprobación manual en 320 px, tablet y escritorio: abrir detalle desde la tarjeta con ratón, Enter y Espacio; galería con una y varias imágenes; publicación sin imágenes; sin descripción; stock numérico e ilimitado; tienda visible y oculta; error con reintento; no encontrada; volver conservando búsqueda/página/tamaño y volver por defecto desde URL directa.
- Navegación por teclado y foco visible en la tarjeta, la galería, el enlace de vuelta y el botón de reintento.
- Confirmar que el header y `AccountSession` siguen operativos y que no hay acciones de compra, carrito, cantidad ni checkout.

## Fuera de alcance

- Compra, carrito, cantidad, checkout y cualquier acción transaccional.
- Favoritos, productos relacionados, recomendaciones, reseñas, calificaciones y comentarios.
- Edición, publicación o baja de publicaciones.
- Login obligatorio para ver el detalle.
- Rediseño general del catálogo, del header o del lenguaje visual.
- Actualización automática en vivo cuando la publicación deja de ser visible.
- Filtros, orden por el visitante y búsqueda por campos distintos del nombre.
- Contrato público de lectura de la publicación, exclusión de no visibles y regla de stock (responsabilidad de `catalog-api`).
- Autenticación, Keycloak u otros flujos no descritos en la spec.
