# Tasks 002 — Storefront con grilla de productos y buscador en el header

Desglose incremental de `specs/002-storefront-product-grid/plan.md`. Cada tarea debe completarse con sus pruebas y sin modificar manifiestos ni dependencias.

## Contrato y configuración

- [ ] **T1. Crear `src/app/shared/config/catalog-search.ts` con el contrato de URL.**
  **Depende de:** nada.
  **RF:** RF-8, RF-22, RF-24
  **Done when:** exporta `CATALOG_SEARCH_PARAMS` (`name`, `page`), `CATALOG_PAGE_SIZE = 24`, `CATALOG_SEARCH_MAX_LENGTH = 100` y `normalizeCatalogSearchTerm`; no queda ningún 24 o 100 literal en las vistas.

- [ ] **T2. Crear `src/app/shared/api/catalog/constants.ts` y `types.ts`.**
  **Depende de:** nada.
  **RF:** RF-2, RF-3, RF-12
  **Done when:** el path `/catalog/products/published`, los parámetros `name`/`page`/`size` y los tipos `PublishedProduct`, `ProductImage` y `PublishedProductsResponse` reflejan el contrato acordado con `catalog-api`.

- [ ] **T3. Implementar y probar `shared/api/catalog/get-published-products/`.**
  **Depende de:** T2.
  **RF:** RF-2, RF-3, RF-9, RF-15, RF-19, RF-21
  **Done when:** la URL incluye `page` y `size=24`, agrega `name` solo cuando hay texto, usa `credentials: 'omit'`, valida la respuesta completa y lanza error ante HTTP fallido, JSON inválido o campos faltantes; los tests cubren cada caso y el aborto.

- [ ] **T4. Implementar y probar `views/Storefront/lib/format-price/`.**
  **Depende de:** nada.
  **RF:** RF-12
  **Done when:** `formatPrice(45999.5, 'ARS')` produce `$ 45.999,50` y `formatPrice(45999.5, 'USD')` produce `US$ 45.999,50`, con formateadores cacheados y fallback para monedas no válidas.

- [ ] **T5. Implementar y probar `views/Storefront/lib/read-catalog-search/`.**
  **Depende de:** T1.
  **RF:** RF-9, RF-11, RF-23, RF-24
  **Done when:** recorta y limita `name` a 100, trata vacío/espacios como sin filtro, acepta solo enteros seguros desde 1, marca `shouldCanonicalizePage` para páginas inválidas y usa 1 sin reescribir la URL cuando `page` falta; los tests cubren `abc`, `0`, `-2`, `1.5`, `1e999`, ausencia y valores válidos.

## Datos y componentes de la grilla

- [ ] **T6. Implementar y probar `views/Storefront/hooks/use-published-products/`.**
  **Depende de:** T3.
  **RF:** RF-2, RF-9, RF-15, RF-16, RF-19
  **Done when:** expone `state` (`loading`, `success`, `error`) y `retry`; aborta al cambiar `name`/`page` o al desmontar; ignora respuestas viejas y no convierte un aborto en error; los tests cubren éxito, fallo, reintento y cancelación.

- [ ] **T7. Implementar y probar `views/Storefront/ProductCard/`.**
  **Depende de:** T4.
  **RF:** RF-12, RF-13
  **Done when:** muestra la primera imagen con `alt` del producto, nombre, precio y moneda; sin imágenes muestra el marcador `ImageOff` con texto accesible «Sin imagen»; la tarjeta es focusable con anillo visible y no muestra stock ni acciones de compra.

- [ ] **T8. Implementar y probar `views/Storefront/ProductGrid/`.**
  **Depende de:** T7.
  **RF:** RF-3, RF-12
  **Done when:** renderiza una lista semántica con una `ProductCard` por producto, usa `key` estable y muestra como máximo 24 elementos por página.

- [ ] **T9. Implementar y probar `views/Storefront/ProductGridPagination/`.**
  **Depende de:** T1.
  **RF:** RF-14, RF-15
  **Done when:** muestra números seleccionables con ventana de hasta 7 páginas y «Página X de Y»; marca la actual con `aria-current="page"`, notifica la página elegida sin perder el término y no se renderiza si hay una sola página.

- [ ] **T10. Implementar el estado de carga en `views/Storefront/ProductGridStatus/`.**
  **Depende de:** T8.
  **RF:** RF-16
  **Done when:** muestra 24 esqueletos con `role="status"`, `aria-live="polite"` y texto «Cargando productos…»; no hay saltos de layout al pasar de carga a grilla.

