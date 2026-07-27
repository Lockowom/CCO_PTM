import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Boxes, Package } from 'lucide-react';
import { useBloque } from '../../services/conteoService';

const n = (v) => (Number(v) || 0).toLocaleString('es-CL');

// Página destino del QR de un bloque (/inventory/bloque/:codigo). Muestra el
// bloque y sus ítems para verificarlo desde el celular tras escanear.
export default function BloqueDetalle() {
  const { codigo } = useParams();
  const nav = useNavigate();
  const { data: b, isLoading } = useBloque(codigo);

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
          <button onClick={() => nav(-1)} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft size={20} />
          </button>
          <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-orange-600">
            <Boxes size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-mono font-black text-slate-900">{codigo}</div>
            <div className="text-xs text-slate-500">Detalle del bloque</div>
          </div>
        </div>

        {isLoading && <div className="text-slate-400 text-sm">Cargando…</div>}
        {!isLoading && !b && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500">
            Bloque no encontrado.
          </div>
        )}
        {b && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <b>Bodega:</b> {b.bodega}
                {b.nombre ? ` · ${b.nombre}` : ''}
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${b.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}
              >
                {b.estado}
              </span>
            </div>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
                  <tr>
                    <th className="text-left px-3 py-2">SKU</th>
                    <th className="text-left px-3 py-2">Descripción</th>
                    <th className="text-left px-3 py-2">Partida</th>
                    <th className="text-right px-3 py-2">Cant.</th>
                  </tr>
                </thead>
                <tbody>
                  {(b.items || []).map((it) => (
                    <tr key={it.id} className="border-t border-slate-50">
                      <td className="px-3 py-2 font-mono text-xs">{it.codigo_producto}</td>
                      <td className="px-3 py-2 text-xs text-slate-600 max-w-[10rem] truncate">
                        {it.descripcion || '—'}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">{it.partida || '—'}</td>
                      <td className="px-3 py-2 text-right font-bold">{n(it.cantidad)}</td>
                    </tr>
                  ))}
                  {(b.items || []).length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-5 text-center text-slate-400 text-xs flex items-center justify-center gap-2"
                      >
                        <Package size={14} /> Bloque sin ítems.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
