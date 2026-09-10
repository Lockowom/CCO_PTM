# R5-B1 — Publicación controlada: precheck
Fecha: 2026-09-09.
Resultado: BLOCKED. No publicado; no habilita R5-B2.

Estado vigente (2026-09-10): READY_FOR_R5B1_PUBLICATION, exclusivamente local.
Ver sección R5-B1B al final. Los bloqueos anteriores se conservan como historial.

## Motivo de detención
El conector de Render respondió «no workspace selected» y exige confirmación
del usuario antes de consultar servicios. La lista disponible contiene únicamente
«My Workspace» (tea-d64hqda4d50c73efrtm0). No se seleccionó automáticamente.
No se verificó todavía el servicio, su rama, commit vivo ni configuración de autodeploy.

## Código y alcance
- Commit publicado: ninguno.
- HEAD local: 97606aaa, rama backup/recepcion-devoluciones-wip.
- origin/main consultado mediante fetch: c67a43a0e9e239a5ebc527382fd2da04120c3382.
- Archivos funcionales candidatos: src/pages/Quality/RecepcionDevoluciones.jsx,
  src/services/devolucionesService.js y src/tests/recepcionDevoluciones.test.jsx.
- Diff de estos tres archivos contra HEAD: 669 inserciones, 414 eliminaciones.
- Archivos incluidos en una publicación: ninguno.

El árbol contiene cambios previos ajenos en Navbar, archivos generados y dist,
además de documentación y migraciones previamente staged. Se conservaron intactos.
No se ejecutó git add, commit, push ni el script deploy.js (usa git add .).

La pantalla y servicio no están aún en origin/main. La rama local también añade
integraciones en App, modules, permissions, routeMeta y screenRegistry.
Antes de publicar debe prepararse una base aislada y comprobar las dependencias
mínimas de ruta, sin incorporar cambios IAM/navegación/globales prohibidos.
No se debe publicar la rama completa ni los artefactos del checkout mezclado.

## Validaciones locales renovadas
| Verificación | Resultado |
| --- | --- |
| git status --short y git diff --stat | Ejecutados; cambios ajenos identificados |
| Vitest: recepcionDevoluciones, routePermissionMatrix, rpcSurfaceContract | 21/21 PASS |
| ESLint de los tres archivos candidatos | PASS |
| tsc --noEmit | PASS |
| Vite build --outDir work/r5b1-publication-build-20260909 --logLevel warn | PASS, exit 0 |
| git diff --check de los tres archivos candidatos | PASS |

No se ejecutó npm prebuild ni se compiló sobre dist. La compilación es una
verificación local, no el artefacto certificado de un candidato aislado.
Advertencias: esbuild/oxc en pruebas y chunks superiores a 1000 kB en build.
No se cambiaron herramientas ni dependencias.

## Postchecks y base de datos
Publicación y postchecks de aplicación desplegada: NO EJECUTADOS.
No se ejecutó SQL ni se invocaron RPC remotas.
El baseline comunicado anteriormente es devoluciones=0, items=0, regla 7 activa
y tres miembros. No se presenta como una lectura renovada de hoy.
Conteos antes/después, firmas remotas y ausencia causal de eventos/notificaciones
de publicación: pendientes de verificación cuando pueda realizarse el despliegue.
No se utilizaron contadores globales como gate.

## Gates de esta intervención
| Gate | Valor |
| --- | --- |
| PUBLICATION_SUCCESS | 0 |
| DEVOLUTION_DATA_CREATED / DEVOLUTION_ITEM_DATA_CREATED por esta intervención | 0 / 0 |
| RULE_7_CHANGE / PILOT_MEMBER_CHANGE por esta intervención | 0 / 0 |
| RPC_CHANGE / IAM_CHANGE / STOCK_SIDE_EFFECT por esta intervención | 0 / 0 / 0 |
| NOTIFICATIONBELL_GLOBAL_CHANGE / CCO2_CHANGE por esta intervención | 0 / 0 |
| SQL ejecutado / migraciones aplicadas | 0 / 0 |
| Caso sintético / CONFORME / NO_CONFORME / Postventa ejecutados | 0 / 0 / 0 / 0 |

