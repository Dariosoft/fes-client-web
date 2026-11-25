# Tasks 003 — Detalle público de publicación con descripción y tienda del vendedor

Desglose incremental de `specs/003-publication-detail-page/plan.md`. Cada tarea está pensada para 20–30 minutos, incluye sus pruebas y no modifica manifiestos ni dependencias. Completar en el orden de dependencias.

## Utilidades compartidas

- [x] **T1. Promover `formatPrice` a `src/app/shared/lib/format-price/`.**
  **Depende de:** nada.
  **Cubre:** RF-8.
  **Done when:** `format-price.ts` y su test viven en `shared/lib/format-price/`; `ProductCard` importa la nueva ruta; el test sigue cubriendo es-AR, `ARS`, `USD` y moneda no reconocida; no queda ninguna copia en `views/Storefront/lib/format-price/`.

- [x] **T2. Promover `ProductImageCarousel` a `src/app/shared/components/ProductImageCarousel/`.**
  **Depende de:** nada.
  **Cubre:** RF-4, RF-5, RF-6.
  **Done when:** el componente, su test y sus etiquetas/`buildCarouselPosition` viven en `shared/components/ProductImageCarousel/`; no importa nada de `views/Storefront`; `ProductCard` usa la nueva ruta; se elimina la carpeta privada de `Storefront`; una y varias imágenes siguen cubiertas por tests.

- [x] **T3. Ajustar los controles del carrusel a un área mínima de 44 px.**
  **Depende de:** T2.
  **Cubre:** RF-4, RF-5 y requisito no funcional de targets.
  **Done when:** los botones «Foto anterior» y «Foto siguiente» miden al menos 44 px (`size-11`), conservan foco visible, ícono y navegación circular; los tests de `ProductImageCarousel` y `ProductCard` pasan y la grilla no desborda a 320 px.

- [x] **T4. Crear y probar `src/app/shared/lib/catalog-location/`.**
  **Depende de:** nada.
  **Cubre:** RF-21.
  **Done when:** exporta `CatalogLocation`, `buildCatalogSearchParams`, `buildCatalogHref` y `readCatalogReturnState`; el href es `/` para el catálogo por defecto y `/?name=…&page=…&size=…` para el resto; `readCatalogReturnState` acepta solo `{ from: { name, page, size } }` válido y devuelve `null` ante formas inválidas; los tests cubren defaults, orden de parámetros y rechazos.

## Tipos y clientes API

- [x] **T5. Agregar el tipo `PublicationDetail` y el path de detalle al catálogo.**
  **Depende de:** nada.
  **Cubre:** RF-26, RF-27.
  **Done when:** `shared/api/catalog/types.ts` exporta `PublicationDetail` con `id`, `name`, `price`, `currency`, `stock: number | null`, `description: string | null`, `sellerAccountId` e `images: ProductImage[]`; `CATALOG_PATHS.publication` sigue siendo `/catalog/publication`.

- [x] **T6. Implementar y probar `getPublication`.**
  **Depende de:** T5.
  **Cubre:** RF-14, RF-15, RF-16, RF-26, RF-27.
  **Done when:** `getPublication({ id, signal })` arma `${base}/catalog/publication/{id codificado}`, usa `Accept: application/json` y `credentials: 'omit'`, devuelve `null` en 404, valida estrictamente la forma en 200, lanza error ante 5xx/JSON inválido/campos inválidos y propaga `AbortError`; los tests cubren todos esos casos.

- [x] **T7. Agregar el tipo `PublicShop` y el path de tienda pública a account.**
  **Depende de:** nada.
  **Cubre:** RF-12, RF-27, RF-28.
  **Done when:** `shared/api/account/types.ts` exporta `PublicShop` con `name: string` y `description: string | null`; `ACCOUNT_PATHS.publicShop` es `/accounts/shops`.

