# Plan 002 — Storefront con grilla de productos y buscador en el header

Plan técnico para `client-web` en la rama `002/feat-storefront-product-grid`. Implementa la spec `specs/002-storefront-product-grid/spec.md` sin cambiar manifiestos ni agregar dependencias.

## Objetivo técnico

Reemplazar el contenido actual de `views/Storefront` por una grilla paginada de productos publicados, alimentada por la lectura pública de `catalog-api`, y agregar un buscador por nombre en el header compartido. La URL (`?name=...&page=...&size=...`) es la única fuente de verdad de la búsqueda, la página y el tamaño de página; el header y la grilla se comunican por ese contrato y no por estado React compartido.

## Decisiones de arquitectura

| Decisión | Motivo | Regla aplicada |
| --- | --- | --- |
| La URL es el estado de la búsqueda y la página. | Permite recargar y compartir el resultado, y evita acoplar `Layout` con `Storefront`. | `bound-minimize-shared-state`, `fstate-lift-minimally`, `import-no-cross-feature` |
| `Layout` conserva la propiedad del header y monta el buscador como componente privado. | El header es chrome global; el buscador debe seguir usable en carga, vacío y error. | `struct-app-layer`, `bound-feature-isolation` |
| `Storefront` conserva la propiedad de la grilla, tarjetas, paginación y estados. | La vista no conoce la sesión ni duplica el header. | `fcomp-single-responsibility`, `product` de vista |
| El contrato de catálogo se centraliza en `shared/api/catalog/`. | Las vistas consumen clientes, no implementan `fetch` ni conocen endpoints; el hook de la vista queda colocado junto a su feature. | `struct-shared-layer`, `import-unidirectional-flow`, `fquery-colocate-with-feature` |
| Sin librería de consultas nueva. | No hay dependencia instalada y este corte no modifica manifiestos; un hook con `AbortController` cubre el alcance. | `fstate-server-state-separation`, versiones fijadas |
| Corrección de página inválida en el cliente. | `catalog-api` ajusta una página fuera de rango a la última disponible; la spec de la tienda exige página 1. | RF-23 |
| Componentes presentacionales sin estado propio de red. | La orquestación queda en `Storefront` y el hook; las tarjetas reciben datos. | `fcomp-container-presentational`, `fcomp-props-as-data-boundary` |

## Estructura objetivo

```text
src/app/
├── shared/
│   ├── api/
│   │   └── catalog/
│   │       ├── constants.ts
│   │       ├── types.ts
│   │       └── get-publications/
│   │           ├── get-publications.ts
│   │           └── get-publications.test.ts
│   ├── config/
│   │   ├── api-base-url.ts                 # existente
│   │   └── catalog-search.ts               # params de URL, tamaño de página y tope del término
│   └── components/
│       └── AccountSession/                 # existente, sin cambios de contrato
└── views/
    ├── Layout/
    │   ├── Layout.tsx                      # header + ProductSearch + AccountSession + Outlet
    │   ├── Layout.test.tsx
    │   └── ProductSearch/
    │       ├── ProductSearch.tsx
    │       └── ProductSearch.test.tsx
    └── Storefront/
        ├── Storefront.tsx                  # contenedor: URL, hook, correcciones y estados
        ├── Storefront.test.tsx
        ├── constants.ts                    # copias en español y variantes de estado
        ├── hooks/
        │   └── use-publications/
        │       ├── use-publications.ts
        │       └── use-publications.test.tsx
        ├── lib/
        │   ├── read-catalog-search/
        │   │   ├── read-catalog-search.ts
        │   │   └── read-catalog-search.test.ts
        │   └── format-price/
        │       ├── format-price.ts
        │       └── format-price.test.ts
        ├── ProductGrid/
        │   ├── ProductGrid.tsx
        │   └── ProductGrid.test.tsx
        ├── ProductCard/
        │   ├── ProductCard.tsx
        │   └── ProductCard.test.tsx
        ├── ProductGridPagination/
        │   ├── ProductGridPagination.tsx
        │   └── ProductGridPagination.test.tsx
        └── ProductGridStatus/
            ├── ProductGridStatus.tsx      # carga, vacío y error
            └── ProductGridStatus.test.tsx
```

