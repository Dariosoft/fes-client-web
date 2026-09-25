# Plan técnico — Entrada opcional a la tienda

## Resumen

Este corte añade identidad **opcional** al storefront: la tienda se usa sin sesión; quien quiera identificarse entra, ve quién es y sale hablando **solo** con el servicio de cuentas (`account-api` bajo `/accounts`). Este front **no** crea ni guarda cuentas, **no** invoca el servicio del panel y **no** rediseña la tienda más allá de entrar, salir y mostrar identidad.

Alineado con `AGENTS.md`: SPA React 19 + TypeScript + Vite; textos de UI en español; código en inglés; sin secretos en el bundle; contratos públicos; sin inventar Keycloak ni flujos no descritos en la spec.

**No existe `docs/constitution.md` en este proyecto;** este plan se basa en la spec y en `AGENTS.md`.

---

## Historias cubiertas

| Historia | Qué implica en este front |
|----------|---------------------------|
| H1 | Navegación y uso de la tienda sin gate de login (**RF-1**, **RF-6**) |
| H2 | Acción «Entrar» que inicia el acceso vía servicio de cuentas (**RF-2**, **RF-3**, **RF-7**) |
| H3 | Mostrar nombre y correo de Google mientras hay sesión (**RF-4**) |
| H4 | Acción «Salir» que cierra la sesión compartida vía servicio de cuentas (**RF-5**, **RF-7**) |

---

## Principios técnicos (restricciones del corte)

1. **Identidad solo contra cuentas** — toda operación de entrar, salir y «quién soy» va al servicio de cuentas; ninguna llamada a panel-api ni a otros backends de identidad (**RF-7**, **RF-9**).
2. **Sin dueño de cuenta en el front** — no persistir perfiles, no crear usuarios locales, no almacenar la cuenta en `localStorage`/estado como fuente de verdad; el estado de identidad se deriva de la respuesta del servicio de cuentas (**RF-8**).
3. **Uso anónimo no bloqueado** — ninguna ruta ni componente de catálogo/compra (existente o futuro en este corte) exige sesión; la chrome de identidad es aditiva (**RF-1**, **RF-6**).
4. **Misma sesión que el panel** — la sesión la posee el servicio de cuentas; al salir desde la tienda se cierra también para el panel; al volver a abrir o al pedir sesión, el estado refleja lo que haya en cuentas (incluido un login/logout hecho en el panel) (**RF-5**, **RF-11**, **RF-12**).
5. **Alcance UI mínimo** — solo controles y avisos de identidad; sin rediseño general ni flujos de catálogo/compra (**fuera de alcance** de la spec).

---

## Desglose por capacidades

### 1. Uso de la tienda sin sesión

**Cubre: RF-1, RF-6**

- El arranque y el render principal de la tienda no deben exigir autenticación.
- No hay redirect forzado a login ni pantallas de bloqueo por falta de sesión.
- Mientras el visitante no esté identificado (o tras salir / tras fallo de entrada), el resto de la UI usable de la tienda sigue disponible.
- La chrome de identidad (botón Entrar / datos / Salir) convive con el contenido existente sin convertirlo en un gate.

### 2. Cliente HTTP hacia el servicio de cuentas

**Cubre: RF-7, RF-8, RF-9**

- Introducir un módulo de acceso a identidad que hable únicamente con el servicio de cuentas (ruta base pública `/accounts`, relativa a la base de API ya usada en build time, p. ej. `VITE_API_BASE_URL`).
- Operaciones conceptuales que este cliente debe cubrir (contrato del servicio de cuentas; este front solo consume):
  - **Iniciar entrada** (flujo con Google resuelto en cuentas; el front no implementa Google como producto).
  - **Consultar sesión / quién soy** (nombre y correo de Google si hay sesión activa).
  - **Salir** (cierre de la sesión compartida tienda + panel).
- Todas las peticiones de identidad: `credentials` de navegador según lo que exija el servicio de cuentas para la sesión compartida (p. ej. cookies), sin guardar la cuenta en el cliente.
- **Prohibido** en este módulo: endpoints de panel-api, creación/actualización de cuentas, almacenamiento de perfil como fuente de verdad.
- Tipar respuestas mínimas (`displayName` / nombre, email de Google, estado autenticado o no) sin acoplar a tablas internas.

### 3. Estado de identidad en la SPA

**Cubre: RF-3, RF-4, RF-5, RF-11, RF-12**

- Modelo de estado en memoria (contexto o equivalente ligero):
  - `anonymous` | `identified` (con nombre y correo) | opcionalmente `loading` / `error` de UI.
- **Hidratación al abrir o recargar** la tienda: consultar «quién soy» al servicio de cuentas.
  - Si hay sesión activa → marcado como identificado (**RF-11**).
  - Si no hay sesión (nunca entró, salió en tienda o en panel) → anónimo (**RF-11**, **RF-12**).
- **Tras entrar con éxito**: actualizar estado a identificado con los datos que devuelva cuentas (**RF-3**, **RF-4**).
- **Tras salir con éxito**: estado anónimo; no cachear identidad local como si siguiera dentro (**RF-5**).
- **Tras una solicitud de identidad** (o recarga) cuando el panel haya entrado o salido: el resultado de cuentas es la verdad; la UI debe reflejar el mismo estado (**RF-12**).
- No usar un almacén local de «cuenta» para decidir si está identificado; como mucho, UI efímera (avisos) en memoria.

### 4. Flujo «Entrar»

**Cubre: RF-2, RF-3, RF-7, RF-10**