- [x] **T8. Implementar y probar `getPublicShop`.**
  **Depende de:** T7.
  **Cubre:** RF-12, RF-27, RF-28.
  **Done when:** `getPublicShop({ sellerAccountId, signal })` arma `${base}/accounts/shops/{sellerAccountId codificado}`, usa `Accept: application/json` y `credentials: 'omit'`, devuelve `null` en 404, valida estrictamente `name`/`description`, lanza error ante 5xx/JSON inválido y propaga `AbortError`; los tests cubren todos esos casos.

## Lógica y estado del detalle

- [x] **T9. Implementar y probar `formatStockLabel`.**
  **Depende de:** nada.
  **Cubre:** RF-9.
  **Done when:** `null` devuelve «Disponible»; `12` devuelve «12 disponibles»; `1` devuelve «1 disponible»; `0` devuelve «Sin stock» como defensa; los tests cubren cada caso.

- [x] **T10. Implementar y probar `usePublicationDetail`.**
  **Depende de:** T4, T6, T8.
  **Cubre:** RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-27, RF-28, RF-29.
  **Done when:** expone `state` (`loading`, `success`, `not-found`, `error`) y `retry`; `id` ausente o vacío produce `not-found` sin `fetch`; 404 produce `not-found`; un fallo de publicación produce `error`; una publicación exitosa consulta la tienda por separado y un 404/error/aborto de tienda deja `shop: null` sin romper el detalle; aborta al cambiar `id` y al desmontar; ignora respuestas viejas; no hay polling ni revalidación automática; los tests cubren todos los casos.

- [x] **T11. Crear las copias del detalle en `views/PublicationDetail/constants.ts`.**
  **Depende de:** nada.
  **Cubre:** RF-11, RF-17, RF-18, RF-20, RF-25.
  **Done when:** centraliza etiqueta de sección, «Volver al catálogo», «Cargando publicación…», «Publicación no encontrada», mensaje de no encontrada, «No pudimos cargar la publicación», mensaje de error, «Reintentar», «Descripción», «Este producto no tiene descripción.», «Tienda» y «Sin imagen»; no hay texto de interfaz duplicado en los componentes.

## Subcomponentes del detalle

- [x] **T12. Implementar y probar `PublicationDetailStatus`.**
  **Depende de:** T11.
  **Cubre:** RF-16, RF-17, RF-18, RF-19, RF-25.
  **Done when:** `loading` usa `role="status"`, `aria-live="polite"` y «Cargando publicación…»; `error` usa `role="alert"`, mensaje en español y botón «Reintentar» de al menos 44 px que invoca `retry`; `not-found` muestra título y mensaje de no encontrada; los tests cubren los tres estados y el reintento por teclado.

- [x] **T13. Implementar y probar `PublicationGallery`.**
  **Depende de:** T2, T3.
  **Cubre:** RF-4, RF-5, RF-6.
  **Done when:** con imágenes renderiza `ProductImageCarousel` compartido y conserva `alt` por imagen; con `images: []` muestra un marcador visual con `ImageOff` decorativo (`aria-hidden`) y sin texto redundante para lectores de pantalla; los tests cubren ambos casos.

- [x] **T14. Implementar y probar `PublicationShop`.**
  **Depende de:** T7.
  **Cubre:** RF-12, RF-28.
  **Done when:** recibe `PublicShop | null`; con tienda renderiza `<h2>Tienda</h2>` y el nombre público; con `null` no renderiza nada; los tests cubren ambos casos.

## Vista y ruta

- [x] **T15. Implementar el contenido de éxito de `PublicationDetail`.**
  **Depende de:** T1, T9, T11, T13, T14.
  **Cubre:** RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-22, RF-23, RF-26, RF-27, RF-28.
  **Done when:** la vista lee `id` y `state.from`, usa `usePublicationDetail`, y en éxito muestra galería, `<h1>` con el nombre, precio con `formatPrice`, stock con `formatStockLabel`, descripción completa o «Este producto no tiene descripción.», y tienda solo si existe; no muestra compra, carrito, cantidad ni checkout; el layout es una columna a 320 px y dos desde `md`.