- [ ] **T11. Implementar los estados vacíos en `views/Storefront/ProductGridStatus/`.**
  **Depende de:** T5, T8.
  **RF:** RF-17, RF-18
  **Done when:** con término activo y `totalItems = 0` muestra «No encontramos productos para “<término>”»; sin término y `totalItems = 0` muestra «Todavía no hay productos publicados»; ambas copias están en `constants.ts`.

- [ ] **T12. Implementar el estado de error con reintento en `views/Storefront/ProductGridStatus/`.**
  **Depende de:** T6.
  **RF:** RF-19
  **Done when:** usa `role="alert"` con mensaje en español y un botón «Reintentar» que invoca `retry`; el botón es accesible por teclado y tiene foco visible.

## Header y buscador

- [ ] **T13. Implementar y probar `views/Layout/ProductSearch/`.**
  **Depende de:** T1.
  **RF:** RF-4, RF-5, RF-6, RF-7, RF-10, RF-11, RF-22, RF-24
  **Done when:** el formulario `role="search"` aplica el término con Enter y con la lupa, normaliza con `normalizeCatalogSearchTerm` (100 caracteres máximo), omite `name` vacío, navega siempre con `page=1`, refleja el `name` de la URL y no navega ni consulta al escribir.

- [ ] **T14. Integrar el buscador en `views/Layout/Layout.tsx`.**
  **Depende de:** T13.
  **RF:** RF-4, RF-20, RF-21
  **Done when:** el header muestra marca, buscador y `AccountSession`; el buscador sigue visible y usable en carga, vacío y error; a 320 px no hay desbordamiento y la sesión no cambia de contrato; `Layout.test.tsx` verifica buscador y sesión.

## Vista Storefront e integración

- [ ] **T15. Convertir `views/Storefront/Storefront.tsx` en contenedor de la grilla.**
  **Depende de:** T6, T8, T9, T10, T11, T12.
  **RF:** RF-1, RF-2, RF-3, RF-15, RF-16
  **Done when:** lee `name`/`page` de la URL, consulta con el hook y renderiza la grilla paginada con sus estados; un clic de página conserva el término y actualiza `page` en la URL.

- [ ] **T16. Implementar la corrección de página inválida en `Storefront.tsx`.**
  **Depende de:** T5, T15.
  **RF:** RF-9, RF-22, RF-23
  **Done when:** una `page` no numérica, menor a 1 o con formato inválido se reemplaza en la URL por 1 antes de mostrar datos; una `page` mayor a `totalPages` (incluido `totalPages = 0`) se detecta durante el render, se ve carga y un efecto reemplaza la URL por 1 para volver a consultar, sin mostrar la página ajustada por la API.

- [ ] **T17. Integrar búsqueda y recarga de URL de punta a punta.**
  **Depende de:** T13, T15, T16.
  **RF:** RF-8, RF-10, RF-22
  **Done when:** aplicar una búsqueda nueva deja `?name=...&page=1` y muestra la página 1; recargar o abrir esa URL reproduce término y página; el input muestra el término de la URL; volver atrás refleja el estado previo.

## Calidad y cierre

- [ ] **T18. Revisar accesibilidad y responsive de la vista completa.**
  **Depende de:** T14, T17.
  **RF:** RF-4, RF-12, RF-13, RF-14, RF-20
  **Done when:** hay HTML semántico, foco visible en buscador, lupa, tarjetas y paginación, targets de 44 px, anuncios `status`/`alert` y la grilla se ve correctamente en 320 px, tablet y escritorio.

- [ ] **T19. Actualizar las pruebas existentes y agregar la integración de la vista.**
  **Depende de:** T18.
  **RF:** RF-1 a RF-24
  **Done when:** `Storefront.test.tsx` ya no afirma la ausencia de listado y cubre grilla, vacíos, error con reintento y corrección de página; `Layout.test.tsx` cubre el buscador y `ProductSearch.test.tsx` cubre Enter, lupa y tope de 100.

- [ ] **T20. Ejecutar la verificación completa del repositorio.**
  **Depende de:** T19.
  **RF:** RF-1 a RF-24
  **Done when:** `npm test` pasa (unitarios, lint y build) y `npm run coverage` + `npm run coverage:check` alcanzan el mínimo de 90 % de líneas.

- [ ] **T21. Validar manualmente el corte en móvil y escritorio.**
  **Depende de:** T20.
  **RF:** RF-1 a RF-24
  **Done when:** se demuestra búsqueda con Enter y lupa, URL compartida/recargada, paginación con término activo, página inválida corregida a 1, tope de 100 caracteres, estados de carga/vacío/error con reintento y header usable en 320 px y escritorio.
