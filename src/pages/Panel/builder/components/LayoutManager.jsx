import { useState } from "react";
import { puedeEditar } from "../widget-registry";

function LayoutManager({ layouts, activeId, rol, onSelect, onCreate, onDelete, onRename, onSetMinRole, onClose }) {
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const esAdmin = rol === "admin";

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[420px] max-w-[95vw] max-h-[70vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Mis Dashboards</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">X</button>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-[11px] text-gray-400 mb-1">Compartidos entre todos los usuarios (guardados en Supabase).</p>
          {layouts.map((l) => {
            const editableByMe = puedeEditar(rol, l.minRoleEdit || "supervisor");
            return (
            <div key={l.id} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${l.id === activeId ? "border-[#ea580c] bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
              {editing === l.id ? (
                <input
                  autoFocus
                  className="flex-1 field-input text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => { onRename(l.id, name); setEditing(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { onRename(l.id, name); setEditing(null); } }}
                />
              ) : (
                <button onClick={() => onSelect(l.id)} className="flex-1 text-left min-w-0">
                  <span className="text-sm font-medium text-gray-800">{l.name}</span>
                  <span className="text-[10px] text-gray-400 ml-2">{(l.pages || []).reduce((n, p) => n + (p.widgets?.length || 0), 0)} widgets · {(l.pages || []).length} hoja(s)</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">
                    Editan: <span className="font-medium">{l.minRoleEdit || "supervisor"}+</span>
                    {!editableByMe && <span className="text-amber-500 ml-1">· solo lectura para ti</span>}
                  </span>
                </button>
              )}
              {esAdmin && (
                <select
                  value={l.minRoleEdit || "supervisor"}
                  onChange={(e) => onSetMinRole(l.id, e.target.value)}
                  className="text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-500"
                  title="Rol mínimo para editar"
                >
                  <option value="operador">operador+</option>
                  <option value="supervisor">supervisor+</option>
                  <option value="admin">admin</option>
                </select>
              )}
              {editableByMe && (
                <button
                  onClick={() => { setEditing(l.id); setName(l.name); }}
                  className="text-[11px] text-blue-500 hover:text-blue-700 px-1"
                >
                  Renombrar
                </button>
              )}
              {layouts.length > 1 && editableByMe && (
                <button
                  onClick={() => onDelete(l.id)}
                  className="text-[11px] text-red-400 hover:text-red-600 px-1"
                >
                  Eliminar
                </button>
              )}
            </div>
            );
          })}
          <button
            onClick={onCreate}
            className="w-full p-3 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-[#ea580c] hover:text-[#ea580c] transition-colors text-sm font-medium"
          >
            + Nuevo Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}


export default LayoutManager;