- [x] **T16. Integrar los estados y el enlace de vuelta en `PublicationDetail`.**
  **Depende de:** T4, T12, T15.
  **Cubre:** RF-16, RF-17, RF-18, RF-19, RF-20, RF-25.
  **Done when:** «Volver al catálogo» se renderiza siempre (carga, error, no encontrada y éxito); el href es `buildCatalogHref(from)` si `readCatalogReturnState` es válido y `/` en caso contrario; el error permite reintentar; los tests cubren los cuatro estados, la vuelta con contexto y la vuelta por defecto.

- [x] **T17. Registrar la ruta `publication/:id` bajo el `Layout`.**
  **Depende de:** T16.
  **Cubre:** RF-13, RF-14, RF-23, RF-24.
  **Done when:** `routes.tsx` monta `PublicationDetail` en `publication/:id` como hija de `Layout`; abrir, recargar y compartir la URL reproduce el detalle; el header y `AccountSession` siguen visibles; no se exige sesión.

## Tarjeta y navegación de ida

- [x] **T18. Convertir `ProductCard` en un enlace accesible al detalle.**
  **Depende de:** T4, T17.
  **Cubre:** RF-1, RF-2, RF-3.
  **Done when:** la tarjeta recibe `{ product, from }` y renderiza un `<Link>` a `/publication/{id}` con `state={{ from }}`; tiene `aria-label` «Ver <nombre>»; Enter navega de forma nativa; Espacio previene el scroll y dispara la misma activación; hay foco visible; no muestra stock ni acciones de compra.

- [x] **T19. Propagar el contexto de catálogo desde `ProductGrid` y `Storefront`.**
  **Depende de:** T4, T18.
  **Cubre:** RF-21.
  **Done when:** `Storefront` construye `{ name, page, size }` desde `readCatalogSearch` y lo pasa a `ProductGrid`; `ProductGrid` lo pasa a cada `ProductCard`; las navegaciones de `Storefront` usan la lib compartida y no duplican el formato de URL.

## Pruebas de integración y regresión

- [x] **T20. Actualizar `ProductCard.test.tsx`, `ProductGrid.test.tsx` y `Storefront.test.tsx`.**
  **Depende de:** T18, T19.
  **Cubre:** RF-1, RF-2, RF-3, RF-21.
  **Done when:** las pruebas envuelven los componentes en `MemoryRouter`; reemplazan la afirmación de tarjeta no interactiva por enlace, foco y navegación; `ProductGrid` verifica la prop `from`; `Storefront` sigue cubriendo grilla, búsqueda, paginación, estados y no regresiona.

- [x] **T21. Agregar la integración tarjeta → detalle → vuelta y URL directa.**
  **Depende de:** T17, T20.
  **Cubre:** RF-1, RF-13, RF-14, RF-21.
  **Done when:** un test con rutas reales activa una tarjeta, verifica la URL `/publication/:id`, el contenido del detalle y que «Volver al catálogo» restaura `?name=…&page=…&size=…`; otro test abre el detalle por URL directa y verifica que la vuelta lleva a `/`; no hay recarga completa del documento.

## Calidad y cierre

- [x] **T22. Revisar accesibilidad y responsive del corte completo.**
  **Depende de:** T16, T19, T21.
  **Cubre:** RF-2, RF-3, RF-4, RF-5, RF-6, RF-12, RF-20, RF-25 y requisitos no funcionales.
  **Done when:** hay HTML semántico, `<h1>` por estado/contenido, foco visible en tarjeta, carrusel, vuelta y reintento; controles del detalle de al menos 44 px; imágenes con `alt`; marcador sin imágenes decorativo; el detalle se ve correctamente en 320 px, tablet y escritorio sin scroll horizontal.

- [x] **T23. Ejecutar la verificación completa del repositorio.**
  **Depende de:** T22.
  **Cubre:** RF-1 a RF-29.
  **Done when:** `npm run lint` pasa sin warnings, `npm run coverage` y `npm run coverage:check` alcanzan el mínimo de 90 % de líneas, `npm run build` compila y `npm run verify` finaliza correctamente.