- Control visible «Entrar» (o equivalente en español) cuando el visitante no está identificado.
- Al elegirlo, el sistema **inicia** el acceso mediante el servicio de cuentas (redirect / apertura del flujo que define cuentas; este front no valida Google ni crea la cuenta).
- **Éxito**: al volver / completar el callback del servicio de cuentas, consultar o recibir la sesión y dejar al visitante identificado (**RF-3**).
- **Fallo o cancelación** (**RF-10**):
  - Permanecer en la tienda (misma SPA / misma experiencia de navegación, sin quedar «atrapado» en un limbo de login).
  - Estado: sin identificar.
  - Mostrar aviso en español de que no entró.
  - Dejar disponible de nuevo la acción Entrar.

### 5. Ver «quién soy»

**Cubre: RF-4**

- Mientras esté identificado, mostrar de forma clara y accesible:
  - nombre
  - correo de Google
- Textos en español alrededor de la identidad (etiquetas/avisos); no inventar campos extra de perfil.
- No mostrar datos de identidad cuando el estado sea anónimo.

### 6. Flujo «Salir»

**Cubre: RF-5, RF-6, RF-7**

- Control «Salir» visible solo (o prioritariamente) cuando hay sesión.
- Al elegirlo, invocar salida **solo** en el servicio de cuentas (cierre de sesión compartida → deja de estar identificado en tienda y en panel).
- Tras éxito: UI anónima; la tienda sigue usable (**RF-6**).
- No llamar al panel para cerrar sesión.

### 7. UI de identidad (chrome mínima)

**Cubre: RF-1, RF-2, RF-4, RF-5, RF-6, RF-10**

- Zona estable en el layout existente (p. ej. cabecera) con:
  - Anónimo: acción Entrar.
  - Identificado: nombre, correo, acción Salir.
  - Aviso de entrada fallida/cancelada (dismissible o temporal), sin bloquear el uso.
- Textos de interfaz de este corte en español (requisito no funcional).
- Responsive desde 320 px; HTML semántico; foco visible; navegación por teclado (`AGENTS.md`).
- Conservar el lenguaje visual actual; no rediseño general.

### 8. Configuración y límites del front

**Cubre: RF-7, RF-8, RF-9**

- Reutilizar `VITE_API_BASE_URL` (o extensión mínima documentada si hace falta un path base de cuentas) en build time; recordatorio: variables `VITE_*` quedan en el bundle — no secretos de OAuth en el cliente.
- No añadir dependencias de auth de terceros en el front salvo que el contrato de cuentas lo exija de forma explícita y se apruebe; preferir redirects/APIs del servicio de cuentas.
- No telemetría de identidad a Loki/Prometheus/Tempo desde el navegador.

### 9. Pruebas y verificación

**Cubre: RF-1 … RF-12** (criterios de finalización de la spec)

Automatizable donde sea práctico (unit / component / contrato mockeado del cliente de cuentas):

| Escenario | RF |
|-----------|-----|
| Render / uso sin sesión; Entrar no es obligatorio | RF-1, RF-6 |
| Entrar dispara cliente hacia cuentas (no panel) | RF-2, RF-7, RF-9 |
| Éxito de entrada → estado identificado con nombre y email | RF-3, RF-4 |
| Salir → anónimo; petición de logout solo a cuentas | RF-5, RF-7 |
| Fallo/cancelación → anónimo + aviso + reintento | RF-10 |
| Hidratación: sesión activa → identificado; sin sesión → anónimo | RF-11 |
| Tras «sesión cerrada en cuentas» (simular salida en panel) al recargar/consultar → anónimo | RF-12 |
| Tras «sesión abierta en cuentas» al consultar → identificado | RF-12 |
| El módulo de identidad no crea/guarda cuenta ni llama panel | RF-8, RF-9 |

Manual documentada (demostración del criterio de finalización):

1. Usar la tienda sin entrar.
2. Entrar con éxito.
3. Ver quién soy (nombre + correo).
4. Salir y seguir usando la tienda.
5. (Si el entorno lo permite) entrar o salir en el panel y recargar/consultar en la tienda: mismo estado.

Tras implementación: `npm test` (lint + typecheck + build) según `AGENTS.md`.

---

## Mapa RF → partes del plan

| RF | Parte(s) del plan |
|----|-------------------|
| RF-1 | §1 Uso sin sesión; §7 UI chrome |
| RF-2 | §4 Flujo Entrar; §7 UI |
| RF-3 | §3 Estado; §4 Flujo Entrar |
| RF-4 | §3 Estado; §5 Quién soy; §7 UI |
| RF-5 | §3 Estado; §6 Flujo Salir |
| RF-6 | §1 Uso sin sesión; §6 tras salir; §7 UI |
| RF-7 | §2 Cliente cuentas; §4; §6; §8 Config |
| RF-8 | §2 Cliente; §3 Estado; §8 Config |
| RF-9 | §2 Cliente; §8 Config |
| RF-10 | §4 Flujo Entrar (fallo/cancelación); §7 aviso |
| RF-11 | §3 Hidratación al reabrir |
| RF-12 | §3 Estado sincronizado con cuentas tras recarga/solicitud |

---

## Fuera de este plan (explícito)

- Implementar OAuth/Google o creación de cuentas (account-api).
- Disponibilidad del servicio en infra.
- Pantallas o puerta del panel (panel-web / panel-api).
- Llamadas desde este front a panel-api.
- Catálogo, compra, rediseño general de la tienda.

---

## Orden de implementación sugerido

1. Cliente de identidad → solo `/accounts` (**RF-7, RF-8, RF-9**).
2. Estado + hidratación al montar (**RF-3, RF-4, RF-11, RF-12**).
3. UI chrome anónima / identificada (**RF-1, RF-4, RF-6**).
4. Flujo Entrar + manejo de fallo/cancelación (**RF-2, RF-3, RF-10**).
5. Flujo Salir (**RF-5, RF-6**).
6. Pruebas automatizadas + guion manual de finalización (**todos los RF**).
