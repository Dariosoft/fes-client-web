# Spec 001 — Storefront con entrada Google opcional

## Contexto y objetivo
La tienda pública debe presentarse como un escaparate de comercio electrónico usable de punta a punta sin autenticación, y ofrecer de forma opcional Entrar con Google y Salir. La sesión es compartida con el panel: Salir cierra esa sesión también allí. La cuenta la guarda el servicio de cuentas; esta iteración solo consume sus contratos públicos de entrada, sesión y salida.

## Usuarios / actores
- Visitante anónimo de la tienda.
- Visitante con sesión de cuenta (tras Entrar con Google).

## Historias de usuario
- H1: Como visitante quiero recorrer la tienda completa sin iniciar sesión para comprar o explorar sin fricción.
- H2: Como visitante quiero Entrar con Google para asociar mi visita a una cuenta cuando lo necesite.
- H3: Como visitante con sesión quiero Salir para cerrar la sesión compartida también en el panel.

## Requisitos funcionales (criterios de aceptación en EARS)
- RF-1: EL SISTEMA presentará la página como un escaparate de comercio electrónico usable por completo sin autenticación.
- RF-2: MIENTRAS el visitante no tenga sesión de cuenta, EL SISTEMA ofrecerá la acción Entrar con Google.
- RF-3: CUANDO el visitante elige Entrar con Google, EL SISTEMA lo navegará a `GET {URL base de API del entorno}/accounts/login/google?return_to={origen de la tienda}`.
- RF-4: CUANDO la tienda carga, EL SISTEMA consultará `GET {URL base de API del entorno}/accounts/session` con credenciales.
- RF-5: MIENTRAS el visitante tenga sesión de cuenta, EL SISTEMA ofrecerá la acción Salir.
- RF-6: CUANDO el visitante elige Salir, EL SISTEMA solicitará `POST {URL base de API del entorno}/accounts/logout` con credenciales.
- RF-7: CUANDO Salir se completa con éxito, EL SISTEMA tratará al visitante como sin sesión en la tienda.
- RF-8: EL SISTEMA usará la URL base de API del entorno activo; en Minikube el valor por defecto es `http://api.friendly-e-shop.test`.
- RF-9: EL SISTEMA presentará en este corte la página con aspecto de tienda y las acciones Entrar y Salir, sin catálogo ni compra.
- RF-10: MIENTRAS el visitante tenga sesión de cuenta, EL SISTEMA mostrará solo el nombre de la persona, junto a Salir.
- RF-11: SI la consulta de sesión falla o no responde, ENTONCES EL SISTEMA mantendrá la página usable, mostrará Entrar y un aviso breve de que no se pudo comprobar la sesión.
- RF-12: SI el visitante regresa del flujo Google sin sesión válida y la URL de retorno trae el indicador de error, ENTONCES EL SISTEMA mostrará la página de visitante, Entrar y un aviso de que no se pudo entrar.

## Requisitos no funcionales
- Textos de interfaz en español.
- Interfaz usable en anchos desde 320 px, con HTML semántico, foco visible y navegación por teclado.
- Aspecto de escaparate de comercio electrónico / catálogo digital, alineado con el carácter amigable, moderno y eficiente del producto.
- No se expone ni se inventa lógica de servidor ni secretos en el cliente; solo se consumen contratos públicos de cuenta según lo anterior.

## Casos límite
- SI la consulta de sesión falla o no responde, ENTONCES la página sigue usable, se muestra Entrar y un aviso breve (RF-11).
- SI el visitante regresa del flujo Google sin sesión válida, ENTONCES se muestra la página de visitante, Entrar y un aviso de que no se pudo entrar, a partir del indicador en la URL (RF-12).
- Con sesión, la tienda muestra solo el nombre, junto a Salir (RF-10).

## Fuera de alcance
- Llamar a panel-api.
- Hablar con Google directamente desde la tienda.
- Implementar Publicar.
- Mostrar un listado de catálogo.
- Implementar el inicio de una compra.
- Guardar o administrar la cuenta (responsabilidad de account-api).
- Autenticación, Keycloak u otros flujos de negocio no descritos en esta spec.

## Criterios de finalización
- Todos los RF verificables están cubiertos y pasan sus comprobaciones.
- Demostración manual: tienda usable sin login; Entrar con Google lleva al contrato indicado con `return_to` al origen de la tienda; al cargar se consulta la sesión con credenciales; Salir cierra la sesión compartida y la tienda pasa a estado sin sesión.
- Comprobación en tamaño móvil y escritorio de la vista afectada.

## Dudas abiertas
Ninguna.