### Responsabilidades

| Área | Responsabilidad |
| --- | --- |
| `shared/config/catalog-search.ts` | Nombres estables de los parámetros de URL, `size` 24 y tope de 100 caracteres. |
| `shared/api/catalog/constants.ts` | Path público `/catalog/publication` y nombres de parámetros de la API. |
| `shared/api/catalog/types.ts` | DTOs de la respuesta pública. |
| `get-publications` | Construir la URL, ejecutar `fetch`, validar la forma JSON y propagar errores y abortos. |
| `views/Layout/ProductSearch` | Formulario del header; aplica el término y vuelve a la página 1. |
| `views/Storefront/Storefront.tsx` | Leer la URL, normalizarla, pedir productos, corregir la página y componer los estados. |
| `hooks/use-publications` | Estado de la lectura: `loading`, `success`, `error`, con reintento y cancelación. |
| `lib/read-catalog-search` | Normalizar `name` y `page`; detectar página inválida que debe reflejarse en la URL. |
| `lib/format-price` | Formatear el precio en es-AR con símbolo de moneda. |
| `ProductGrid`, `ProductCard`, `ProductGridPagination`, `ProductGridStatus` | Render presentacional de grilla, tarjetas, paginación y estados. |

**Cubre:** RF-1, RF-4, RF-20, RF-21.

## Contrato con `catalog-api`

La tienda consume el contrato público definido por `catalog-api`:

- Operación: `GET {VITE_API_BASE_URL}/catalog/publication`.
- Parámetros de consulta: `name` (opcional), `page` (desde 1) y `size` (se envía 24).
- Sin credenciales: `credentials: 'omit'`.
- Respuesta válida:

```json
{
  "items": [
    {
      "id": "2f5b0f45-…",
      "name": "Zapatillas urbanas",
      "price": 45999.5,
      "currency": "ARS",
      "stock": 3,
      "images": [{ "id": "8f1c…", "url": "https://…/image.webp" }]
    }
  ],
  "page": 1,
  "size": 24,
  "totalItems": 57,
  "totalPages": 3
}
```

Reglas del borde:

- Solo se leen productos publicados, no borrados y con stock; esa exclusión es responsabilidad de la API, no de la tienda.
- `items: []`, `totalItems: 0` y `totalPages: 0` no son error: alimentan el estado vacío (RF-17 y RF-18).
- La API ajusta una `page` fuera de rango a la última disponible; la tienda corrige a la página 1 según RF-23 (ver sección de normalización).
- Un HTTP no exitoso, un JSON inválido, un `fetch` rechazado o un timeout del navegador se tratan como error de lectura (RF-19).
- No se envían cookies ni cabeceras de sesión al catálogo; la tienda no depende de autenticación (RF-21).

La validación del cliente comprueba:

- `items` es un arreglo.
- `page`, `size` son enteros mayores o iguales a 1; `totalItems`, `totalPages` son enteros mayores o iguales a 0.
- Cada producto tiene `id` y `name` string, `price` número finito, `currency` string no vacío, `stock` número o `null` y `images` arreglo.
- Cada imagen tiene `id` y `url` string.

**Cubre:** RF-2, RF-3, RF-9, RF-15, RF-19, RF-21.

## Configuración transversal

`src/app/shared/config/catalog-search.ts`:

```ts
export const CATALOG_SEARCH_PARAMS = {
  name: 'name',
  page: 'page',
} as const;

export const CATALOG_PAGE_SIZE = 24;
export const CATALOG_MAX_PAGE_SIZE = 100;
export const CATALOG_SEARCH_MAX_LENGTH = 100;

export function normalizeCatalogSearchTerm(raw: string): string {
  return raw.trim().slice(0, CATALOG_SEARCH_MAX_LENGTH);
}
```

