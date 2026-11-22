# Spec 002 — Storefront con grilla de productos y buscador en el header

## Contexto y objetivo
El Storefront público hoy es una página de presentación que no muestra el surtido real de la tienda. Este corte lo reemplaza por una grilla con todos los productos publicados de todos los vendedores, paginada de 24 en 24, con un buscador por nombre siempre disponible en el header compartido y estados de carga, vacío y error. El objetivo es que cualquier visitante pueda descubrir lo que la tienda vende y encontrar un producto concreto por su nombre sin crear una cuenta, y que pueda compartir o recargar el resultado exacto de su búsqueda.

## Usuarios / actores
- Visitante anónimo de la tienda.
- Visitante con sesión de cuenta iniciada.

## Historias de usuario
- H1: Como visitante quiero ver todos los productos publicados en una grilla para conocer el surtido disponible de la tienda.
- H2: Como visitante quiero buscar productos por nombre desde el header para encontrar uno concreto sin recorrer la grilla entera.
- H3: Como visitante quiero que mi búsqueda y mi página queden en la URL para poder recargar o compartir ese resultado exacto.
- H4: Como visitante quiero recorrer el catálogo página por página de 24 productos para llegar al final del listado.
- H5: Como visitante quiero entender cuándo la tienda está cargando, cuándo no hay resultados y cuándo falló, para saber qué está pasando y qué hacer.

## Requisitos funcionales (criterios de aceptación en EARS)
- RF-1: EL SISTEMA reemplazará el contenido actual del Storefront por una grilla de productos.
- RF-2: CUANDO la tienda se muestra, EL SISTEMA presentará en la grilla todos los productos publicados que expone la lectura pública del catálogo.
- RF-3: EL SISTEMA mostrará como máximo el tamaño de página solicitado, con 24 productos por página por defecto y 100 como máximo.
- RF-4: EL SISTEMA mostrará el buscador por nombre dentro del header compartido, visible en la tienda.
- RF-5: CUANDO el visitante presiona Enter en el campo del buscador, EL SISTEMA aplicará el término escrito como filtro por nombre del catálogo.
- RF-6: CUANDO el visitante activa la lupa del buscador, EL SISTEMA aplicará el término escrito como filtro por nombre del catálogo.
- RF-7: MIENTRAS el visitante escribe en el buscador sin presionar Enter ni la lupa, EL SISTEMA no aplicará el filtro ni volverá a pedir productos.
- RF-8: CUANDO se aplica un término de búsqueda, EL SISTEMA dejará en la URL el estado `?name=...&page=...` con el término aplicado y la página consultada, más `size=...` cuando el tamaño de página difiera del valor por defecto.
- RF-9: CUANDO el visitante abre, recarga o comparte una URL con `name` y `page`, EL SISTEMA reproducirá esa búsqueda y esa página.
- RF-10: CUANDO el visitante abre una URL con `name`, EL SISTEMA mostrará ese término escrito en el campo del buscador.
- RF-11: CUANDO el visitante envía el buscador con el campo vacío o con solo espacios, EL SISTEMA mostrará la grilla sin filtrar por nombre.
- RF-12: EL SISTEMA mostrará en cada tarjeta la imagen, el nombre, el precio y la moneda del producto, con el precio formateado en es-AR y símbolo de moneda (`$` para ARS y `US$` para USD).
- RF-13: DONDE un producto no tenga imágenes, EL SISTEMA mostrará en su tarjeta un marcador visual en lugar de la imagen.
- RF-14: EL SISTEMA mostrará una paginación visible con números de página seleccionables y el total de páginas, calculados con el total de productos y el total de páginas de la respuesta.
- RF-15: CUANDO el visitante elige otra página, EL SISTEMA mostrará los productos de esa página con el tamaño de página activo, conservará el término de búsqueda y lo reflejará en la URL.
- RF-16: MIENTRAS la lectura de productos está en curso, EL SISTEMA mostrará un estado de carga en lugar de la grilla.
- RF-17: SI el término o la página solicitados no devuelven productos pero el catálogo tiene productos publicados, ENTONCES EL SISTEMA mostrará un estado vacío que indique que no hay productos para esa búsqueda.
- RF-18: SI el catálogo no tiene ningún producto publicado, ENTONCES EL SISTEMA mostrará un estado vacío que indique que todavía no hay productos disponibles.
- RF-19: SI la lectura de productos falla o no responde, ENTONCES EL SISTEMA mostrará un estado de error con un mensaje en español y un botón de reintento.
- RF-20: MIENTRAS la grilla muestra un estado de carga, vacío o de error, EL SISTEMA mantendrá visible y usable el buscador del header.
- RF-21: EL SISTEMA mantendrá el header y sus acciones de cuenta disponibles para visitantes con y sin sesión, sin condicionar la grilla al inicio de sesión.
- RF-22: CUANDO se aplica un término de búsqueda nuevo, EL SISTEMA volverá a la página 1 y lo reflejará en la URL.
- RF-23: SI la URL trae una `page` no numérica, menor a 1 o mayor al total de páginas, ENTONCES EL SISTEMA corregirá la navegación a la página 1 y lo reflejará en la URL.
- RF-24: EL SISTEMA limitará el término del buscador a un máximo de 100 caracteres antes de aplicarlo.

