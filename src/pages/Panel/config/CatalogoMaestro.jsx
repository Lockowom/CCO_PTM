import { useEffect, useState, useCallback, useMemo } from "react";

const ACCENT = "#ea580c"; // naranja PTM

// Estructura común de todos los catálogos maestros (transportistas, vendedores…).
// Los campos extra (ej. centro_costo, division en vendedores) se acceden vía cast.

const EMPTY_FORM = { nombre: "", codigo: "", telefono: "", email: "", activo: true };

export default function CatalogoMaestro({
  noun, nounNuevo, editable, fetchAll, save, toggle, remove, onAfterWrite, extraFields = [],
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInactivos, setShowInactivos] = useState(true);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAll(true); // incluye inactivos
    setItems(data);
    setLoading(false);
  }, [fetchAll]);

  useEffect(() => { load(); }, [load]);

  // Tras cualquier escritura: recargar y notificar al padre (espejo opcional).
  const refrescar = useCallback(async () => {
    const data = await fetchAll(true);
    setItems(data);
    onAfterWrite?.(data);
  }, [fetchAll, onAfterWrite]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((t) => {
      if (!showInactivos && !t.activo) return false;
      if (!q) return true;
      return [t.nombre, t.codigo, t.telefono, t.email]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [items, search, showInactivos]);

  const stats = useMemo(() => ({
    total: items.length,
    activos: items.filter((t) => t.activo).length,
  }), [items]);

  const openNuevo = () => {
    const base = { ...EMPTY_FORM };
    extraFields.forEach((f) => { base[f.key] = ""; });
    setForm(base);
    setFormError("");
  };
  const openEditar = (t) => {
    const base = {
      id: t.id, nombre: t.nombre, codigo: t.codigo || "",
      telefono: t.telefono || "", email: t.email || "", activo: t.activo,
    };
    extraFields.forEach((f) => { base[f.key] = (t[f.key]) || ""; });
    setForm(base);
    setFormError("");
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.nombre.trim()) { setFormError("El nombre es obligatorio"); return; }
    setSaving(true);
    const res = await save(form);
    setSaving(false);
    if (!res.ok) { setFormError(res.error || "No se pudo guardar"); return; }
    setToast({ message: form.id ? `${cap(noun)} actualizado` : `${cap(noun)} creado`, type: "success" });
    setForm(null);
    await refrescar();
  };

  const handleToggle = async (t) => {
    const ok = await toggle(t.id, !t.activo);
    if (!ok) { setToast({ message: "No se pudo cambiar el estado", type: "error" }); return; }
    setToast({ message: `${t.nombre} ${!t.activo ? "activado" : "desactivado"}`, type: "success" });
    await refrescar();
  };

  const handleDelete = async (t) => {
    if (!confirm(`¿Eliminar "${t.nombre}"?\n\nLas operaciones históricas que lo usaron conservan el dato (es texto, no referencia). Si solo quieres ocultarlo de los dropdowns, usa "Desactivar".`)) return;
    const ok = await remove(t.id);
    if (!ok) { setToast({ message: "No se pudo eliminar", type: "error" }); return; }
    setToast({ message: `${t.nombre} eliminado`, type: "success" });
    await refrescar();
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código, teléfono o email…"
            className="w-full h-9 pl-3 pr-3 text-[13px] rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <label className="flex items-center gap-1.5 text-[12px] text-gray-600 select-none cursor-pointer">
          <input type="checkbox" checked={showInactivos} onChange={(e) => setShowInactivos(e.target.checked)} className="accent-orange-600" />
          Mostrar inactivos
        </label>
        <span className="text-[12px] text-gray-400">{stats.activos} activos · {stats.total} total</span>
        {editable && (
          <button
            onClick={openNuevo}
            className="h-9 px-3 rounded-md text-white text-[13px] font-medium hover:opacity-90"
            style={{ background: ACCENT }}
          >
            + Nuevo {nounNuevo}
          </button>
        )}
      </div>

      {!editable && (
        <div className="mb-4 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Modo solo lectura. Para administrar {noun}es necesitas rol <b>supervisor</b> o <b>admin</b>.
        </div>
      )}

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-[13px]">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-[13px]">Sin {noun}es que coincidan.</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-medium">Nombre</th>
                {extraFields.map((f) => (
                  <th key={f.key} className="px-4 py-2.5 font-medium hidden sm:table-cell">{f.label}</th>
                ))}
                <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Código</th>
                <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Teléfono</th>
                <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Email</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                {editable && <th className="px-4 py-2.5 font-medium text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className={`border-b border-gray-50 last:border-0 ${!t.activo ? "bg-gray-50/60" : ""}`}>
                  <td className="px-4 py-2.5 font-medium">{t.nombre}</td>
                  {extraFields.map((f) => (
                    <td key={f.key} className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">{(t[f.key]) || "—"}</td>
                  ))}
                  <td className="px-4 py-2.5 text-gray-500 hidden lg:table-cell">{t.codigo || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-500 hidden lg:table-cell">{t.telefono || "—"}</td>
                  <td className="px-4 py-2.5 text-gray-500 hidden lg:table-cell">{t.email || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${t.activo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${t.activo ? "bg-green-500" : "bg-gray-400"}`} />
                      {t.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  {editable && (
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-2 text-[12px]">
                        <button onClick={() => openEditar(t)} className="text-gray-500 hover:text-gray-900">Editar</button>
                        <button onClick={() => handleToggle(t)} className="text-gray-500 hover:text-gray-900">{t.activo ? "Desactivar" : "Activar"}</button>
                        <button onClick={() => handleDelete(t)} className="text-red-500 hover:text-red-700">Eliminar</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal form */}
      {form && (
        <div className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !saving && setForm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[15px] font-semibold mb-4">{form.id ? `Editar ${noun}` : `Nuevo ${noun}`}</h2>
            <div className="space-y-3">
              <Field label="Nombre *">
                <input autoFocus value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="form-inp" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Código"><input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} className="form-inp" /></Field>
                <Field label="Teléfono"><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="form-inp" /></Field>
              </div>
              <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-inp" /></Field>
              {extraFields.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {extraFields.map((f) => (
                    <Field key={f.key} label={f.label}>
                      <input
                        value={(form[f.key]) || ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="form-inp"
                      />
                    </Field>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 text-[13px] text-gray-700 select-none cursor-pointer pt-1">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="accent-orange-600" />
                Activo (aparece en los dropdowns)
              </label>
            </div>
            {formError && <p className="text-[12px] text-red-600 mt-3">{formError}</p>}
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setForm(null)} disabled={saving} className="h-9 px-3 text-[13px] text-gray-500 hover:text-gray-900 disabled:opacity-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="h-9 px-4 rounded-md text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50" style={{ background: ACCENT }}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-lg text-[13px] font-medium text-white shadow-lg ${toast.type === "success" ? "bg-gray-900" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <style>{`
        .form-inp {
          width: 100%;
          height: 2.25rem;
          padding: 0 0.625rem;
          font-size: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          outline: none;
        }
        .form-inp:focus { box-shadow: 0 0 0 2px #fed7aa; }
      `}</style>
    </>
  );
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
