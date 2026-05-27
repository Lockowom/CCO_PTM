import { supabase } from '../supabase';

/**
 * Registra una operación de carga/actualización masiva en el historial de auditoría.
 *
 * @param {Object} params
 * @param {string} params.modulo - Nombre del módulo (ej: 'Recepción', 'Cubicaje', 'Picking')
 * @param {string} params.tablaDestino - Tabla donde se insertaron los datos (ej: 'wms_ubicaciones')
 * @param {number} params.totalRegistros - Total de registros procesados
 * @param {number} [params.nuevos=0] - Registros nuevos insertados
 * @param {number} [params.actualizados=0] - Registros actualizados
 * @param {number} [params.errores=0] - Registros con error
 * @param {string} [params.usuarioId] - ID del usuario (se obtiene de la sesión auth si no se pasa)
 * @param {string} [params.usuarioNombre] - Nombre del usuario
 */
export async function logUpload({
  modulo,
  tablaDestino,
  totalRegistros,
  nuevos = 0,
  actualizados = 0,
  errores = 0,
  usuarioId,
  usuarioNombre,
}) {
  try {
    // Si no se pasan datos de usuario, obtenerlos de la sesión Supabase Auth
    if (!usuarioId || !usuarioNombre) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Buscar datos del perfil en tms_usuarios
        const { data: profile } = await supabase
          .from('tms_usuarios')
          .select('id, nombre')
          .ilike('email', session.user.email)
          .single();

        usuarioId = usuarioId || profile?.id || 'system';
        usuarioNombre = usuarioNombre || profile?.nombre || 'Sistema';
      } else {
        usuarioId = usuarioId || 'system';
        usuarioNombre = usuarioNombre || 'Sistema';
      }
    }

    await supabase.from('tms_historial_cargas').insert([{
      usuario_id: usuarioId,
      usuario_nombre: usuarioNombre,
      modulo,
      tabla_destino: tablaDestino,
      registros_totales: totalRegistros,
      registros_nuevos: nuevos,
      registros_actualizados: actualizados,
      registros_error: errores,
      fecha_carga: new Date().toISOString(),
    }]);
  } catch (err) {
    console.error('Error logging upload:', err);
  }
}