Los ceros expresan acciones no realizadas, no una certificación de ausencia
de actividad concurrente en producción.

## Continuidad
Confirmar el workspace de Render, verificar servicio/commit/autodeploy y preparar
el paquete mínimo aislado. Renovar las verificaciones sobre ese candidato antes
de publicar. Después realizar los postchecks técnicos y de datos exigidos.
R5-B2 permanece sin ejecutar.

## Continuación — workspace confirmado y bloqueo de destinos compartidos

El usuario confirmó My Workspace y el servicio CCO_PTM. El bloqueo de selección
de workspace queda resuelto. Resultado actual: BLOCKED por Auto Deploy compartido.

Lectura directa de Render confirmó:
- Workspace: tea-d64hqda4d50c73efrtm0.
- Servicio: CCO_PTM, srv-d65o72esb7us73cifq1g.
- URL: https://cco-ptm-b05m.onrender.com.
- Repo: https://github.com/Lockowom/CCO_PTM; branch: main.
- Auto Deploy: yes; trigger: commit.
- Build command: npm run build; publish path: dist.
- Último deploy: dep-da8d8b710e5c73bp8p2g, LIVE desde 2026-08-28.
- Commit de ese deploy: c67a43a0e9e239a5ebc527382fd2da04120c3382.
Este LIVE corresponde a la versión previa, NO a R5-B1.

También se consultaron individualmente los servicios expresamente excluidos:
| Servicio | ID | Repo/branch | Auto Deploy |
| --- | --- | --- | --- |
| cco-ptm-internal-beta-web | srv-da3qj5740ujc73c56ia0 | Lockowom/CCO_PTM / main | yes, commit |
| cco-ptm-internal-beta | srv-da3qfqbncjis73a9pgf0 | Lockowom/CCO_PTM / main | yes, commit |

Inferencia operativa: un push a main activaría los tres despliegues, en conflicto
con el destino exclusivo autorizado. No se ejecutó push ni deploy manual.
No se desactivó Auto Deploy ni se modificó otro ajuste de Render.

Se requiere una decisión del usuario sobre aislar los dos servicios beta antes
del push. No se asume autorización para modificar destinos excluidos.
Las validaciones locales PASS descritas arriba pertenecen al precheck anterior;
no se repitieron en esta continuación ni se certificó un candidato aislado.
PUBLICATION_SUCCESS=0. Postchecks productivos de R5-B1 pendientes.
SQL, migraciones, RPC de escritura, datos sintéticos y cambios remotos: 0.

## R5-B1A — aislamiento autorizado, pendiente de sesión Render

Se recibió autorización específica para Auto Deploy YES → NO exclusivamente
en ambos beta; producción debe continuar YES. No se requiere nueva aprobación
de ese cambio, pero falta acceso operativo para ejecutarlo.

Prechecks renovados por get_service individual:
| Servicio | Repo | Branch | Auto Deploy |
| --- | --- | --- | --- |
| cco-ptm-internal-beta-web | Lockowom/CCO_PTM | main | YES, commit |
| cco-ptm-internal-beta | Lockowom/CCO_PTM | main | YES, commit |
| CCO_PTM | Lockowom/CCO_PTM | main | YES, commit |

Producción conserva https://cco-ptm-b05m.onrender.com.
El catálogo efectivo del conector no expone update_service ni un método para
Auto Deploy. Su operación update_environment_variables no es aplicable ni se usó.
El panel del beta web se abrió y redirigió a Sign In to Render.
No hay sesión de Render autenticada en el navegador disponible.
La comprobación local tampoco encontró comando render ni RENDER_API_KEY
en el entorno; no se buscaron credenciales en archivos.