Contrato de URL de la tienda:

- Búsqueda aplicada: `/?name=<término>&page=<n>`, más `&size=<n>` cuando difiere de 24; el buscador del header conserva el `size` activo (RF-27).
- Sin término: `/?page=<n>` (el parámetro `name` se omite).
- Los nombres de los parámetros de URL y los de la API se declaran por separado aunque coincidan hoy; son contratos distintos y no deben acoplarse.
- El término se codifica con `URLSearchParams`, de modo que espacios, acentos y caracteres especiales viajen seguros.
- Una búsqueda nueva y la selección de página se navegan con `push`; una corrección automática de página se navega con `replace` para no dejar estados inválidos en el historial.

**Cubre:** RF-8, RF-9, RF-10, RF-11, RF-22.

## Cliente `get-publications`

Firma prevista:

```ts
type GetPublicationsInput = {
  name: string;
  page: number;
  signal?: AbortSignal;
};

function getPublications(input: GetPublicationsInput): Promise<PublicationsResponse>;
```

Implementación:

- Resuelve el host con `getApiBaseUrl()` y arma la URL con `URL` + `URLSearchParams`.
- Agrega `name` solo si no está vacío, siempre `page` y `size` con el tamaño de página activo.
- `fetch` con `headers: { Accept: 'application/json' }`, `credentials: 'omit'` y `signal`.
- Si `response.ok` es falso, lanza un `Error` con el estado HTTP.
- Parsea con `response.json()` y valida la forma completa antes de devolver el DTO.
- Deja propagar `AbortError` para que el hook lo ignore sin convertirlo en estado de error.
- No introduce caché propia: la URL y el hook son la única fuente; el navegador puede reutilizar la respuesta HTTP si corresponde.

Pruebas directas: URL y query string, omisión de `name` vacío, `credentials`, `size`, respuesta válida, HTTP no exitoso, JSON inválido, campos faltantes y aborto.

**Cubre:** RF-2, RF-3, RF-9, RF-15, RF-19.

## Normalización de la URL y corrección de página

`src/app/views/Storefront/lib/read-catalog-search/read-catalog-search.ts`:

```ts
type CatalogSearch = {
  name: string;
  page: number;
  shouldCanonicalizePage: boolean;
};

function readCatalogSearch(params: URLSearchParams): CatalogSearch;
```

Reglas:

1. `name`: se aplica `normalizeCatalogSearchTerm` (recorte de espacios exteriores y límite de `CATALOG_SEARCH_MAX_LENGTH`, 100) antes de usarlo (RF-24). Un resultado vacío equivale a búsqueda sin filtro (RF-11). No se restringen caracteres.
2. `page`: se acepta solo un entero seguro mayor o igual a 1.
3. `page` ausente: se usa 1 y no se reescribe la URL (la URL raíz `/` es válida).
4. `page` presente pero no numérica, menor a 1, con decimales, fuera del rango seguro o no entera: se usa 1, `shouldCanonicalizeSearch` pasa a `true` y `Storefront` reemplaza la URL por `/?...&page=1` (RF-23).
5. `size` presente pero no entero, menor a 1 o mayor a 100: se usa 24 y la URL se reescribe sin el parámetro (RF-3).
5. `page` mayor al total de páginas: no puede detectarse antes de la respuesta. Cuando la lectura termina con éxito:
   - si `page > totalPages`, o
   - si `totalPages === 0` y `page > 1`,
   entonces `Storefront` reemplaza la URL con `page=1`, conserva `name` y vuelve a consultar. Mientras esa corrección está en curso se muestra el estado de carga, nunca la página ajustada por la API (RF-23).
6. Un cambio de término siempre viaja con `page=1`, por lo que no hay corrección posterior (RF-22).

La corrección se ejecuta en un efecto porque navega a una URL distinta de la solicitada; el resto del estado de la vista se deriva durante el render y no se duplica en `useState`.

