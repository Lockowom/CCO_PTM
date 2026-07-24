import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users as UsersIcon, Shield, KeyRound, Target, Monitor, ScrollText, Gauge, FlaskConical, UserCheck, LogIn, Boxes } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UsersPage from './Users';
import RolesPage from './Roles';
import ScopesPage from './Scopes';
import SesionesPage from './Sesiones';
import AuditoriaPage from './Auditoria';
import EscalaPage from './Escala';
import PoliticasPage from './Politicas';
import DelegacionesPage from './Delegaciones';
import HistorialAccesoPage from './HistorialAcceso';
import TeamsPage from './Teams';

// Control de Accesos UNIFICADO (Identity & Security): Usuarios, Roles, Ámbitos,
// Sesiones y Auditoría en una sola sección con pestañas. /admin/users y
// /admin/roles renderizan esta misma página; las sub-vistas IAM viven bajo
// /admin/roles?vista=… y heredan el permiso de ROUTE_PERMISSIONS. Sesiones y
// Auditoría son SOLO admin (además el servidor gatea sus RPC).
const TABS = [
  { id: 'usuarios', label: 'Usuarios', icon: UsersIcon, path: '/admin/users' },
  { id: 'roles', label: 'Roles y Permisos', icon: Shield, path: '/admin/roles' },
  { id: 'scopes', label: 'Ámbitos', icon: Target, path: '/admin/roles?vista=scopes' },
  { id: 'teams', label: 'Equipos y Grupos', icon: Boxes, path: '/admin/roles?vista=teams' },
  { id: 'sesiones', label: 'Sesiones', icon: Monitor, path: '/admin/roles?vista=sesiones', soloAdmin: true },
  { id: 'accesos', label: 'Accesos', icon: LogIn, path: '/admin/roles?vista=accesos', soloAdmin: true },
  { id: 'auditoria', label: 'Auditoría', icon: ScrollText, path: '/admin/roles?vista=auditoria', soloAdmin: true },
  { id: 'escala', label: 'Escala', icon: Gauge, path: '/admin/roles?vista=escala', soloAdmin: true },
  { id: 'politicas', label: 'Políticas', icon: FlaskConical, path: '/admin/roles?vista=politicas', soloAdmin: true },
  { id: 'delegaciones', label: 'Delegaciones', icon: UserCheck, path: '/admin/roles?vista=delegaciones', soloAdmin: true },
];

export default function AccessControl() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const esAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado === true;
  const enRoles = location.pathname.includes('/roles');
  const vista = new URLSearchParams(location.search).get('vista');
  const vistasValidas = ['scopes', 'teams', 'sesiones', 'accesos', 'auditoria', 'escala', 'politicas', 'delegaciones'];
  const tab = enRoles ? (vistasValidas.includes(vista) ? vista : 'roles') : 'usuarios';

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-700">
      {/* Cabecera estándar CCO */}
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <KeyRound size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Identidad y <span className="text-orange-600">Seguridad</span></h1>
            <p className="text-xs sm:text-sm text-slate-500">Control de accesos: usuarios, roles, permisos, ámbitos, sesiones, auditoría, políticas y delegaciones</p>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 flex-wrap">
        {TABS.filter((t) => !t.soloAdmin || esAdmin).map(({ id, label, icon: Icon, path }) => (
          <button key={id} onClick={() => navigate(path)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border flex items-center gap-1.5 transition-colors ${tab === id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'usuarios' && <UsersPage embedded />}
      {tab === 'roles' && <RolesPage embedded />}
      {tab === 'scopes' && <ScopesPage />}
      {tab === 'teams' && <TeamsPage />}
      {tab === 'sesiones' && (esAdmin ? <SesionesPage /> : <RolesPage embedded />)}
      {tab === 'accesos' && (esAdmin ? <HistorialAccesoPage /> : <RolesPage embedded />)}
      {tab === 'auditoria' && (esAdmin ? <AuditoriaPage /> : <RolesPage embedded />)}
      {tab === 'escala' && (esAdmin ? <EscalaPage /> : <RolesPage embedded />)}
      {tab === 'politicas' && (esAdmin ? <PoliticasPage /> : <RolesPage embedded />)}
      {tab === 'delegaciones' && (esAdmin ? <DelegacionesPage /> : <RolesPage embedded />)}
    </div>
  );
}
