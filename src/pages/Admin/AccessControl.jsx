import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users as UsersIcon, Shield, KeyRound, Target } from 'lucide-react';
import UsersPage from './Users';
import RolesPage from './Roles';
import ScopesPage from './Scopes';

// Control de Accesos UNIFICADO: Usuarios, Roles y Ámbitos en una sola sección
// con pestañas. /admin/users y /admin/roles renderizan esta misma página (cada
// ruta abre su pestaña y conserva su permiso de ROUTE_PERMISSIONS). La pestaña
// Ámbitos (Scopes, Fase 4 IAM) vive bajo /admin/roles?vista=scopes → hereda el
// permiso manage_roles/view_roles sin ruta nueva.
const TABS = [
  { id: 'usuarios', label: 'Usuarios', icon: UsersIcon, path: '/admin/users' },
  { id: 'roles', label: 'Roles y Permisos', icon: Shield, path: '/admin/roles' },
  { id: 'scopes', label: 'Ámbitos', icon: Target, path: '/admin/roles?vista=scopes' },
];

export default function AccessControl() {
  const location = useLocation();
  const navigate = useNavigate();
  const enRoles = location.pathname.includes('/roles');
  const vista = new URLSearchParams(location.search).get('vista');
  const tab = enRoles ? (vista === 'scopes' ? 'scopes' : 'roles') : 'usuarios';

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
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Usuarios y <span className="text-orange-600">Roles</span></h1>
            <p className="text-xs sm:text-sm text-slate-500">Control de accesos unificado · quién entra, con qué rol y qué permisos otorga cada rol</p>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, icon: Icon, path }) => (
          <button key={id} onClick={() => navigate(path)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border flex items-center gap-1.5 transition-colors ${tab === id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'usuarios' && <UsersPage embedded />}
      {tab === 'roles' && <RolesPage embedded />}
      {tab === 'scopes' && <ScopesPage />}
    </div>
  );
}