**Cubre:** RF-8, RF-9, RF-10, RF-11, RF-15, RF-22, RF-23, RF-24.

## Hook `use-publications`

`src/app/views/Storefront/hooks/use-publications/use-publications.ts`:

```ts
type PublicationsState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: PublicationsResponse; error: null }
  | { status: 'error'; data: null; error: Error };

function usePublications(name: string, page: number): {
  state: PublicationsState;
  retry: () => void;
};
```

Comportamiento:

- Se monta en `loading`, llama a `getPublications` y pasa a `success` o `error`.
- `AbortController` en cada efecto; el cleanup aborta al cambiar `name`, `page` o al desmontar. Un aborto no cambia el estado.
- Un contador de intentos (`retry`) vuelve a ejecutar la lectura y regresa a `loading`; es la acción del botón de reintento (RF-19).
- La respuesta se asigna solo si la solicitud sigue vigente, evitando que una respuesta vieja pise a una nueva.
- En `StrictMode`, el doble montaje de desarrollo se resuelve con el aborto del primer efecto, sin duplicar datos visibles.
- No se guarda estado derivado de la URL: `name` y `page` llegan como argumentos y son la clave de la consulta.
- La navegación de página y de búsqueda se dispara desde eventos del usuario; el hook no navega.

Pruebas directas: transición `loading → success`, `loading → error`, `retry` exitoso, aborto al cambiar de parámetros y al desmontar, y respuesta vieja ignorada.

**Cubre:** RF-2, RF-9, RF-15, RF-16, RF-19, RF-23.

## Buscador del header

`src/app/views/Layout/ProductSearch/ProductSearch.tsx`:

- Se renderiza dentro del `<header>` de `Layout`, entre la marca y `AccountSession`.
- `<form role="search" aria-label="Buscar productos">`.
- Header responsive: un único `header` con `flex flex-wrap` y `order` por breakpoint. En móvil el logo (`order-1`) y la cuenta (`order-2 ml-auto`) comparten la primera fila y el buscador (`order-3 w-full`) cae a la segunda; desde `sm` vuelven a una fila con `justify-between` y el buscador centrado con `flex-1` y `max-w-md`. `SignedInActions` y `GuestActions` muestran el botón como ícono (`LogOut`/`LogIn`, `size-11`) en móvil y con texto desde `sm`, siempre con `aria-label` («Salir»/«Entrar con Google»). `SessionNotice` se reduce a un ícono con texto `sr-only` en móvil (RF-28, RF-29, RF-30).
- `<input type="search" name="name" maxLength={100} aria-label="Buscar productos por nombre" placeholder="Buscar productos">` no controlado. Se usa `defaultValue={normalizeCatalogSearchTerm(nameParam)}` y una `key` ligada a ese valor para sincronizar atrás/adelante sin estado por tecla.
- Botón de envío `type="submit"` con el ícono `Search` de `lucide-react` y nombre accesible «Buscar».
- `onSubmit` (Enter y lupa comparten el mismo camino):
  1. Lee el valor del formulario.
  2. Aplica `normalizeCatalogSearchTerm` (trim y límite de 100).
  3. Arma `URLSearchParams` con `page=1` y `name` solo si queda texto.
  4. Navega a `/?<params>`.
- Escribir no navega ni consulta: no hay `onChange` que escriba la URL ni efectos ligados al valor (RF-7).
- Un envío vacío o solo con espacios limpia `name` y deja `page=1` (RF-11).
- Un envío con término vuelve a `page=1` (RF-22).
- El formulario no se deshabilita por el estado de la grilla; sigue visible y usable durante carga, vacío y error (RF-20).

Integración en `Layout`:

- El header pasa a tres zonas: marca, buscador y `AccountSession`.
- En móvil el buscador ocupa una fila completa; desde `sm` comparte fila con la marca y la sesión, con ancho máximo para no desplazar las acciones de cuenta.
- Se conservan marca, `AccountSession`, `sticky`, bordes y tokens existentes (RF-21).
- A 320 px la marca y la sesión pueden envolver sin desbordar; el buscador mantiene `min-w-0` y ancho completo.

