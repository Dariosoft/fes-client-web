# Spec 003 — Detalle público de publicación con descripción y tienda del vendedor

## Contexto y objetivo
Hoy el catálogo solo permite descubrir publicaciones en la grilla, sin poder ver el detalle de una publicación concreta ni conocer al vendedor. Este corte agrega una página de detalle pública, alcanzable al activar una tarjeta, que reúne las imágenes, el nombre, el precio, la disponibilidad de stock, la descripción y el nombre público de la tienda del vendedor, con una URL propia, compartible y recargable. El objetivo es que cualquier visitante pueda informarse sobre una publicación concreta antes de decidir, y volver al catálogo sin perder la búsqueda, la página ni el tamaño de página que estaba usando. Esta spec reemplaza la exclusión de la vista de detalle y la no interactividad de la tarjeta fijadas en la spec 002.

## Usuarios / actores
- Visitante anónimo de la tienda.
- Visitante con sesión de cuenta iniciada.

## Historias de usuario
- H1: Como visitante quiero abrir el detalle de una publicación desde la grilla para conocerla mejor antes de decidir.
- H2: Como visitante quiero ver todas las imágenes, el nombre, el precio, la disponibilidad de stock y la descripción de la publicación para evaluarla.
- H3: Como visitante quiero ver el nombre público de la tienda del vendedor para saber quién publica lo que estoy mirando.
- H4: Como visitante quiero que el detalle tenga una URL propia para poder compartirla o recargarla y volver a la misma publicación.
- H5: Como visitante quiero volver al catálogo conservando mi búsqueda, mi página y mi tamaño de página para no perder el recorrido que estaba haciendo.
- H6: Como visitante quiero entender cuándo el detalle está cargando, cuándo no se encontró la publicación y cuándo falló la red, para saber qué está pasando y qué hacer.

## Requisitos funcionales (criterios de aceptación en EARS)
- RF-1: CUANDO el visitante activa una tarjeta de la grilla, EL SISTEMA abrirá la página de detalle de la publicación de esa tarjeta.
- RF-2: EL SISTEMA hará cada tarjeta activable con ratón y con teclado mediante Enter y Espacio.
- RF-3: EL SISTEMA dará a cada tarjeta un nombre accesible que incluya el nombre de la publicación.
- RF-4: EL SISTEMA mostrará en la página de detalle la galería de imágenes de la publicación.
- RF-5: DONDE la publicación tenga más de una imagen, EL SISTEMA permitirá recorrer las imágenes de la galería.
- RF-6: DONDE la publicación no tenga imágenes, EL SISTEMA mostrará un marcador visual en lugar de la galería.
- RF-7: EL SISTEMA mostrará el nombre de la publicación en la página de detalle.
- RF-8: EL SISTEMA mostrará el precio formateado en es-AR con el símbolo de la moneda de la publicación.
- RF-9: DONDE el stock de la publicación sea un número mayor a cero, EL SISTEMA mostrará la cantidad exacta de unidades disponibles (por ejemplo, «12 disponibles»); DONDE el stock sea ilimitado, EL SISTEMA mostrará «Disponible».
- RF-10: DONDE la publicación tenga descripción, EL SISTEMA mostrará la descripción completa, hasta el máximo de 1000 caracteres.
- RF-11: DONDE la publicación no tenga descripción, EL SISTEMA mostrará un texto alternativo en español, como «Este producto no tiene descripción.».
- RF-12: DONDE el vendedor tenga tienda configurada, EL SISTEMA mostrará el nombre público de la tienda del vendedor; DONDE el vendedor no tenga tienda configurada, EL SISTEMA ocultará por completo el bloque de tienda y mostrará el resto de la publicación.
- RF-13: EL SISTEMA identificará la publicación en la URL de la página de detalle.
- RF-14: CUANDO el visitante abre, recarga o comparte la URL de una publicación visible, EL SISTEMA mostrará la página de detalle de esa publicación.
- RF-15: EL SISTEMA considerará visibles las publicaciones publicadas, no eliminadas y con stock disponible o sin límite, de forma consistente con la grilla del catálogo; una publicación sin stock disponible no tendrá página de detalle y se tratará como no encontrada.
- RF-16: SI la URL identifica una publicación que no existe, que no es visible o que no tiene stock disponible, ENTONCES EL SISTEMA mostrará el estado de publicación no encontrada.
- RF-17: MIENTRAS la lectura de la publicación está en curso, EL SISTEMA mostrará un estado de carga en la página de detalle.
- RF-18: SI la lectura de la publicación falla o no responde, ENTONCES EL SISTEMA mostrará un estado de error con un mensaje en español y una acción de reintento.
- RF-19: CUANDO el visitante activa la acción de reintento, EL SISTEMA volverá a leer la publicación.
- RF-20: EL SISTEMA ofrecerá en la página de detalle una acción visible para volver al catálogo.
- RF-21: CUANDO el visitante activa la acción de volver al catálogo, EL SISTEMA lo llevará al catálogo conservando el término de búsqueda, la página y el tamaño de página con los que llegó al detalle cuando provino de la grilla del catálogo; SI el visitante entró por URL directa sin historial previo de catálogo, ENTONCES EL SISTEMA lo llevará al catálogo por defecto.
- RF-22: EL SISTEMA no mostrará acciones de compra, carrito, cantidad ni checkout en la página de detalle.
- RF-23: EL SISTEMA mantendrá el header y sus acciones de cuenta disponibles en la página de detalle.
- RF-24: EL SISTEMA permitirá ver la página de detalle sin iniciar sesión.
- RF-25: MIENTRAS la página de detalle muestra carga, error o publicación no encontrada, EL SISTEMA mantendrá disponible la acción de volver al catálogo.
- RF-26: EL SISTEMA mostrará en la página de detalle solo la publicación identificada en la URL.
- RF-27: EL SISTEMA obtendrá la tienda mediante la referencia pública del vendedor que entrega el detalle de la publicación.
- RF-28: SI la consulta de la tienda falla o no hay tienda, ENTONCES EL SISTEMA mantendrá operativa la página de detalle y simplemente no mostrará el bloque de tienda.
- RF-29: CUANDO la publicación deja de ser visible mientras el visitante la está mirando, EL SISTEMA mantendrá el contenido ya cargado hasta que el visitante recargue o navegue; la siguiente lectura responderá publicación no encontrada y no habrá actualización automática en vivo.

