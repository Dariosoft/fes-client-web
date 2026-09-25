# Spec 001 — Entrada opcional a la tienda

## Contexto y objetivo
La tienda debe poder usarse sin cuenta. Quien quiera identificarse podrá entrar, salir y ver quién es, con la misma cuenta del panel, hablando solo con el servicio de cuentas y sin que este front cree ni guarde cuentas. Así se reduce la fricción de uso y se separa la identidad opcional de publicar catálogo o empezar una compra.

## Usuarios / actores
- Visitante anónimo de la tienda.
- Visitante con cuenta (la misma cuenta del panel), que elige identificarse en la tienda.

## Historias de usuario
- H1: Como visitante quiero usar la tienda sin iniciar sesión para no tener fricción al explorarla.
- H2: Como visitante quiero entrar con mi cuenta para que la tienda sepa quién soy.
- H3: Como visitante identificado quiero ver quién soy para confirmar que estoy en la cuenta correcta.
- H4: Como visitante identificado quiero salir para dejar de estar identificado en la tienda.

## Requisitos funcionales (criterios de aceptación en EARS)
- RF-1: EL SISTEMA permitirá usar la tienda sin haber iniciado sesión.
- RF-2: CUANDO el visitante elige entrar, EL SISTEMA iniciará el acceso mediante el servicio de cuentas.
- RF-3: CUANDO el acceso mediante el servicio de cuentas termina con éxito, EL SISTEMA dejará al visitante identificado.
- RF-4: MIENTRAS el visitante esté identificado, EL SISTEMA permitirá ver quién es mostrando su nombre y su correo de Google.
- RF-5: CUANDO el visitante identificado elige salir, EL SISTEMA lo dejará sin identificar en la tienda y en el panel.
- RF-6: MIENTRAS el visitante no esté identificado, EL SISTEMA seguirá permitiendo el uso de la tienda.
- RF-7: EL SISTEMA realizará las operaciones de identidad de este corte únicamente contra el servicio de cuentas.
- RF-8: EL SISTEMA no creará ni guardará cuentas en la tienda.
- RF-9: EL SISTEMA no invocará el servicio del panel.
- RF-10: SI el intento de entrar falla o la persona lo cancela, ENTONCES EL SISTEMA la dejará en la tienda sin identificar, mostrará un aviso de que no entró y le permitirá intentar de nuevo.
- RF-11: CUANDO un visitante que ya entró vuelve a abrir la tienda, EL SISTEMA lo dejará identificado solo si no salió ni en la tienda ni en el panel.
- RF-12: CUANDO el visitante entra o sale en el panel y después recarga la tienda o envía una solicitud, EL SISTEMA mostrará el mismo estado: identificado si entró, sin identificar si salió.

## Requisitos no funcionales
- Los textos de interfaz de este corte estarán en español.
- La entrada no será obligatoria para usar la tienda.
- La identidad de este corte usará la misma cuenta del panel; este front no es dueño de esa cuenta.

## Casos límite
- Visitante que nunca entra: puede usar la tienda sin identificarse.
- Visitante que entra con éxito: queda identificado y puede ver quién es y salir.
- Visitante que intenta entrar y el acceso falla o se cancela: sigue en la tienda sin identificar, ve un aviso de que no entró y puede intentar de nuevo (RF-10).
- Visitante identificado que sale: queda sin identificar y sigue pudiendo usar la tienda.
- Visita posterior tras haber entrado y sin haber salido: sigue identificado (RF-11).

## Fuera de alcance
- Crear la cuenta y el acceso con Google (responsabilidad del servicio de cuentas).
- El acceso del panel (responsabilidad del servicio del panel).
- Las pantallas del panel (responsabilidad del front del panel).
- Invocar el servicio del panel desde este front.
- Dejar el servicio de cuentas disponible (responsabilidad de infraestructura).
- Publicar un catálogo.
- Empezar una compra.
- Cualquier rediseño general de la tienda no motivado por entrar, salir o ver quién soy.

## Criterios de finalización
- Todos los RF verificables están cubiertos por prueba automatizada en verde o, si no aplica automatización, por comprobación manual documentada.
- Demostración manual del flujo principal: usar la tienda sin entrar; entrar con éxito; ver quién soy; salir; seguir usando la tienda.
- Ningún comportamiento de este corte depende de crear cuentas, de Google como producto de este front, del servicio del panel, de publicar catálogo o de empezar una compra.

## Dudas abiertas
No quedan dudas abiertas.