Estilos previstos: alto mínimo 44 px, borde y radio coherentes con `AccountSession`, foco visible `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` y transición desactivada con `motion-reduce`.

Pruebas: render del formulario, envío con Enter, envío con la lupa, recorte a 100, envío vacío, URL con `name` reflejada y ausencia de navegación al escribir.

**Cubre:** RF-4, RF-5, RF-6, RF-7, RF-8, RF-10, RF-11, RF-20, RF-21, RF-22, RF-24.

## Storefront, grilla y tarjetas

`Storefront.tsx` actúa como contenedor:

1. `useSearchParams()` para leer la URL.
2. `readCatalogSearch` para obtener `{ name, page, shouldCanonicalizePage }`.
3. Efecto de canonicalización cuando `shouldCanonicalizePage` es verdadero: `setSearchParams` con `replace: true`.
4. `usePublications(name, page)` para la lectura.
5. Detección de página fuera de rango durante el render: `success` con `page > totalPages`, o `totalPages === 0` con `page > 1`. Mientras el indicador sea verdadero se renderiza carga y un efecto reemplaza la URL con `page=1`; nunca se muestran los datos de la página ajustada por la API.
6. Render de `<section aria-label="Productos">` sin título visible y uno de los estados (RF-31).

La grilla:

- `<ul>` con `role="list"` y clases `grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6` dentro de un ancho máximo alineado con el escaparate actual, con 6 productos por fila en escritorio.
- Cada `<li>` monta una `ProductCard` con `key={product.id}`.
- Como máximo se muestran los productos del tamaño de página activo que devuelve la página (RF-3).
- Las herramientas del listado se agrupan en `CatalogToolbar`: una fila (`flex flex-nowrap items-end justify-between`) con `ProductPageSize` a la izquierda y `ProductGridPagination` a la derecha, cuando hay más de una página. No envuelve a los componentes en tarjetas ni les agrega fondo, borde o sombra (RF-33, RF-34). La barra se renderiza una sola vez, al inicio del listado, también durante los estados de carga, vacío y error.
- `ProductPageSize` muestra la leyenda `Productos por página` por encima del control (RF-32): un botón `aria-haspopup="listbox"` con el tamaño activo y un `ChevronDown`, que abre un `<ul role="listbox">` anclado debajo del botón (el `ul` es el que recibe el foco y el teclado, no el contenedor) con las opciones `CATALOG_PAGE_SIZE_OPTIONS` (12, 24, 48, 64 y 100). Se usa un listbox propio en lugar de un `<select>` nativo porque en móvil el popup del navegador aparecía desanclado. Navegación con teclado (Enter, Space, flechas, Escape), cierre al hacer clic afuera y opción activa marcada con `aria-selected`. Al elegir otra opción navega a `?name=<término>&page=1&size=<n>`, lo que recarga la grilla desde la página 1 (RF-25, RF-26).
- `ProductGridPagination` muestra la leyenda `Página X de Y` encima de los controles y calcula cuántos números entran: un `ResizeObserver` sobre el `nav` mide el ancho disponible y el tamaño real del botón, y `resolveVisiblePageCount` devuelve la mayor cantidad impar que entra restando dos lugares para los `…`, acotada entre 5 y 9. Con eso arma siempre primera página, última página y una ventana alrededor de la activa, en un `<ul aria-label="Páginas">` con `flex-nowrap`: nunca pasa a dos filas y en escritorio llega a nueve pastillas. Si el número activo quedara fuera de vista, un efecto lo centra con `scrollIntoView`. Se oculta cuando hay una sola página (RF-35).

`ProductCard`:

