// Notas de versión ("patch notes") que se muestran al usuario tras actualizar.
// Estilo notas del parche de un juego: se listan los cambios en lenguaje de
// usuario (NO técnico). Orden: la más nueva primero. La versión vive en
// package.json; aquí solo se describen los cambios visibles.
//
// Al agregar una versión nueva, añade una entrada ARRIBA con:
//   { version, fecha, titulo, emoji, cambios: [ 'texto amigable', ... ] }
// `tipo` opcional por cambio: 'nuevo' | 'mejora' | 'fix' (pinta un chip).

export const RELEASE_NOTES = [
  {
    version: '1.36.0',
    fecha: '2026-07-15',
    titulo: 'Panel PTM nativo (estructura)',
    emoji: '🧩',
    cambios: [
      { tipo: 'nuevo', texto: 'El Panel PTM ahora vive dentro de CCO con sus pantallas propias: Dashboard, Ingresar, Info, TV, Builder, Auditoría y Configuración.' },
      { tipo: 'mejora', texto: 'El Dashboard ya muestra la estructura con datos de ejemplo (aún no datos reales) para irla puliendo al detalle.' },
    ],
  },
  {
    version: '1.35.0',
    fecha: '2026-07-15',
    titulo: 'Panel PTM integrado',
    emoji: '📊',
    cambios: [
      { tipo: 'nuevo', texto: 'El Panel PTM (dashboard de indicadores) ahora está dentro de CCO, en Inteligencia → Panel PTM.' },
    ],
  },
  {
    version: '1.34.1',
    fecha: '2026-07-15',
    titulo: 'Novedades de cada versión',
    emoji: '🎉',
    cambios: [
      { tipo: 'nuevo', texto: 'Ahora, cuando la app se actualiza, ves esta pantalla con los cambios de la nueva versión.' },
      { tipo: 'mejora', texto: 'Puedes volver a ver las novedades cuando quieras: toca la versión al final del menú.' },
    ],
  },
  {
    version: '1.34.0',
    fecha: '2026-07-15',
    titulo: 'Carteles y Servicio Técnico',
    emoji: '🏷️',
    cambios: [
      { tipo: 'nuevo', texto: 'Servicio Técnico: formulario público para que clientes o vendedores creen su solicitud sin necesidad de cuenta.' },
      { tipo: 'mejora', texto: 'Carteles de Bodega: el código sale en una sola línea y el código de barras se lee mejor.' },
      { tipo: 'fix', texto: 'Carteles Doble y Cuádruple: el logo ya no se corta y el barcode queda proporcionado.' },
      { tipo: 'nuevo', texto: 'El ticket de servicio permite escribir el modelo del equipo a mano si no conoces la familia.' },
    ],
  },
  {
    version: '1.33.0',
    fecha: '2026-07-14',
    titulo: 'Post-Venta y Lotes',
    emoji: '🩺',
    cambios: [
      { tipo: 'nuevo', texto: 'Flujo de tickets con "Siguiente" y "Dar por terminado", con historial completo de cambios.' },
      { tipo: 'mejora', texto: 'Lotes y Series: cada lote muestra su código y el estado "En Tránsito" (antes se veía como "Sin Stock").' },
      { tipo: 'fix', texto: 'Recepción ↔ Calidad: las recepciones que quedaban "Pendiente" sin tarea ahora se conectan bien.' },
      { tipo: 'fix', texto: 'Carga Masiva: se corrigió el error al cargar Matriz de Códigos con filas incompletas.' },
    ],
  },
  {
    version: '1.32.0',
    fecha: '2026-07-12',
    titulo: 'Cámara y Vencimientos',
    emoji: '📷',
    cambios: [
      { tipo: 'nuevo', texto: 'Cámara a pantalla completa para las fotos de los checklist de Calidad (Ingreso y Salida).' },
      { tipo: 'nuevo', texto: 'Recepción: campo Fecha de Vencimiento por ítem (Importaciones y Nacionales).' },
      { tipo: 'mejora', texto: 'Roles y usuarios: control de permisos por pantalla y por pestaña.' },
    ],
  },
  {
    version: '1.30.0',
    fecha: '2026-07-10',
    titulo: 'Diseño y Despliegue',
    emoji: '✨',
    cambios: [
      { tipo: 'mejora', texto: 'Login renovado, más claro y moderno, con el logo PTM.' },
      { tipo: 'nuevo', texto: 'Panel para promover versiones a producción desde la propia app (Admin → Monitor).' },
      { tipo: 'nuevo', texto: 'La versión de la app ahora se ve dentro de la aplicación.' },
    ],
  },
];
