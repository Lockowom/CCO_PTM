import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Wrench, ArrowLeftRight, Ticket, MailCheck } from 'lucide-react';
import { useAccionATicketPv, useAccionReferencia } from '../../services/calidadService';

// Tipos cuya ejecución vive en cada módulo.
const TIPOS_ST = new Set(['REPARACION', 'POST_VENTA']);                       // → Servicio Técnico
const TIPOS_BODEGA = new Set(['AJUSTE', 'BAJA', 'TRANSITORIO', 'REACONDICIONAR']); // → Inventario/Traspasos

/**
 * Chips + acciones que conectan una Acción de Calidad con su módulo ejecutor:
 *  - REPARACION/POST_VENTA → crear/ver ticket de Servicio Técnico (informe adjunto).
 *  - AJUSTE/BAJA/TRANSITORIO/REACONDICIONAR → ir a Traspasos y registrar la
 *    referencia del traspaso/correo generado (pasa la acción a EN_PROCESO).
 */
export default function AccionIntegracion({ accion: a, puedeActuar }) {
  const crearTicket = useAccionATicketPv();
  const registrarRef = useAccionReferencia();
  const abierta = a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO';

  const generarTicket = async () => {
    try {
      const t = await crearTicket.mutateAsync(a.id);
      toast.success(`Ticket ${t.numero} creado en Servicio Técnico (informe adjunto)`);
    } catch (e) { toast.error(e.message || 'Error al crear el ticket'); }
  };

  const registrarTraspaso = async () => {
    const ref = prompt('Referencia del traspaso/correo generado (ej: "Traspaso #77 · correo 09-07"):', a.referencia || '');
    if (ref === null || !ref.trim()) return;
    try {
      await registrarRef.mutateAsync({ accionId: a.id, referencia: ref.trim() });
      toast.success('Referencia registrada — acción en proceso');
    } catch (e) { toast.error(e.message || 'Error al registrar'); }
  };

  const esST = TIPOS_ST.has(a.tipo_accion);
  const esBodega = TIPOS_BODEGA.has(a.tipo_accion);
  if (!esST && !esBodega && !a.ticket_postventa && !a.referencia) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {/* Enlaces ya existentes */}
      {a.ticket_postventa && (
        <Link to="/postventa/tickets" title="Ver en Servicio Técnico"
          className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1 hover:bg-orange-100">
          <Ticket size={11} /> {a.ticket_postventa}
        </Link>
      )}
      {a.referencia && (
        <span title={a.referencia}
          className="text-[10px] font-black px-2 py-0.5 rounded-md border bg-sky-50 text-sky-700 border-sky-200 flex items-center gap-1 max-w-[180px] truncate">
          <MailCheck size={11} /> {a.referencia}
        </span>
      )}

      {/* Acciones disponibles */}
      {abierta && puedeActuar && esST && !a.ticket_postventa && (
        <button onClick={generarTicket} disabled={crearTicket.isPending}
          className="text-[10px] font-black px-2 py-1 rounded-md border bg-orange-600 text-white border-orange-600 flex items-center gap-1 hover:bg-orange-700 disabled:opacity-50">
          <Wrench size={11} /> Crear ticket Serv. Técnico
        </button>
      )}
      {abierta && esBodega && (
        <>
          <Link to="/inventory/traspasos"
            className="text-[10px] font-black px-2 py-1 rounded-md border bg-white text-indigo-700 border-indigo-200 flex items-center gap-1 hover:bg-indigo-50">
            <ArrowLeftRight size={11} /> Ir a Traspasos
          </Link>
          {puedeActuar && (
            <button onClick={registrarTraspaso} disabled={registrarRef.isPending}
              className="text-[10px] font-black px-2 py-1 rounded-md border bg-indigo-600 text-white border-indigo-600 flex items-center gap-1 hover:bg-indigo-700 disabled:opacity-50">
              <MailCheck size={11} /> {a.referencia ? 'Editar referencia' : 'Registrar traspaso/correo'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