- `<article aria-labelledby={titleId}>` con imagen, nombre y precio. No lleva `tabIndex` ni estilos de foco porque todavía no tiene acción: la tarjeta no debe ser enfocable (RF-12 y requisito no funcional de foco).
- Imagen: `ProductImageCarousel` dentro de un contenedor `aspect-square`. Con una sola foto muestra `<img src={url} alt={product.name} loading="lazy" decoding="async" class="object-cover">` sin controles; con varias agrega botones «Foto anterior» y «Foto siguiente» con íconos `ChevronLeft`/`ChevronRight` de `lucide-react`, navegación circular y un indicador `N / M` en `aria-live="polite"`. El `alt` incluye la posición (`<nombre> — N`) cuando hay varias.
- Sin imágenes: bloque del mismo tamaño con el ícono `ImageOff` de `lucide-react`, `aria-hidden="true"` y un texto `sr-only` «Sin imagen» (RF-13).
- Nombre: `<h2>` de una sola línea (`whitespace-nowrap`), con desvanecido en el borde derecho cuando el texto no entra. El `<span>` interno mide su desborde y, al pasar el mouse por la tarjeta, se desplaza horizontalmente a velocidad constante (60 px/s) hasta mostrar el final; al salir vuelve en 250 ms. Con `prefers-reduced-motion` no se desplaza.
- Precio y moneda: `formatPrice(product.price, product.currency)` (RF-12).
- No muestra stock, dueño, etapa ni acciones de compra.

`format-price`:

- `Intl.NumberFormat('es-AR', { style: 'currency', currency, currencyDisplay: 'symbol', minimumFractionDigits: 2, maximumFractionDigits: 2 })`.
- Con `es-AR`, el resultado es `$ 1.234,50` para `ARS` y `US$ 1.234,50` para `USD`, que cumple RF-12. `Intl` puede usar un espacio duro entre el símbolo y el número; las pruebas comparan el texto normalizando ese espacio.
- Los formateadores se cachean en un `Map` por moneda para no recrearlos en cada tarjeta.
- Si la moneda no es un código ISO válido, se usa un fallback `"<currency> <número es-AR>"` sin romper el render.

**Cubre:** RF-1, RF-2, RF-3, RF-12, RF-13.

## Paginación

`ProductGridPagination` recibe `{ page, totalPages, onSelectPage }` y renderiza:

- `<nav aria-label="Paginación del catálogo">`.
- Lista de botones numéricos con una ventana de hasta 7 páginas: primera, última y páginas cercanas a la actual; los huecos se representan con «…» decorativo y `aria-hidden`.
- Cada botón tiene nombre accesible «Página N»; el actual usa `aria-current="page"` y un estilo diferenciado. Los botones miden al menos 44 px, son navegables con teclado y tienen foco visible.
- Texto siempre visible «Página {page} de {totalPages}», que comunica el total aunque la ventana no muestre todos los números (RF-14).
- `onSelectPage` navega a `?name=<término actual>&page=<n>` conservando el término activo (RF-15). La navegación se dispara desde el evento, no desde un efecto.
- Si `totalPages <= 1`, no se renderiza la paginación.
- No se muestran acciones de anterior/siguiente separadas: los números cubren la navegación exigida.

**Cubre:** RF-3, RF-14, RF-15.

## Estados de carga, vacío y error

`ProductGridStatus` centraliza las variantes presentacionales con copias desde `views/Storefront/constants.ts`:

| Estado | Condición | Render |
| --- | --- | --- |
| Carga | `status === 'loading'` o corrección de página pendiente | 24 esqueletos de tarjeta con `role="status"` y `aria-live="polite"`; texto `sr-only` «Cargando productos…». |
| Vacío por búsqueda | `success`, `totalItems === 0`, `name` no vacío | Mensaje «No encontramos productos para “<término>”.» y sugerencia de probar otro nombre. El término sigue visible en el buscador por RF-10. |
| Catálogo vacío | `success`, `totalItems === 0`, sin `name` | Mensaje «Todavía no hay productos publicados.». |
| Error | `status === 'error'` | `role="alert"` con mensaje «No pudimos cargar los productos. Revisá tu conexión e intentá de nuevo.» y botón «Reintentar» que llama a `retry` (RF-19). |