Resultado: BLOCKED por acceso a la operación autorizada.
BETA_WEB_AUTO_DEPLOY=ON; BETA_STATIC_AUTO_DEPLOY=ON; PRODUCTION_AUTO_DEPLOY=ON.
No se efectuaron cambios de configuración, commit, push, deploy manual, SQL,
migraciones, RPC ni creación de datos.
No se realizaron postchecks de una versión nueva porque no fue publicada.
El usuario debe iniciar sesión en la pestaña Render abierta; después se repetirán
los prechecks, se desactivarán solo ambos beta y se continuará R5-B1.
No reactivar beta ni ejecutar R5-B2.

## R5-B1A completado — aislamiento verificado

Fecha de ejecución: 2026-09-09. Sesión legítima del usuario en Render.
Se utilizó únicamente Edit → Auto-Deploy → Off → Save changes en los dos
servicios beta autorizados. No se abrió ni modificó Environment.

| Servicio | Antes | Después confirmado por API |
| --- | --- | --- |
| cco-ptm-internal-beta-web | YES / commit | NO / off |
| cco-ptm-internal-beta | YES / commit | NO / off |
| CCO_PTM | YES / commit | YES / commit |

Actualización beta web: 2026-09-09T17:10:41.613582Z.
Actualización beta static: 2026-09-09T17:11:36.653328Z.
La configuración devuelta conserva repo, branch, build/start, URL, plan y demás
campos de servicio consultados. Producción conserva incluso updatedAt previo.
Las variables de entorno no se consultaron ni modificaron.

Se confirmó que el último deploy de cada servicio sigue siendo el previo:
- Beta web: dep-da8d8av10e5c73bp8oag.
- Beta static: dep-da8d8av10e5c73bp8on0.
- Producción: dep-da8d8b710e5c73bp8p2g.
Todos refieren a c67a43a0e9e239a5ebc527382fd2da04120c3382, LIVE previo.
No se generó un deploy por esta intervención.
Ambos beta se mantienen OFF; reactivación no autorizada.

## Bloqueo vigente de R5-B1 — integración no incluida en lo certificado

La revisión posterior del código detectó un conflicto con el postcheck nuevo
«Devoluciones está bajo Inbound»:
- App.jsx registra únicamente quality/devoluciones.
- config/modules.js ubica esa ruta en quality, no inbound.
- constants/routeMeta.js la incluye en HIDDEN_FROM_NAV.
- screenRegistry.js la registra como quality.devoluciones y navigation=false.
- El cambio local previo de Navbar también la ubica en Calidad, no Inbound.
- main aún no contiene el módulo ni su ruta; copiar solamente página, servicio
  y pruebas no permite publicar una pantalla accesible.

Las integraciones de la rama local afectan también catálogos de permisos y
screenRegistry, consumido por resolverV2, legacyExpansionMap y profilesV2.
No se traslada ese conjunto sin revisión bajo el gate IAM_CHANGE=0.
No se implementó una integración diferente a la certificada durante esta fase.

Decisión: detener publicación; solicitar alcance local acotado para integrar
Devoluciones bajo Inbound y recertificar el candidato mínimo sobre main,
preservando roles, grants, resolutores IAM, flags y componentes globales.
No basta con afirmar que los 21 tests anteriores certifican una integración
que no contienen. Sus PASS anteriores se conservan como evidencia histórica.

Estado final actual: BLOCKED.
BETA_WEB_AUTO_DEPLOY=OFF; BETA_STATIC_AUTO_DEPLOY=OFF; PRODUCTION_AUTO_DEPLOY=ON.
PUBLICATION_SUCCESS=0; commit publicado=ninguno; SQL_EXECUTED=0.
Datos sintéticos, RPC remotas de escritura, stock, reglas y pilotos modificados=0.
No se certifican postchecks de una publicación inexistente.
git status --short y git diff --stat consultados sin mostrar diff completo.
Los archivos funcionales permanecen sin nuevas modificaciones en esta ejecución.