## Requisitos no funcionales
- Textos de interfaz en español.
- La grilla y el buscador son usables y legibles en anchos desde 320 px y en escritorio.
- La grilla usa HTML semántico, es navegable con teclado y el foco es visible en el buscador, la lupa, las tarjetas y la paginación.
- Al aplicar una búsqueda o cambiar de página, la tienda actualiza el contenido sin recargar el documento completo.
- Se conserva el aspecto de escaparate de comercio electrónico / catálogo digital, amigable, moderno y eficiente, con el lenguaje visual existente.
- No se expone lógica de servidor ni secretos en la tienda; solo se consumen los contratos públicos del catálogo.
- La tienda sigue siendo una SPA: el chrome global permanece montado y la grilla se renderiza dentro del layout del router.

## Casos límite
- Término compuesto solo por espacios: se trata como búsqueda vacía (RF-11).
- Producto sin imágenes: la tarjeta muestra el marcador visual (RF-13).
- Búsqueda sin coincidencias: estado vacío con el término buscado visible en el buscador (RF-10 y RF-17).
- Catálogo sin productos publicados: estado vacío propio (RF-18).
- Lectura de productos fallida o sin respuesta: estado de error y header usable (RF-19 y RF-20).
- Navegación entre páginas conservando el término activo (RF-15).
- URL con `page` no numérica, menor a 1 o mayor al total de páginas: se corrige a la página 1 y se refleja en la URL (RF-23).
- Término de búsqueda muy largo o con caracteres especiales: se limita a 100 caracteres antes de aplicarlo y no se restringen caracteres (RF-24).

## Fuera de alcance
- Vista de detalle de producto.
- Orden por nombre, precio o novedad, y filtros por categoría o rango de precio.
- Categorías, destacados y recomendaciones.
- Carrito, inicio de compra y pago.
- Marcar favoritos.
- Buscar por descripción, SKU u otro campo distinto del nombre.
- Mostrar stock o cantidad disponible en las tarjetas.
- Publicar, editar o dar de baja productos.
- El endpoint público, el filtro por nombre, la paginación y la exclusión de productos sin stock (responsabilidad de `fes-catalog-api`).
- CORS y orígenes permitidos (responsabilidad de `fes-catalog-api` con configuración de `fes-infra`).
- Autenticación, Keycloak u otros flujos de negocio no descritos en esta spec.

## Criterios de finalización
- Todos los RF verificables están cubiertos y pasan sus comprobaciones.
- Demostración manual: la tienda muestra la grilla paginada de 24 en 24; el buscador del header envía el término con Enter y con la lupa y actualiza `?name=...&page=...`; recargar o compartir esa URL reproduce búsqueda y página; las tarjetas muestran imagen, nombre, precio y moneda, y el marcador cuando falta la imagen; se ven los estados de carga, vacío y error.
- Comprobación de navegación: una búsqueda nueva vuelve a la página 1; una `page` inválida en la URL se corrige a la página 1 y se refleja en la URL; el término aplicado nunca supera los 100 caracteres; el estado de error permite reintentar.
- Comprobación en tamaño móvil (desde 320 px) y escritorio de la vista afectada, con navegación por teclado.
