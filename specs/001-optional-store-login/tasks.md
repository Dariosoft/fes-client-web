# Tareas — Entrada opcional a la tienda

Spec: `specs/001-optional-store-login/spec.md`  
Plan: `specs/001-optional-store-login/plan.md`

Tareas pequeñas (~20–30 min), en orden de dependencia. Cada una indica los RF que cubre y un criterio verificable «Done when:».

---

## 1. Cliente HTTP hacia el servicio de cuentas

- [x] **T1.** Definir tipos mínimos de identidad en el cliente (estado autenticado o no, nombre/displayName, correo de Google) sin acoplar a tablas internas.
  - **RF:** RF-7, RF-8
  - **Done when:** Existen tipos TypeScript exportados que representan sesión anónima e identificada con nombre y email, y no modelan creación ni persistencia de cuentas.

- [x] **T2.** Crear el módulo cliente de identidad con base en `VITE_API_BASE_URL` + ruta pública `/accounts`, usando `credentials` del navegador según exija el servicio de cuentas.
  - **RF:** RF-7, RF-8, RF-9
  - **Done when:** El módulo solo construye URLs bajo `/accounts` (relativas a la base de API), no referencia panel-api ni otros backends de identidad, y no guarda la cuenta en `localStorage` ni similar.

- [x] **T3.** Implementar en el cliente la operación «consultar sesión / quién soy».
  - **RF:** RF-7, RF-4
  - **Done when:** Una función tipada consulta el servicio de cuentas y, si hay sesión, expone nombre y correo de Google; si no, indica anónimo. Ninguna llamada sale de `/accounts`.

- [x] **T4.** Implementar en el cliente la operación «iniciar entrada» (redirect o flujo que defina cuentas; sin Google ni OAuth propios en este front).
  - **RF:** RF-2, RF-7
  - **Done when:** Al invocar la operación se inicia el acceso únicamente contra el servicio de cuentas; el front no valida Google ni crea la cuenta.

- [x] **T5.** Implementar en el cliente la operación «salir» (cierre de sesión compartida).
  - **RF:** RF-5, RF-7
  - **Done when:** Al invocar salir se llama solo al servicio de cuentas para cerrar sesión; no hay llamada al servicio del panel.

---

## 2. Estado de identidad en la SPA

- [x] **T6.** Introducir estado de identidad en memoria (contexto o equivalente ligero): `anonymous` | `identified` (con nombre y correo) y, si hace falta, `loading` / error de UI.
  - **RF:** RF-3, RF-4, RF-8
  - **Done when:** El estado en memoria puede representar anónimo e identificado con nombre y email; la fuente de verdad no es un perfil guardado localmente.

- [x] **T7.** Hidratar el estado al abrir o recargar la tienda consultando «quién soy» en cuentas.
  - **RF:** RF-11, RF-12
  - **Done when:** Con sesión activa en cuentas el visitante queda identificado; sin sesión (nunca entró, salió en tienda o en panel) queda anónimo tras la consulta o recarga.

- [x] **T8.** Actualizar el estado tras entrada exitosa y tras salida exitosa según la respuesta de cuentas (sin cachear identidad local como si siguiera dentro).
  - **RF:** RF-3, RF-5, RF-12
  - **Done when:** Tras éxito de entrada el estado es identificado con los datos de cuentas; tras salir el estado es anónimo; una nueva consulta refleja lo que diga cuentas.

---

## 3. UI de identidad (chrome mínima)

- [x] **T9.** Añadir en el layout existente (p. ej. cabecera) la chrome anónima: acción «Entrar» visible, sin redirect forzado ni gate de login sobre el resto de la tienda.
  - **RF:** RF-1, RF-6
  - **Done when:** Con visitante anónimo la tienda renderiza y es usable; «Entrar» está disponible y no es obligatorio para navegar el contenido existente.

- [x] **T10.** Mostrar, mientras esté identificado, nombre y correo de Google de forma clara, accesible y con textos de interfaz en español; ocultar esos datos en anónimo.
  - **RF:** RF-4
  - **Done when:** En estado identificado se ven nombre y correo; en anónimo no se muestran; labels/avisos del corte están en español; usable con teclado y responsive desde 320 px.

