import { useEffect, useState, useCallback } from "react";
import {
  fetchTransportistas, saveTransportista, toggleTransportista, deleteTransportista,
  fetchVendedores, saveVendedor, toggleVendedor, deleteVendedor,
  fetchAuditoria, fetchAuditStatsPanel,
} from "./configService";
import { useAuth } from "../../../context/AuthContext";
import CatalogoMaestro from "./CatalogoMaestro";

const ACCENT = "#ea580c"; // naranja PTM

// Refleja la lista activa de transportistas en la hoja TRANSPORTES del Sheet
// (espejo). Best-effort: si el GAS aún no tiene `syncTransportistas` desplegado,
// falla en silencio y el mantenedor sigue funcionando 100% contra Supabase.
async function espejarTransportistas(activos) {
  try {
    await fetch("/api/gas-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "syncTransportistas", data: { transportistas: activos } }),
    });
  } catch { /* el Sheet se actualizará en el próximo espejo; no bloquea */ }
}

export default function PanelConfigReal() {
  const { hasPermission } = useAuth();
  const [tab, setTab] = useState("transportistas");

  const editable = hasPermission("manage_panel");

  const espejarTransp = useCallback((items) => {
    espejarTransportistas(items.filter((t) => t.activo).map((t) => t.nombre));
  }, []);

  if (!hasPermission("manage_panel")) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm max-w-sm w-full p-6 text-center">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white text-[15px] font-bold mb-3" style={{ background: ACCENT }}>P</span>
          <h1 className="text-[15px] font-semibold">Acceso solo para administradores</h1>
          <p className="text-[12px] text-gray-400 mt-1">Esta sección requiere el permiso <b>manage_panel</b>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white text-[13px] font-bold" style={{ background: ACCENT }}>P</span>
            <div className="leading-tight">
              <h1 className="text-[15px] font-semibold">Configuración</h1>
              <p className="text-[11px] text-gray-400 -mt-0.5">Mantenedor de catálogos · v1.1</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Sub-nav (Estados vetado: máquina de estados acoplada a KPIs) */}
        <nav className="flex items-center gap-1 mb-5 text-[13px]">
          <TabBtn active={tab === "transportistas"} onClick={() => setTab("transportistas")}>Transportistas</TabBtn>
          <TabBtn active={tab === "vendedores"} onClick={() => setTab("vendedores")}>Vendedores</TabBtn>
          <TabBtn active={tab === "auditoria"} onClick={() => setTab("auditoria")}>Auditoría</TabBtn>
          <span className="px-3 py-1.5 rounded-md text-gray-300 cursor-not-allowed" title="Acoplado a KPIs — no editable">Estados</span>
          <span className="px-3 py-1.5 rounded-md text-gray-300 cursor-not-allowed" title="Próximamente">Usuarios</span>
        </nav>

        {tab === "transportistas" && (
          <CatalogoMaestro
            key="transportistas"
            noun="transportista"
            nounNuevo="transportista"
            editable={editable}
            fetchAll={fetchTransportistas}
            save={saveTransportista}
            toggle={toggleTransportista}
            remove={deleteTransportista}
            onAfterWrite={espejarTransp}
          />
        )}
        {tab === "vendedores" && (
          <CatalogoMaestro
            key="vendedores"
            noun="vendedor"
            nounNuevo="vendedor"
            editable={editable}
            fetchAll={fetchVendedores}
            save={saveVendedor}
            toggle={toggleVendedor}
            remove={deleteVendedor}
            extraFields={[
              { key: "centro_costo", label: "C. Costo", placeholder: "Ej: 1-06" },
              { key: "division", label: "División", placeholder: "Ej: DIV. INSTITUCIONAL" },
            ]}
          />
        )}
        {tab === "auditoria" && <Auditoria />}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${active ? "text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
      style={active ? { background: ACCENT } : undefined}
    >
      {children}
    </button>
  );
}

const ACCION_META = {
  create: { label: "Creó", cls: "bg-emerald-100 text-emerald-700" },
  update: { label: "Editó", cls: "bg-blue-100 text-blue-700" },
  estado: { label: "Cambió estado", cls: "bg-amber-100 text-amber-700" },
  delete: { label: "Eliminó", cls: "bg-rose-100 text-rose-700" },
};
const ACCION_FILTROS = [
  ["", "Todas"], ["create", "Creación"], ["update", "Edición"],
  ["estado", "Estado"], ["delete", "Eliminación"],
];

function Auditoria() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [accion, setAccion] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    const [r, s] = await Promise.all([fetchAuditoria({ accion }), fetchAuditStatsPanel()]);
    setRows(r);
    setStats(s);
    setLoading(false);
  }, [accion]);

  useEffect(() => { let alive = true; (async () => { if (alive) await cargar(); })(); return () => { alive = false; }; }, [cargar]);

  const fmt = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    if (isNaN(d)) return String(ts);
    return d.toLocaleString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const ql = q.trim().toLowerCase();
  const filtradas = ql
    ? rows.filter((r) => [r.actor, r.nv, r.accion].some((v) => String(v || "").toLowerCase().includes(ql)))
    : rows;

  return (
    <>
      {/* Resumen por operador */}
      {stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {stats.map((s) => (
            <span key={s.nombre} className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 bg-white border border-gray-200 rounded-full px-2.5 py-1">
              <span className="font-medium text-gray-900">{s.nombre}</span>
              <span className="text-gray-400">{s.total} mov · {s.creates}C · {s.updates}U · {s.estados}E · {s.deletes}D</span>
            </span>
          ))}
        </div>
      )}

      {/* Controles: filtro por acción + búsqueda + refrescar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {ACCION_FILTROS.map(([val, lbl]) => (
            <button key={val || "all"} onClick={() => setAccion(val)}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${accion === val ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              style={accion === val ? { color: ACCENT } : undefined}>
              {lbl}
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar operador o N.V.…"
          className="flex-1 min-w-[160px] max-w-xs px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] outline-none focus:border-orange-400" />
        <button onClick={cargar} className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50">
          Actualizar
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-[13px]">Cargando…</div>
        ) : filtradas.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[13px] font-medium text-gray-600">Aún no hay movimientos registrados</p>
            <p className="text-[12px] text-gray-400 mt-1 max-w-sm mx-auto">
              La bitácora se llena automáticamente cada vez que se crea, edita, cambia de estado o elimina una N.V. desde el Panel (Ingresar).
            </p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Fecha</th>
                <th className="px-4 py-2.5 font-medium">Operador</th>
                <th className="px-4 py-2.5 font-medium">Acción</th>
                <th className="px-4 py-2.5 font-medium">N.V.</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((r) => {
                const meta = ACCION_META[r.accion] || { label: r.accion || "—", cls: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{fmt(r.ts)}</td>
                    <td className="px-4 py-2.5 font-medium">{r.actor || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono">{r.nv || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {!loading && filtradas.length > 0 && (
        <p className="text-[11px] text-gray-400 mt-2">{filtradas.length} movimiento{filtradas.length !== 1 ? "s" : ""} · últimos 150</p>
      )}
    </>
  );
}