- Los estados ocupan el ancho de la grilla y reservan una altura mínima para evitar saltos bruscos.
- `Layout` queda montado por encima de `<Outlet />`, por lo que el buscador y `AccountSession` siguen visibles y usables en todos los estados (RF-20, RF-21).
- La distinción entre vacío por búsqueda y catálogo vacío se deriva del término activo, sin una segunda consulta sin filtro.

**Cubre:** RF-16, RF-17, RF-18, RF-19, RF-20, RF-21.

## Accesibilidad, responsive y rendimiento

- HTML semántico: `header`, `form role="search"`, `nav`, `ul`/`li`, `article`, encabezados jerárquicos.
- Foco visible en buscador, lupa, selector de tamaño, flechas del carrusel y botones de paginación; targets de al menos 44 px. Las tarjetas no son enfocables mientras no tengan acción.
- Anuncios accesibles: `role="status"` para carga y `role="alert"` para error.
- Responsive desde 320 px: una columna en móvil, dos desde `sm`, tres desde `lg`, cuatro desde `xl`; header con wrap controlado.
- Se conservan los tokens de `src/styles.css` y el lenguaje visual de escaparate.
- Imports directos, sin barrels nuevos (`bundle-barrel-imports`, `import-avoid-barrel-files`).
- Sin componentes definidos dentro de componentes (`rerender-no-inline-components`).
- El input no controlado evita re-render por tecla; el estado de red no se actualiza durante la escritura (`rerender-move-effect-to-event`).
- Formateadores `Intl` cacheados (`js-cache-function-results`).
- Una sola lectura por combinación `name`/`page`; sin cascadas ni consultas por tarjeta (`async-parallel`, `fquery-avoid-n-plus-one`).
- El máximo de 24 tarjetas hace innecesaria la virtualización o `content-visibility`.
- No se agrega telemetría ni secretos; solo se usa `VITE_API_BASE_URL`, que ya es pública.

**Cubre:** RF-1, RF-12, RF-20, RF-21 y los requisitos no funcionales.

## Estrategia de pruebas

| Nivel | Archivos | Qué verifica |
| --- | --- | --- |
| Cliente API | `get-publications.test.ts` | URL, query, `size`, `credentials`, validación, HTTP y aborto. |
| Utilidades | `read-catalog-search.test.ts`, `format-price.test.ts` | Página inválida, recorte a 100, vacío, es-AR, ARS/USD. |
| Hook | `use-publications.test.tsx` | Carga, éxito, error, reintento, aborto y respuestas viejas. |
| Componentes | `ProductCard.test.tsx`, `ProductGrid.test.tsx`, `ProductGridPagination.test.tsx`, `ProductGridStatus.test.tsx` | Imagen y marcador, precio, lista, ventana de páginas, totales, estados y reintento. |
| Header | `ProductSearch.test.tsx`, `Layout.test.tsx` | Enter, lupa, tope de 100, URL, página 1, buscador visible y sesión intacta. |
| Integración de vista | `Storefront.test.tsx` | URL → consulta → grilla, vacíos, error con reintento, cambio de página y corrección a página 1. |

- Se reemplaza la prueba actual de `Storefront` que afirmaba la ausencia de listado; ahora debe verificar la grilla.
- Se mantienen strings esperados explícitos en los tests de contrato para no repetir errores de las constantes.
- Cobertura mínima exigida por el repo: 90 % de líneas (`npm run coverage:check`).

## Matriz RF

