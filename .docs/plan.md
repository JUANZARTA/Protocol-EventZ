# Plan de construcción — Protocol EventZ

Contexto de negocio completo en [`universo-del-discurso.md`](./universo-del-discurso.md).
Este documento es el plan técnico, por fases, para construir la app.

## Stack

- **Angular 18**, standalone components, SSR (`@angular/ssr` + `server.ts`)
- **Angular Service Worker** (`@angular/service-worker` + `ngsw-config.json`) → PWA instalable
  en Android y iOS (Safari no dispara `beforeinstallprompt`: hay que detectar iOS por
  `userAgent` y mostrar instrucciones manuales de "Agregar a inicio", igual que en miCartera)
- **Tailwind** puro (sin Bootstrap ni Angular Material, para control total de la paleta
  blanco/negro/dorado)
- **Firebase**: Auth (compat SDK, login vía REST) + Realtime Database. Sin backend propio.
- Proyecto de referencia para patrones de carpeta y de PWA:
  `E:\Golden Panda\8) Programacion\miCartera\miCartera`

## Árbol de datos (Realtime Database)

```
venues/
  {venueId}/
    info: { nombre, codigo, dueñoUid, creadoEn }
    usuarios/
      {uid}: { nombre, email, rol, estado }   // rol: administrador|jefe_mesero|mesero|null
                                                // estado: pendiente|activo
    eventos/
      {eventoId}/
        info: { nombre, fecha, horaInicio, horaFin, estado }
        participantes/
          {uid}: { activo: true }
        tareas/
          {tareaId}: { titulo, tipo, asignadoA, estado, creadoPor, creadoEn }
        inventario/
          {itemId}: { nombre, cantidad, falta, nota, cargadoPor, confirmadoPorAdmin }

codigos_negocio/
  {codigo}: { venueId }        // lookup rápido código -> negocio, solo para el onboarding
```

Notas de diseño:
- Todo vive bajo `venues/{venueId}` → aislamiento multi-tenant desde el día 1.
- `codigos_negocio` es un índice aparte (fuera del árbol del negocio) solo para poder resolver
  el código al registrarse, sin necesitar leer todo `venues/`.
- Las reglas de seguridad de RTDB deben validar, para cada operación, que
  `auth.uid` tenga un registro en `venues/{venueId}/usuarios/{uid}` con el rol adecuado —
  el código de negocio nunca es, por sí solo, un mecanismo de autorización.

## Fases

### Fase 0 — Scaffolding del proyecto
- `ng new protocol-eventz` (standalone, SSR habilitado, sin routing módulo clásico)
- Instalar y configurar Tailwind (paleta custom blanco/negro/dorado en `tailwind.config.js`)
- Instalar `@angular/service-worker`, generar `ngsw-config.json`, configurar `manifest.webmanifest`
  (íconos, `display: standalone`, `theme_color`/`background_color` acorde a la paleta)
- Configurar Firebase (proyecto nuevo en la consola, Realtime Database + Authentication
  habilitados, reglas en modo bloqueado por defecto)
- Estructura de carpetas base: `app/auth`, `app/page`, `app/shared/components`, `app/core/{guards,services,models}`

### Fase 1 — Autenticación y onboarding
- Registro con dos caminos: "Crear negocio" / "Ingresar como empleado"
- Alta de negocio + generación de código único (`codigos_negocio`)
- Pantalla de "solicitud pendiente" para el empleado recién registrado
- Login (reutilizar patrón REST de miCartera)
- Guards de ruta por rol (`administrador`, `jefe_mesero`, `mesero`, y guard de "estado: pendiente")

### Fase 2 — Panel de administrador: usuarios
- Listado de solicitudes pendientes → aprobar y asignar rol
- Listado de equipo con rol actual → editar/revocar rol en cualquier momento
- Regenerar código de negocio

### Fase 3 — Eventos
- CRUD de eventos (administrador y jefe_mesero)
- Activación por evento: el mesero ve el evento vigente y se marca disponible
  (`participantes/{uid}.activo`)
- Vista "Equipo" del jefe de meseros: quiénes están activos para el evento actual

### Fase 4 — Tareas y asignación
- CRUD de tareas por evento (jefe_mesero / administrador)
- Sección "Asignar": asignar tarea a mesero activo, ver pendientes/sin asignar, cálculo de
  % de carga por mesero
- Vista del mesero: checklist de tareas asignadas con check hecho/no-hecho
- Tipo de tarea "lavado" como caso particular dentro del mismo modelo de tareas

### Fase 5 — Inventario / desmontaje
- Al asignar la tarea de tipo "desmontaje", habilitar la pantalla de inventario de ese evento
- Formulario de carga: ítem, cantidad, falta/no falta, nota — visible solo para el asignado
- Vista del administrador: revisar y confirmar (check) el inventario cargado
- (Opcional, fase futura) exportar/consolidar lista de compra en base a lo marcado como faltante

### Fase 6 — Pulido de UI/UX
- Sistema de diseño Tailwind (tokens de color negro/blanco/dorado, tipografía, espaciado)
- Componentes compartidos (header, sidebar/bottom-nav mobile-first, modal, badge de estado)
- Responsive real en mobile primero, verificar en desktop como secundario
- Probar instalación PWA en Android real y en iPhone real (Safari)

### Fase 7 — Reglas de seguridad de Firebase
- Reglas de Realtime Database: acceso por `venueId` + rol, admin ⊇ jefe_mesero ⊇ mesero
- Inventario de un evento: lectura/escritura restringida al `uid` asignado a esa tarea +
  administrador
- Revisar que `codigos_negocio` solo permita lookup (lectura acotada), nunca escritura libre

### Fase 8 — Deploy
- Firebase Hosting (o alternativa) con SSR
- Verificación end-to-end del flujo completo: crear negocio → invitar empleado → asignar
  roles → crear evento → activarse → asignar tareas → completar → desmontaje/inventario

## Roadmap futuro (no se construye en esta primera etapa)

- Multi-tenant comercial: onboarding de negocios externos, planes/suscripción, facturación
- Notificaciones push (se dejó explícitamente afuera por ahora)
- Exportar reportes de inventario / historial en PDF