## Requisitos no funcionales
- Textos de interfaz en español.
- La página de detalle es usable y legible en anchos desde 320 px y en escritorio.
- La página de detalle usa HTML semántico, es navegable con teclado y el foco es visible en la tarjeta, la galería, la acción de volver y la acción de reintento.
- Los controles accionables de la página de detalle tienen un área de al menos 44 px.
- Cada imagen de la galería tiene texto alternativo; el marcador visual que reemplaza a las imágenes no agrega información redundante para lectores de pantalla.
- Se conserva el aspecto de escaparate de comercio electrónico / catálogo digital, amigable, moderno y eficiente, con el lenguaje visual existente y sin rediseño general.
- Al abrir la página de detalle o volver al catálogo, la vista cambia sin recargar el documento completo.
- No se expone lógica de servidor ni secretos en la tienda; solo se consumen los contratos públicos del catálogo.

## Casos límite
- Publicación sin imágenes: se muestra el marcador visual en lugar de la galería (RF-6).
- Publicación sin descripción: se muestra el texto alternativo «Este producto no tiene descripción.» (RF-11).
- Publicación con descripción en el límite de 1000 caracteres: se muestra completa (RF-10).
- Vendedor sin tienda configurada: se oculta por completo el bloque de tienda y la página sigue mostrando el resto de la publicación (RF-12 y RF-28).
- Consulta de tienda fallida o sin tienda: el detalle sigue funcionando y no se muestra el bloque de tienda (RF-28).
- Identificador de publicación inexistente en la URL: estado de publicación no encontrada (RF-16).
- Identificador de publicación existente pero no visible: estado de publicación no encontrada (RF-15 y RF-16).
- Publicación sin stock disponible: se trata como no encontrada, consistente con la grilla del catálogo (RF-15 y RF-16).
- URL directa sin historial previo de catálogo: la acción de volver al catálogo lleva al catálogo por defecto (RF-21).
- Publicación que deja de ser visible mientras el visitante la está mirando: se mantiene el contenido ya cargado hasta recargar o navegar; la siguiente lectura responde no encontrada y no hay actualización automática en vivo (RF-29).
- Lectura de publicación fallida o sin respuesta: estado de error con acción de reintento (RF-18 y RF-19).
- Moneda no reconocida: el precio se muestra sin romper el render de la página.
- Stock ilimitado: la página muestra «Disponible» sin exigir una cantidad (RF-9).
- Stock numérico mayor a cero: la página muestra la cantidad exacta de unidades disponibles (RF-9).

