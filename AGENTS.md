# AGENTS.md - client-web

## Proyecto
Storefront público de Friendly E-Shop, construido como SPA con React 19, TypeScript estricto y Vite. Presenta catálogo y flujos de compra consumiendo desde el navegador las APIs de catálogo, pedidos y pagos y cuenta.
Es una aplicacion muy amigable con el usuario que permite hacer compras de manera sencilla, el look and feel debe transmitir modernidad y eficiencia. Debe verse como un E-commerce UI / Catálogo Digital.
Se compila como contenido estático, usa `VITE_API_BASE_URL` en build time y nginx lo sirve en el puerto 8080.

## Comandos
- Instalar: `npm ci`
- Ejecutar: `npm run dev`
- Tests: `npm test`
- Compilar: `npm run build`
- Lint: `npm run lint`; usa ESLint con TypeScript tipado y las reglas oficiales de React Hooks.

## Estilo y convenciones
- Usa TypeScript estricto, componentes funcionales y nombres de componentes en `PascalCase`.
- Nombres y código en inglés; textos de interfaz en español.
- Respeta `eslint.config.js`; corrige errores y warnings sin desactivar reglas como atajo.
- Mantén la interfaz responsive desde 320 px y accesible con HTML semántico, foco visible y navegación por teclado.
- Conserva el lenguaje visual existente salvo que la spec solicite un rediseño.

## Reglas
- Lee la skill `/vercel-react-best-practices` y la spec activa, si existe, antes de tocar código.
- Para tareas visuales consulta también `/ui-ux-pro-max` y valida escritorio y móvil.
- Este proyecto no contiene lógica de servidor ni secretos; toda variable `VITE_*` queda expuesta en el bundle.
- Consume contratos públicos de `/catalog`, `/orders` y `/payments`; no acoples la UI a tablas o detalles internos.
- No envíes telemetría directamente a Loki, Prometheus o Tempo desde el navegador.
- Autenticación, Keycloak y workflows de negocio completos están diferidos; no los inventes sin una spec.
- Mantén versiones fijadas y consulta antes de añadir dependencias o cambiar rutas compartidas.
- No añadas comentarios `eslint-disable` sin una causa documentada y localizada.
- Preserva el fallback SPA y `/healthz` si modificas Docker o nginx; los manifiestos viven en `infra`.

## Al terminar cualquier tarea
- Ejecuta `npm test`; incluye lint, typecheck y build de producción.
- Prueba manualmente la vista afectada en tamaños móvil y escritorio.
- Verifica estados de carga, vacío y error cuando cambies consumo de APIs.