| RF | Cobertura técnica |
| --- | --- |
| RF-1 | `Storefront` deja de ser presentacional y compone grilla, paginación y estados. |
| RF-2 | `getPublications` contra la lectura pública y `usePublications`. |
| RF-3 | `size` de la URL (24 por defecto, máximo 100) enviado a la API; la grilla muestra como máximo ese tamaño. |
| RF-4 | `ProductSearch` dentro del `header` de `Layout`. |
| RF-5 | `onSubmit` del formulario aplica el término con Enter. |
| RF-6 | Botón `type="submit"` de la lupa usa el mismo `onSubmit`. |
| RF-7 | Input no controlado; la URL y el hook solo cambian al enviar. |
| RF-8 | `URLSearchParams` con `name` y `page`; navegación al enviar. |
| RF-9 | `Storefront` deriva la consulta de `useSearchParams` al abrir, recargar o compartir. |
| RF-10 | `ProductSearch` inicializa el input desde `name` de la URL y se sincroniza con la navegación. |
| RF-11 | `readCatalogSearch` y `ProductSearch` omiten `name` vacío o solo con espacios. |
| RF-12 | `ProductCard` muestra imagen, nombre, precio y moneda; `formatPrice` usa es-AR con `$`/`US$`. |
| RF-13 | `ProductCard` renderiza `ImageOff` y «Sin imagen» cuando `images` está vacío. |
| RF-14 | `ProductGridPagination` con números seleccionables y «Página X de Y». |
| RF-15 | `onSelectPage` conserva `name` y actualiza `page`; el hook vuelve a consultar. |
| RF-16 | Estado `loading` del hook y esqueletos de `ProductGridStatus`. |
| RF-17 | Vacío por búsqueda con el término activo. |
| RF-18 | Vacío de catálogo sin término. |
| RF-19 | Estado `error` con `role="alert"` y botón «Reintentar». |
| RF-20 | `Layout` permanece montado; el buscador no depende del estado de la grilla. |
| RF-21 | `AccountSession` y marca se conservan; la grilla no consulta sesión. |
| RF-22 | Todo envío del buscador navega con `page=1`. |
| RF-23 | `readCatalogSearch` canonicaliza páginas inválidas y `Storefront` corrige páginas fuera de rango a 1 con `replace`. |
| RF-24 | `maxLength=100` en el input y `slice(0, 100)` antes de aplicar. |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| `catalog-api` ajusta una página fuera de rango a la última disponible y la tienda exige la 1. | Comparar la página solicitada con `totalPages` de la respuesta y reemplazar la URL a 1 antes de mostrar datos. |
| Bucle de corrección de página. | La corrección siempre lleva a `page=1`; una respuesta de página 1 no vuelve a corregir. |
| Respuestas fuera de orden al cambiar rápido de página o término. | `AbortController` y verificación de solicitud vigente en el hook. |
| CORS no configurado en `fes-infra`/`fes-catalog-api`. | El navegador bloquea la lectura y se muestra el estado de error con reintento; no se agrega proxy ni se inventan cabeceras. |
| Precio serializado distinto de número. | La validación falla de forma visible como error de lectura en lugar de mostrar un precio corrupto. |
| Términos largos o con caracteres especiales. | `slice(0, 100)` y `URLSearchParams`. |
| Header desbordado a 320 px. | Zonas con `flex-wrap`, `min-w-0` y buscador a ancho completo en móvil. |
| Parámetro `page` con decimales, notación científica o fuera de rango seguro. | Validación con entero seguro y corrección a 1. |
| Catálogo vacío con `page > 1`. | `totalPages === 0` también dispara la corrección a 1. |

## Verificación

- `npm test` (unitarios, lint y build de producción).
- `npm run coverage` y `npm run coverage:check` (mínimo 90 % de líneas).
- `npm run verify` como cierre completo.
- Comprobación manual en 320 px, tablet y escritorio: búsqueda con Enter y con la lupa, recarga de URL, paginación, estados de carga, vacío y error, y reintento.
- Navegación por teclado y foco visible en buscador, lupa, tarjetas y paginación.

## Fuera de alcance

- Detalle de producto, carrito, checkout y pago.
- Filtros, orden por el visitante, categorías, favoritos y stock visible.
- Búsqueda por descripción, SKU u otros campos.
- Publicación o edición de productos.
- Endpoint público, filtro, paginación y CORS del lado de `catalog-api`/`infra`.
- Autenticación, Keycloak y flujos de negocio no descritos en la spec.