## Fuera de alcance
- Compra, carrito, cantidad, checkout y cualquier acción transaccional.
- Marcar favoritos.
- Productos relacionados y recomendaciones.
- Reseñas, calificaciones y comentarios.
- Edición, publicación o baja de publicaciones.
- Login obligatorio para ver el detalle.
- Rediseño general del catálogo, del header o del lenguaje visual.
- Actualización automática en vivo del detalle cuando la publicación deja de ser visible.
- Filtros, orden por el visitante y búsqueda por campos distintos del nombre.
- El contrato público de lectura de la publicación, la exclusión de publicaciones no visibles y la regla de stock (responsabilidad del catálogo).
- Autenticación, Keycloak u otros flujos de negocio no descritos en esta spec.

## Criterios de finalización
- Todos los RF verificables están cubiertos y pasan sus comprobaciones.
- Demostración manual: al activar una tarjeta se abre el detalle de esa publicación con galería, nombre, precio formateado, disponibilidad (cantidad exacta si es un número mayor a cero o «Disponible» si es ilimitada), descripción o texto alternativo y nombre público de la tienda; una publicación sin imágenes muestra el marcador; una sin descripción muestra el texto alternativo; un vendedor sin tienda oculta el bloque de tienda sin afectar el resto.
- Comprobación de URL: abrir, recargar o compartir la URL del detalle reproduce la misma publicación; una publicación inexistente, no visible o sin stock disponible muestra el estado de publicación no encontrada; si la publicación deja de ser visible mientras se mira, se mantiene el contenido ya cargado hasta recargar o navegar.
- Comprobación de navegación: la acción de volver lleva al catálogo conservando búsqueda, página y tamaño de página cuando se llegó desde la grilla, o al catálogo por defecto cuando se entró por URL directa; la acción de volver sigue disponible durante carga, error y no encontrada; el estado de error permite reintentar.
- Comprobación de alcance: la página de detalle no ofrece compra, carrito, cantidad ni checkout.
- Comprobación en tamaño móvil (desde 320 px) y escritorio del detalle y de la tarjeta, con navegación por teclado y foco visible.

## Decisiones resueltas
- ~~Cuando el vendedor no configuró su tienda, ¿se oculta el bloque de tienda o se muestra un texto genérico?~~ Se oculta por completo el bloque de tienda; la página sigue mostrando el resto de la publicación (RF-12).
- ~~La página de detalle, ¿debe mostrar la cantidad exacta de stock o solo si hay disponibilidad?~~ Si el stock es un número mayor a cero se muestra la cantidad exacta (por ejemplo, «12 disponibles»); si es ilimitado se muestra «Disponible»; sin stock disponible no hay página de detalle y se trata como no encontrada (RF-9, RF-15 y RF-16).
- ~~Si el visitante entra por URL directa sin historial de catálogo, ¿qué debe hacer la acción de volver al catálogo?~~ Si llegó desde el catálogo con búsqueda, página o tamaño de página, los conserva; si entró por URL directa sin historial previo, lo lleva al catálogo por defecto (RF-21).
- ~~Si la publicación deja de estar visible mientras se mira, ¿la página pasa a no encontrada, muestra un aviso o mantiene el contenido ya cargado?~~ Se mantiene el contenido ya cargado hasta que el visitante recargue o navegue; la siguiente lectura responde no encontrada y no hay actualización automática en vivo (RF-29).
- Descripción ausente: se muestra un texto alternativo en español, como «Este producto no tiene descripción.» (RF-11).
- Sin acción de compra, carrito, cantidad ni checkout (RF-22).
- La tienda se obtiene mediante la referencia pública del vendedor que entrega el detalle; si esa consulta falla o no hay tienda, el detalle sigue funcionando y simplemente no muestra el bloque de tienda (RF-27 y RF-28).