- [x] **T11.** Mostrar la acción «Salir» cuando hay sesión, sin rediseñar el resto de la tienda.
  - **RF:** RF-5, RF-6
  - **Done when:** Con sesión visible «Salir»; tras usarla (en la tarea de flujo) la chrome vuelve a anónima y el contenido de la tienda sigue disponible.

---

## 4. Flujo «Entrar»

- [x] **T12.** Cablear «Entrar» para iniciar el acceso vía el cliente de cuentas y, al completar con éxito el callback/retorno, consultar o recibir la sesión y marcar identificado.
  - **RF:** RF-2, RF-3, RF-7
  - **Done when:** Elegir «Entrar» inicia el flujo solo contra cuentas; al volver con éxito el visitante queda identificado con los datos de sesión.

- [x] **T13.** Manejar fallo o cancelación de la entrada: permanecer en la tienda, estado anónimo, aviso en español de que no entró, y «Entrar» disponible de nuevo.
  - **RF:** RF-10, RF-1, RF-6
  - **Done when:** Simulando fallo o cancelación, la SPA no queda atrapada en login, el estado es anónimo, se muestra el aviso y se puede reintentar «Entrar»; el resto de la tienda sigue usable.

---

## 5. Flujo «Salir»

- [x] **T14.** Cablear «Salir» para invocar logout solo en cuentas y dejar la UI anónima manteniendo usable la tienda.
  - **RF:** RF-5, RF-6, RF-7, RF-9
  - **Done when:** Al salir se llama solo a cuentas (nunca al panel); el visitante queda sin identificar en la tienda; la navegación/uso de la tienda continúa sin gate.

---

## 6. Pruebas y verificación

- [x] **T15.** Pruebas automatizadas: uso/render sin sesión y sin gate de login; chrome anónima no bloquea la tienda.
  - **RF:** RF-1, RF-6
  - **Done when:** Tests en verde demuestran que la tienda se usa sin sesión y que la identidad no es obligatoria.

- [x] **T16.** Pruebas automatizadas: «Entrar» dispara el cliente hacia cuentas (no panel); éxito → identificado con nombre y email; el módulo no crea/guarda cuentas ni llama al panel.
  - **RF:** RF-2, RF-3, RF-4, RF-7, RF-8, RF-9
  - **Done when:** Tests con mock del cliente/contrato verifican inicio de entrada solo a `/accounts`, estado identificado con nombre y correo, y ausencia de llamadas a panel o de persistencia de cuenta.

- [x] **T17.** Pruebas automatizadas: «Salir» → anónimo y logout solo a cuentas; fallo/cancelación de entrada → anónimo + aviso + reintento.
  - **RF:** RF-5, RF-7, RF-10
  - **Done when:** Tests en verde cubren logout solo contra cuentas dejando anónimo, y el camino de fallo/cancelación con aviso y «Entrar» disponible.

- [x] **T18.** Pruebas automatizadas: hidratación con sesión activa vs sin sesión; tras simular sesión abierta o cerrada en cuentas (p. ej. cambio hecho en el panel), recarga o nueva consulta muestra el mismo estado.
  - **RF:** RF-11, RF-12
  - **Done when:** Tests en verde: sesión activa → identificado; sin sesión → anónimo; cambio de sesión en cuentas reflejado al recargar o consultar.

- [ ] **T19.** Documentar y ejecutar el guion manual de finalización; correr `npm test` (lint, typecheck y build).
  - **RF:** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12
  - **Done when:** Queda documentado el resultado de: usar sin entrar; entrar con éxito; ver quién soy; salir y seguir usando; (si el entorno lo permite) entrar/salir en el panel y recargar/consultar en la tienda con el mismo estado; y `npm test` termina en verde.

---

## Cobertura RF

| RF | Tareas |
|----|--------|
| RF-1 | T9, T13, T15, T19 |
| RF-2 | T4, T12, T16, T19 |
| RF-3 | T6, T8, T12, T16, T19 |
| RF-4 | T3, T6, T10, T16, T19 |
| RF-5 | T5, T8, T11, T14, T17, T19 |
| RF-6 | T9, T11, T13, T14, T15, T19 |
| RF-7 | T1–T5, T12, T14, T16, T17, T19 |
| RF-8 | T1, T2, T6, T16, T19 |
| RF-9 | T2, T14, T16, T19 |
| RF-10 | T13, T17, T19 |
| RF-11 | T7, T18, T19 |
| RF-12 | T7, T8, T18, T19 |