## R5-B1B — INBOUND INTEGRATION RECERTIFICATION

Fecha: 2026-09-10.
Resultado vigente: READY_FOR_R5B1_PUBLICATION.
Certificación exclusivamente local; no autoriza ni acredita publicación.

### Integración funcional antes / después

| Responsabilidad | Antes | Después |
| --- | --- | --- |
| Recepción, registro, consulta e historial | Página bajo Calidad; oculta en Sidebar | Inbound → Devoluciones |
| Inspección y dictamen por ítem | Misma pantalla mezclada con recepción | Calidad → Pendientes de Devoluciones |
| URL heredada | /quality/devoluciones | Redirect con replace hacia /inbound/devoluciones |

Rutas:
- /inbound/devoluciones: recepción/listado/historial, Nueva recepción según manage_devoluciones.
- /quality/devoluciones/pendientes: solamente bandeja y dictamen según inspect_devoluciones.
- /quality/devoluciones: compatibilidad hacia la entrada canónica Inbound.

Una sola página fuente: src/pages/Quality/RecepcionDevoluciones.jsx.
Su ubicación física se conserva para no romper imports; no define el módulo padre.
Dos subcomponentes internos separan la presentación. Calidad no monta la consulta
de cabeceras ni el formulario; Inbound no monta la bandeja ni el modal de dictamen.
Los enlaces entre vistas permiten a quienes tienen ambas capacidades recorrer
el mismo flujo sin duplicar estado de negocio, servicios ni hooks.

### Archivos modificados en R5-B1B

| Archivo | Cambio acotado |
| --- | --- |
| src/config/devolucionesRouting.js (nuevo) | Rutas funcionales, metadatos mínimos y adaptación a la ruta de acceso certificada |
| src/App.jsx | Dos entradas a la misma página; redirect heredado; consulta del guard mediante la ruta certificada |
| src/constants/routeMeta.js | Entradas visibles bajo Inbound y Calidad; antiguo enlace permanece oculto |
| src/components/Navbar.jsx | Las mismas entradas para navegación legacy/móvil; reutiliza la misma adaptación del guard |
| src/pages/Quality/RecepcionDevoluciones.jsx | Separación recepción/pendientes dentro de la página existente |
| src/tests/recepcionDevoluciones.test.jsx | Flujo entre vistas y NAV_01–NAV_07 |

No se modificaron Sidebar, Topbar, Dashboard, NotificationBell, flags, resolutores
IAM, roles ni catálogos de permisos. Navbar ya tenía un cambio previo para la
entrada antigua; se adaptó solamente esa integración, preservando lo demás.

### Guards reutilizados sin modificar permisos

Las dos nuevas URLs consultan canAccessRoute('/quality/devoluciones'), incluyendo
la decisión IAM que ya utilizaba esa ruta. El mismo adapter se usa en el guard
de App y en navegación. No se reemplaza IAM por una comprobación de rol o permiso.
Solo reconoce las dos rutas exactas (normalizadas en mayúsculas/slash final);
no abre prefijos ni otras URLs.

Se conserva la identidad IAM quality.devoluciones exclusivamente como clave
interna de compatibilidad, no como módulo padre visual. Esto preserva overrides
ALLOW/DENY existentes sin cambiar screenRegistry ni reconstruir IAM.
Los botones conservan manage_devoluciones / inspect_devoluciones y el bypass
admin/delegado preexistente. El acceso de ruta conserva la misma unión de
capacidades certificadas; un usuario sin inspect puede entrar a la ruta pero
no consulta pendientes ni puede dictaminar, igual que el gate interno previo.

