import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Users, Boxes, RefreshCw, Plus, Trash2, ShieldCheck, Users2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  catalogoOrg, listarTeams, guardarTeam, eliminarTeam, miembrosTeam, agregarMiembroTeam, quitarMiembroTeam,
  listarGroups, guardarGroup, eliminarGroup, miembrosGroup, agregarMiembroGroup, quitarMiembroGroup,
  asignacionesPrincipal, asignarRolPrincipal, revocarAsignacionPrincipal, refrescarGruposDinamicos,
} from '../../services/iamService';
import { ListaSkeleton, ListaError, ListaVacia } from '../../components/ui/EstadoLista';

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white';
const lbl = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';

const emptyTeam = { id: '', codigo: '', nombre: '', departamento_id: '', activo: true };
const emptyGroup = { id: '', codigo: '', nombre: '', tipo: 'static', activo: true, regla: { team_ids: [], department_ids: [], user_ids: [] } };

function CardButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border flex items-center gap-1.5 transition-colors ${
        active ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function MemberList({ rows, onRemove, dynamic = false }) {
  if (!rows.length) return <ListaVacia>Sin miembros asignados.</ListaVacia>;
  return (
    <div className="divide-y divide-slate-100">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
          <Users2 size={15} className="text-slate-300 shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-slate-800 truncate">{row.nombre}</div>
            <div className="text-[11px] text-slate-400 truncate">{row.correo}</div>
          </div>
          {dynamic && row.dinamico && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-100 px-2 py-1 text-[11px] font-bold text-sky-700">
              <Sparkles size={11} /> dinámico
            </span>
          )}
          {onRemove && (!dynamic || !row.dinamico) && (
            <button onClick={() => onRemove(row.id)} className="ml-auto w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0" title="Quitar">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function PrincipalAssignments({ rows, roles, form, setForm, onAssign, onRemove, canEdit }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
        <ShieldCheck size={12} /> Roles heredables
      </div>
      {canEdit && (
        <div className="p-4 grid sm:grid-cols-3 gap-3 border-b border-slate-100">
          <label className="block">
            <span className={lbl}>Rol</span>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={`${inp} mt-1`}>
              <option value="">—</option>
              {roles.map((r) => <option key={r.codigo} value={r.codigo}>{r.codigo} · {r.nombre}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={lbl}>Ámbito</span>
            <select value={form.scopeType} onChange={(e) => setForm((f) => ({ ...f, scopeType: e.target.value, scopeCode: '' }))} className={`${inp} mt-1`}>
              <option value="global">Global</option>
              <option value="centro_costo">Centro de costo</option>
              <option value="bodega">Bodega</option>
            </select>
          </label>
          <label className="block">
            <span className={lbl}>Código ámbito</span>
            <input value={form.scopeCode} disabled={form.scopeType === 'global'} onChange={(e) => setForm((f) => ({ ...f, scopeCode: e.target.value.trim() }))} className={`${inp} mt-1 disabled:bg-slate-50`} placeholder={form.scopeType === 'global' ? 'No aplica' : 'código'} />
          </label>
          <div className="sm:col-span-3 flex justify-end">
            <button onClick={onAssign} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">
              <Plus size={16} /> Asignar rol
            </button>
          </div>
        </div>
      )}
      {!rows.length ? (
        <ListaVacia>Sin roles heredables asignados.</ListaVacia>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0">
                <ShieldCheck size={11} className="text-orange-500" />{a.role}
              </span>
              <span className="text-[11px] text-slate-500">
                {a.scope_type === 'global' ? 'Global' : `${a.scope_type}: ${a.scope_code || '—'}`}
              </span>
              {canEdit && (
                <button onClick={() => onRemove(a.id)} className="ml-auto w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0" title="Revocar">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Teams() {
  const { hasPermission, user } = useAuth();
  const puede = hasPermission('manage_roles') || user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const [tab, setTab] = useState('teams');
  const [cat, setCat] = useState({ usuarios: [], roles: [], departamentos: [] });
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [teamAssignments, setTeamAssignments] = useState([]);
  const [groupAssignments, setGroupAssignments] = useState([]);
  const [teamForm, setTeamForm] = useState(emptyTeam);
  const [groupForm, setGroupForm] = useState(emptyGroup);
  const [teamMemberId, setTeamMemberId] = useState('');
  const [groupMemberId, setGroupMemberId] = useState('');
  const [teamAssignForm, setTeamAssignForm] = useState({ role: '', scopeType: 'global', scopeCode: '' });
  const [groupAssignForm, setGroupAssignForm] = useState({ role: '', scopeType: 'global', scopeCode: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarBase = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalogo, teamRows, groupRows] = await Promise.all([catalogoOrg(), listarTeams(), listarGroups()]);
      setCat(catalogo);
      setTeams(teamRows);
      setGroups(groupRows);
      if (!selectedTeam && teamRows[0]) setSelectedTeam(teamRows[0]);
      if (!selectedGroup && groupRows[0]) setSelectedGroup(groupRows[0]);
    } catch (e) {
      setError(e.message || 'No se pudo cargar la administración organizacional');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, selectedTeam]);

  const cargarDetalleTeam = useCallback(async (team) => {
    if (!team) return;
    try {
      const [members, assignments] = await Promise.all([
        miembrosTeam(team.id),
        asignacionesPrincipal('team', team.id),
      ]);
      setTeamMembers(members);
      setTeamAssignments(assignments);
      setTeamForm({
        id: team.id,
        codigo: team.codigo || '',
        nombre: team.nombre || '',
        departamento_id: team.departamento_id || '',
        activo: team.activo !== false,
      });
    } catch (e) {
      toast.error(e.message || 'No se pudo cargar el detalle del equipo');
    }
  }, []);

  const cargarDetalleGroup = useCallback(async (group) => {
    if (!group) return;
    try {
      const [members, assignments] = await Promise.all([
        miembrosGroup(group.id),
        asignacionesPrincipal('group', group.id),
      ]);
      setGroupMembers(members);
      setGroupAssignments(assignments);
      setGroupForm({
        id: group.id,
        codigo: group.codigo || '',
        nombre: group.nombre || '',
        tipo: group.tipo || 'static',
        activo: group.activo !== false,
        regla: {
          user_ids: group.regla?.user_ids || [],
          team_ids: group.regla?.team_ids || [],
          department_ids: group.regla?.department_ids || [],
        },
      });
    } catch (e) {
      toast.error(e.message || 'No se pudo cargar el detalle del grupo');
    }
  }, []);

  useEffect(() => { cargarBase(); }, [cargarBase]);
  useEffect(() => { if (selectedTeam?.id) cargarDetalleTeam(selectedTeam); }, [selectedTeam?.id, cargarDetalleTeam]);
  useEffect(() => { if (selectedGroup?.id) cargarDetalleGroup(selectedGroup); }, [selectedGroup?.id, cargarDetalleGroup]);

  const availableTeamUsers = useMemo(() => {
    const ids = new Set(teamMembers.map((m) => m.id));
    return cat.usuarios.filter((u) => !ids.has(u.id));
  }, [cat.usuarios, teamMembers]);
  const availableGroupUsers = useMemo(() => {
    const ids = new Set(groupMembers.map((m) => m.id));
    return cat.usuarios.filter((u) => !ids.has(u.id));
  }, [cat.usuarios, groupMembers]);

  const saveTeam = async () => {
    const r = await guardarTeam(teamForm);
    if (!r?.ok) return toast.error(r?.error || 'No se pudo guardar el equipo');
    toast.success('Equipo guardado');
    await cargarBase();
  };

  const removeTeam = async () => {
    if (!selectedTeam?.id || !window.confirm('¿Eliminar este equipo?')) return;
    const r = await eliminarTeam(selectedTeam.id);
    if (!r?.ok) return toast.error(r?.error || 'No se pudo eliminar el equipo');
    toast.success('Equipo eliminado');
    setSelectedTeam(null);
    setTeamForm(emptyTeam);
    setTeamMembers([]);
    setTeamAssignments([]);
    await cargarBase();
  };

  const saveGroup = async () => {
    const r = await guardarGroup(groupForm);
    if (!r?.ok) return toast.error(r?.error || 'No se pudo guardar el grupo');
    toast.success('Grupo guardado');
    await cargarBase();
  };

  const removeGroup = async () => {
    if (!selectedGroup?.id || !window.confirm('¿Eliminar este grupo?')) return;
    const r = await eliminarGroup(selectedGroup.id);
    if (!r?.ok) return toast.error(r?.error || 'No se pudo eliminar el grupo');
    toast.success('Grupo eliminado');
    setSelectedGroup(null);
    setGroupForm(emptyGroup);
    setGroupMembers([]);
    setGroupAssignments([]);
    await cargarBase();
  };

  const addTeamMember = async () => {
    if (!selectedTeam?.id || !teamMemberId) return;
    const r = await agregarMiembroTeam(selectedTeam.id, teamMemberId);
    if (!r?.ok) return toast.error(r?.error || 'No se pudo agregar el miembro');
    setTeamMemberId('');
    toast.success('Miembro agregado al equipo');
    await cargarDetalleTeam(selectedTeam);
    await cargarBase();
  };

  const addGroupMember = async () => {
    if (!selectedGroup?.id || !groupMemberId) return;
    const r = await agregarMiembroGroup(selectedGroup.id, groupMemberId);
    if (!r?.ok) return toast.error(r?.error || 'No se pudo agregar el miembro');
    setGroupMemberId('');
    toast.success('Miembro agregado al grupo');
    await cargarDetalleGroup(selectedGroup);
    await cargarBase();
  };

  const assignTeamRole = async () => {
    if (!selectedTeam?.id || !teamAssignForm.role) return toast.error('Selecciona un rol');
    const r = await asignarRolPrincipal({ principalType: 'team', principalId: selectedTeam.id, role: teamAssignForm.role, scopeType: teamAssignForm.scopeType, scopeCode: teamAssignForm.scopeCode || null });
    if (!r?.ok) return toast.error(r?.error || 'No se pudo asignar el rol');
    toast.success('Rol asignado al equipo');
    setTeamAssignForm({ role: '', scopeType: 'global', scopeCode: '' });
    await cargarDetalleTeam(selectedTeam);
    await cargarBase();
  };

  const assignGroupRole = async () => {
    if (!selectedGroup?.id || !groupAssignForm.role) return toast.error('Selecciona un rol');
    const r = await asignarRolPrincipal({ principalType: 'group', principalId: selectedGroup.id, role: groupAssignForm.role, scopeType: groupAssignForm.scopeType, scopeCode: groupAssignForm.scopeCode || null });
    if (!r?.ok) return toast.error(r?.error || 'No se pudo asignar el rol');
    toast.success('Rol asignado al grupo');
    setGroupAssignForm({ role: '', scopeType: 'global', scopeCode: '' });
    await cargarDetalleGroup(selectedGroup);
    await cargarBase();
  };

  const refreshDynamic = async () => {
    const r = await refrescarGruposDinamicos(selectedGroup?.tipo === 'dynamic' ? selectedGroup.id : null);
    if (!r?.ok) return toast.error(r?.error || 'No se pudieron refrescar los grupos dinámicos');
    toast.success(`Refresh OK: ${r.miembros_actualizados || 0} membresías recalculadas`);
    if (selectedGroup?.id) await cargarDetalleGroup(selectedGroup);
    await cargarBase();
  };

  if (loading) return <ListaSkeleton />;
  if (error) return <ListaError mensaje={error} onRetry={cargarBase} />;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-sky-50/60 px-4 py-3 text-[12.5px] text-slate-600">
        `Teams` y `Groups` permiten heredar roles IAM a varios usuarios a la vez. Los equipos agrupan personas operativas; los grupos pueden ser `static` o `dynamic`.
      </div>

      <div className="flex gap-2 flex-wrap">
        <CardButton active={tab === 'teams'} icon={Users} label="Equipos" onClick={() => setTab('teams')} />
        <CardButton active={tab === 'groups'} icon={Boxes} label="Grupos" onClick={() => setTab('groups')} />
        {tab === 'groups' && (
          <button onClick={refreshDynamic} className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50">
            <RefreshCw size={14} /> Refrescar dinámicos
          </button>
        )}
      </div>

      {tab === 'teams' && (
        <div className="grid xl:grid-cols-[320px,1fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Users size={12} /> Equipos ({teams.length})
            </div>
            {!teams.length ? (
              <ListaVacia>No hay equipos creados.</ListaVacia>
            ) : (
              <div className="divide-y divide-slate-100">
                {teams.map((t) => (
                  <button key={t.id} onClick={() => setSelectedTeam(t)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${selectedTeam?.id === t.id ? 'bg-orange-50/70' : ''}`}>
                    <div className="font-bold text-slate-800">{t.nombre}</div>
                    <div className="text-[11px] text-slate-500">{t.codigo} · {t.departamento || 'Sin departamento'} · {t.miembros} miembro(s)</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {puede && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">{teamForm.id ? 'Editar equipo' : 'Nuevo equipo'}</h3>
                  {teamForm.id ? <button onClick={() => setTeamForm(emptyTeam)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Limpiar</button> : null}
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="block"><span className={lbl}>Código</span><input value={teamForm.codigo} onChange={(e) => setTeamForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))} className={`${inp} mt-1`} /></label>
                  <label className="block"><span className={lbl}>Nombre</span><input value={teamForm.nombre} onChange={(e) => setTeamForm((f) => ({ ...f, nombre: e.target.value }))} className={`${inp} mt-1`} /></label>
                  <label className="block"><span className={lbl}>Departamento</span>
                    <select value={teamForm.departamento_id} onChange={(e) => setTeamForm((f) => ({ ...f, departamento_id: e.target.value }))} className={`${inp} mt-1`}>
                      <option value="">—</option>
                      {cat.departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </label>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-slate-500 inline-flex items-center gap-2">
                    <input type="checkbox" checked={teamForm.activo} onChange={(e) => setTeamForm((f) => ({ ...f, activo: e.target.checked }))} />
                    Activo
                  </label>
                  <div className="flex gap-2">
                    {teamForm.id && <button onClick={removeTeam} className="px-3 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50">Eliminar</button>}
                    <button onClick={saveTeam} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Guardar equipo</button>
                  </div>
                </div>
              </div>
            )}

            {selectedTeam ? (
              <>
                {puede && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-3"><Plus size={15} className="text-orange-500" /><h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">Agregar miembro</h3></div>
                    <div className="flex gap-2">
                      <select value={teamMemberId} onChange={(e) => setTeamMemberId(e.target.value)} className={inp}>
                        <option value="">—</option>
                        {availableTeamUsers.map((u) => <option key={u.id} value={u.id}>{u.nombre} · {u.correo}</option>)}
                      </select>
                      <button onClick={addTeamMember} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800">Agregar</button>
                    </div>
                  </div>
                )}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Users2 size={12} /> Miembros del equipo
                  </div>
                  <MemberList rows={teamMembers} onRemove={puede ? async (userId) => { const r = await quitarMiembroTeam(selectedTeam.id, userId); if (!r?.ok) return toast.error(r?.error || 'No se pudo quitar'); toast.success('Miembro removido'); await cargarDetalleTeam(selectedTeam); await cargarBase(); } : null} />
                </div>
                <PrincipalAssignments rows={teamAssignments} roles={cat.roles} form={teamAssignForm} setForm={setTeamAssignForm} onAssign={assignTeamRole} onRemove={puede ? async (id) => { const r = await revocarAsignacionPrincipal(id); if (!r?.ok) return toast.error(r?.error || 'No se pudo revocar'); toast.success('Asignación revocada'); await cargarDetalleTeam(selectedTeam); await cargarBase(); } : null} canEdit={puede} />
              </>
            ) : (
              <ListaVacia>Selecciona un equipo para administrar miembros y roles heredables.</ListaVacia>
            )}
          </div>
        </div>
      )}

      {tab === 'groups' && (
        <div className="grid xl:grid-cols-[320px,1fr] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Boxes size={12} /> Grupos ({groups.length})
            </div>
            {!groups.length ? (
              <ListaVacia>No hay grupos creados.</ListaVacia>
            ) : (
              <div className="divide-y divide-slate-100">
                {groups.map((g) => (
                  <button key={g.id} onClick={() => setSelectedGroup(g)} className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${selectedGroup?.id === g.id ? 'bg-orange-50/70' : ''}`}>
                    <div className="font-bold text-slate-800">{g.nombre}</div>
                    <div className="text-[11px] text-slate-500">{g.codigo} · {g.tipo} · {g.miembros} miembro(s)</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {puede && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">{groupForm.id ? 'Editar grupo' : 'Nuevo grupo'}</h3>
                  {groupForm.id ? <button onClick={() => setGroupForm(emptyGroup)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Limpiar</button> : null}
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="block"><span className={lbl}>Código</span><input value={groupForm.codigo} onChange={(e) => setGroupForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))} className={`${inp} mt-1`} /></label>
                  <label className="block"><span className={lbl}>Nombre</span><input value={groupForm.nombre} onChange={(e) => setGroupForm((f) => ({ ...f, nombre: e.target.value }))} className={`${inp} mt-1`} /></label>
                  <label className="block"><span className={lbl}>Tipo</span>
                    <select value={groupForm.tipo} onChange={(e) => setGroupForm((f) => ({ ...f, tipo: e.target.value }))} className={`${inp} mt-1`}>
                      <option value="static">static</option>
                      <option value="dynamic">dynamic</option>
                    </select>
                  </label>
                </div>
                {groupForm.tipo === 'dynamic' && (
                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    <label className="block"><span className={lbl}>User IDs</span><input value={(groupForm.regla?.user_ids || []).join(',')} onChange={(e) => setGroupForm((f) => ({ ...f, regla: { ...(f.regla || {}), user_ids: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } }))} className={`${inp} mt-1`} placeholder="uuid,uuid" /></label>
                    <label className="block"><span className={lbl}>Team IDs</span><input value={(groupForm.regla?.team_ids || []).join(',')} onChange={(e) => setGroupForm((f) => ({ ...f, regla: { ...(f.regla || {}), team_ids: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } }))} className={`${inp} mt-1`} placeholder="uuid,uuid" /></label>
                    <label className="block"><span className={lbl}>Department IDs</span><input value={(groupForm.regla?.department_ids || []).join(',')} onChange={(e) => setGroupForm((f) => ({ ...f, regla: { ...(f.regla || {}), department_ids: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } }))} className={`${inp} mt-1`} placeholder="uuid,uuid" /></label>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-slate-500 inline-flex items-center gap-2">
                    <input type="checkbox" checked={groupForm.activo} onChange={(e) => setGroupForm((f) => ({ ...f, activo: e.target.checked }))} />
                    Activo
                  </label>
                  <div className="flex gap-2">
                    {groupForm.id && <button onClick={removeGroup} className="px-3 py-2 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50">Eliminar</button>}
                    <button onClick={saveGroup} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Guardar grupo</button>
                  </div>
                </div>
              </div>
            )}

            {selectedGroup ? (
              <>
                {puede && selectedGroup.tipo === 'static' && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-3"><Plus size={15} className="text-orange-500" /><h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">Agregar miembro</h3></div>
                    <div className="flex gap-2">
                      <select value={groupMemberId} onChange={(e) => setGroupMemberId(e.target.value)} className={inp}>
                        <option value="">—</option>
                        {availableGroupUsers.map((u) => <option key={u.id} value={u.id}>{u.nombre} · {u.correo}</option>)}
                      </select>
                      <button onClick={addGroupMember} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800">Agregar</button>
                    </div>
                  </div>
                )}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Users2 size={12} /> Miembros del grupo
                  </div>
                  <MemberList rows={groupMembers} dynamic={selectedGroup.tipo === 'dynamic'} onRemove={puede && selectedGroup.tipo === 'static' ? async (userId) => { const r = await quitarMiembroGroup(selectedGroup.id, userId); if (!r?.ok) return toast.error(r?.error || 'No se pudo quitar'); toast.success('Miembro removido'); await cargarDetalleGroup(selectedGroup); await cargarBase(); } : null} />
                </div>
                <PrincipalAssignments rows={groupAssignments} roles={cat.roles} form={groupAssignForm} setForm={setGroupAssignForm} onAssign={assignGroupRole} onRemove={puede ? async (id) => { const r = await revocarAsignacionPrincipal(id); if (!r?.ok) return toast.error(r?.error || 'No se pudo revocar'); toast.success('Asignación revocada'); await cargarDetalleGroup(selectedGroup); await cargarBase(); } : null} canEdit={puede} />
              </>
            ) : (
              <ListaVacia>Selecciona un grupo para administrar miembros y roles heredables.</ListaVacia>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