Las entradas nuevas no se ofrecen en consumidores de navegación sin callback
de autorización. La navegación autenticada de producción usa Sidebar con
canAccessRoute y Navbar para móvil. No se habilitó búsqueda global nueva ni
se alteró la Topbar. APP_ROUTES y el catálogo de permisos mantienen sus
identificadores legacy; routeMeta aporta únicamente los accesos de presentación.

### Recertificación

| Verificación | Resultado |
| --- | --- |
| Suite Devoluciones | 21 PASS (14 anteriores + 7 NAV) |
| Matriz de rutas + superficie RPC | 7 PASS |
| Runtime IAM adicional | 5 PASS |
| AppShell, Sidebar V2, MobileShell, contratos IAM | 34 PASS |
| Total de pruebas ejecutadas en las pasadas finales | 67 PASS |
| ESLint de los seis archivos modificados | PASS: 0 errores; 3 warnings preexistentes en App.jsx |
| tsc --noEmit | PASS, exit 0 |
| Vite build | PASS, exit 0 |
| git diff --check de archivos modificados | PASS |

La suite principal se ejecutó con transporte Supabase simulado. Los contratos de
shell adicionales necesitaron variables de entorno exclusivamente del proceso
de pruebas: URL local http://127.0.0.1:9 y un valor ficticio no secreto.
No se usaron credenciales ni endpoints de producción. La primera ejecución
adicional falló por falta de esa configuración; tras proveerla pasó 34/34.
NAV_05 inicialmente usaba import.meta.url transformado por Vitest como URL
no-file; se corrigió la lectura del archivo local y la pasada final pasó.

Build: work/r5b1b-inbound-build-20260910. No se ejecutó npm prebuild ni se
escribió sobre dist. Warning de tamaño de chunks >1000 kB, sin ajustar código
global. Warnings de esbuild/oxc del entorno de pruebas, sin modificar dependencias.
Los tres warnings de hooks de App.jsx corresponden a efectos presentes en HEAD.

### NAV y FLOW

| Gate | Evidencia local |
| --- | --- |
| NAV_01 | Metadatos reales agrupan Devoluciones bajo Inbound; se oculta sin permiso |
| NAV_02 | Calidad no contiene recepción; redirect antiguo renderiza Inbound |
| NAV_03 | Calidad muestra pendientes, sin Nueva recepción ni consulta de cabeceras |
| NAV_04 | Click en SidebarNavItem real abre Recepción de Devoluciones |
| NAV_05 | Un import de página, dos entradas a esa fuente, un servicio y ninguna RPC duplicada |
| NAV_06 | URLs directas usan la misma clave de guard; prefijos desconocidos no se adaptan |
| NAV_07 | Paridad en 8 combinaciones de permisos, SHADOW/ENFORCE y ALLOW/DENY/sin override |
| FLOW_01 | Hook real de registro conserva requiere_calidad true/false/omitido en p_payload simulado |
| FLOW_02 | Hook real invoca listar_devoluciones_pendientes_calidad(p_limit=100) |
| FLOW_03 | Hook real conserva dictaminar_item_devolucion(p_item_id,p_dictamen=CONFORME,p_detalle) |

El servicio certificado conserva su hash SHA-256 antes/después. También lo
conservan constants/permissions.js, config/modules.js, AuthContext.jsx y todos
los archivos de domain/access. No se modificó el contrato de RPC ni su filtro
remoto de pendientes. Las pruebas locales no se presentan como persistencia
real ni como validación productiva de RLS; esa prueba sigue siendo R5-B2.

### Gates de esta fase

PUSH=0; DEPLOY=0; SQL=0; RENDER_CHANGE=0.
IAM_CHANGE=0; PERMISSION_CHANGE=0; PRIVILEGE_GAIN=0; ACCESS_LOSS=0
respecto del comportamiento certificado en la matriz local.
RPC_CHANGE=0; REGISTRAR_DEVOLUCION_CONTRACT_CHANGE=0; QUALITY_RPC_CONTRACT_CHANGE=0.
STOCK_SIDE_EFFECT=0; POSTVENTA_CHANGE=0; NOTIFICATION_CHANGE=0; RULE_7_CHANGE=0.
DUPLICATE_PAGE=0; DUPLICATE_SERVICE=0; DUPLICATE_RPC=0.
Datos de prueba creados en CCO=0. Fixtures de test existen solamente en memoria.

Render no se consultó ni modificó durante R5-B1B. El último estado confirmado
en R5-B1A fue beta web OFF, beta static OFF, producción ON.
No se reactivaron beta. No se crearon commits ni se alteró el índice Git.
Se consultaron git status --short y git diff --stat; no se mostró diff completo.

### Handoff

READY_FOR_R5B1_PUBLICATION significa integración local recertificada, no
producción certificada ni autorización de push. El checkout conserva cambios
previos ajenos y migraciones staged; no publicar todo su contenido ni usar
git add -A. En la fase de publicación autorizada deberá prepararse un candidato
acotado sobre main que incluya los prerrequisitos frontend certificados ya
existentes en esta rama, excluya SQL/migraciones/cambios ajenos y se verifique
antes del push. R5-B2 permanece sin ejecutar.

## R5-B1 — Candidato aislado para publicación (2026-09-10)

Autorización vigente: publicar exclusivamente R5-B1 a main; detenerse después
del postcheck. R5-B2, SQL y cambios de configuración Render siguen prohibidos.

Base del candidato: origin/main c67a43a0e9e239a5ebc527382fd2da04120c3382.
Se preparó un worktree aislado; el checkout histórico mezclado no se publica.

### Manifest de publicación

- src/App.jsx
- src/components/Navbar.jsx
- src/constants/routeMeta.js
- src/config/devolucionesRouting.js
- src/config/modules.js
- src/constants/permissions.js
- src/domain/access/screenRegistry.js
- src/pages/Quality/RecepcionDevoluciones.jsx
- src/services/devolucionesService.js
- src/tests/recepcionDevoluciones.test.jsx
- docs/db/DEVOLUCIONES_R5B1_PUBLICATION_2026-09-09.md

modules.js, permissions.js y screenRegistry.js incluyen las declaraciones
frontend prerrequisito ya certificadas en R5-B1B, ausentes de main. No se
introducen decisiones nuevas de permisos ni se modifica IAM remoto, grants,
roles, resolvers de autorización o RPC. No se incluyen migraciones, SQL,
dist, archivos generados, workflows, package.json ni package-lock.json.
La versión permanece igual a main: el workflow OTA existente no habilita
su publicación a Supabase cuando no cambia la versión.

### Validación del candidato antes del commit

- 8 suites seleccionadas: 67 pruebas PASS (incluye NAV/FLOW y guards).
- ESLint sobre los 10 archivos frontend/pruebas: 0 errores, 3 warnings
  preexistentes de hooks en App.jsx; NEW_ESLINT_WARNING=0.
- tsc --noEmit: PASS.
- vite build --outDir work/publication-build --logLevel warn: PASS;
  advertencia de tamaño de chunks preexistente. No se escribió en dist.
- Tests con endpoint local no operativo y clave ficticia; no conectan a producción.

### Precheck Render

Workspace My Workspace. Producción CCO_PTM, srv-d65o72esb7us73cifq1g,
repo Lockowom/CCO_PTM, branch main, URL cco-ptm-b05m.onrender.com,
Auto Deploy ON. Beta web srv-da3qj5740ujc73c56ia0 y beta static
srv-da3qfqbncjis73a9pgf0: Auto Deploy OFF/OFF; mismo repo y branch.
No se modificó configuración Render. Se espera únicamente deploy automático.

El SHA definitivo, resultado Render y postchecks se anexarán localmente
después del push para evitar un segundo deploy exclusivamente documental.
Esta sección no afirma todavía publicación ni validación productiva exitosa.
