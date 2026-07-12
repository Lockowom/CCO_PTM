import React, { useState, useRef } from 'react';
import {
  Activity, Users, Monitor, Clock, MapPin,
  RefreshCw, Circle, Wifi, WifiOff, Timer
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CanalOTA from '../../components/CanalOTA';
import DespliegueOTA from '../../components/DespliegueOTA';

const AdminMonitor = () => {
  const containerRef = useRef(null);
  const [filter, setFilter] = useState('all'); // all | online | offline

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin_monitor_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_usuarios')
        .select('id, nombre, email, rol, last_seen, current_module, current_path, session_start')
        .order('last_seen', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Auto-refresh every 10s
  });

  const now = new Date();

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;
    const diff = (now - new Date(lastSeen)) / 1000;
    return diff < 60; // Online if seen in last 60s
  };

  const isIdle = (lastSeen) => {
    if (!lastSeen) return false;
    const diff = (now - new Date(lastSeen)) / 1000;
    return diff >= 60 && diff < 300; // Idle between 1-5 min
  };

  const getSessionDuration = (sessionStart) => {
    if (!sessionStart) return '-';
    const diff = Math.floor((now - new Date(sessionStart)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    const hours = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Nunca';
    const diff = Math.floor((now - new Date(lastSeen)) / 1000);
    if (diff < 10) return 'Ahora';
    if (diff < 60) return `Hace ${diff}s`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return new Date(lastSeen).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  };

  const getStatusColor = (lastSeen) => {
    if (isOnline(lastSeen)) return 'bg-emerald-500';
    if (isIdle(lastSeen)) return 'bg-amber-400';
    return 'bg-slate-300';
  };

  const getStatusLabel = (lastSeen) => {
    if (isOnline(lastSeen)) return 'Online';
    if (isIdle(lastSeen)) return 'Inactivo';
    return 'Offline';
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    if (filter === 'online') return isOnline(u.last_seen) || isIdle(u.last_seen);
    if (filter === 'offline') return !isOnline(u.last_seen) && !isIdle(u.last_seen);
    return true;
  });

  // Stats
  const onlineCount = users.filter(u => isOnline(u.last_seen)).length;
  const idleCount = users.filter(u => isIdle(u.last_seen)).length;
  const totalCount = users.length;

  // Group online users by module
  const moduleGroups = {};
  users.filter(u => isOnline(u.last_seen) || isIdle(u.last_seen)).forEach(u => {
    const mod = u.current_module || 'Desconocido';
    if (!moduleGroups[mod]) moduleGroups[mod] = [];
    moduleGroups[mod].push(u);
  });

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 bg-slate-50 min-h-screen text-slate-700 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-emerald-500" /> Monitor en Tiempo Real
          </h2>
          <p className="text-slate-500 text-sm">Usuarios conectados y actividad del sistema</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Canal OTA de este dispositivo (solo visible en la app Android) */}
      <CanalOTA />

      {/* Despliegue OTA a producción (solo admin / permiso deploy_ota) */}
      <DespliegueOTA />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold truncate">Conectados</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{onlineCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Wifi size={24} className="text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold truncate">Inactivos</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">{idleCount}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold truncate">Total Usuarios</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-slate-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold truncate">Módulos Activos</p>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">{Object.keys(moduleGroups).length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Monitor size={24} className="text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Module Distribution */}
      {Object.keys(moduleGroups).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Distribución por Módulo</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(moduleGroups).sort((a, b) => b[1].length - a[1].length).map(([mod, usersInMod]) => (
              <div key={mod} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                <MapPin size={14} className="text-indigo-500" />
                <span className="text-sm font-semibold text-slate-800">{mod}</span>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{usersInMod.length}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Todos', count: totalCount },
          { key: 'online', label: 'Activos', count: onlineCount + idleCount },
          { key: 'offline', label: 'Offline', count: totalCount - onlineCount - idleCount },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-2 sm:px-5 py-3 sm:py-4 font-bold tracking-wider">Usuario</th>
                <th className="px-2 sm:px-5 py-3 sm:py-4 font-bold tracking-wider">Estado</th>
                <th className="px-2 sm:px-5 py-3 sm:py-4 font-bold tracking-wider">Módulo Actual</th>
                <th className="px-2 sm:px-5 py-3 sm:py-4 font-bold tracking-wider">Sesión</th>
                <th className="px-2 sm:px-5 py-3 sm:py-4 font-bold tracking-wider">Última Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-2 sm:px-5 py-3 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                        {(u.nombre || u.email || '?').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{u.nombre || u.email}</p>
                        <p className="text-xs text-slate-400">{u.rol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-5 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(u.last_seen)} ${isOnline(u.last_seen) ? 'animate-pulse' : ''}`}></div>
                      <span className={`text-xs font-medium ${
                        isOnline(u.last_seen) ? 'text-emerald-600' : isIdle(u.last_seen) ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        {getStatusLabel(u.last_seen)}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-5 py-3 sm:py-4">
                    {(isOnline(u.last_seen) || isIdle(u.last_seen)) && u.current_module ? (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-indigo-400" />
                        <span className="text-sm font-medium text-slate-700">{u.current_module}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-5 py-3 sm:py-4">
                    {(isOnline(u.last_seen) || isIdle(u.last_seen)) && u.session_start ? (
                      <div className="flex items-center gap-2">
                        <Timer size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">{getSessionDuration(u.session_start)}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-5 py-3 sm:py-4">
                    <span className="text-xs text-slate-500">{getLastSeenText(u.last_seen)}</span>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-400">
                    <WifiOff size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No hay usuarios {filter === 'online' ? 'activos' : filter === 'offline' ? 'offline' : ''} en este momento</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Auto-refresh indicator */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 py-2.5 flex items-center justify-between">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Circle size={8} className="text-emerald-400 fill-emerald-400 animate-pulse" />
            Actualización automática cada 10s
          </p>
          <p className="text-xs text-slate-400">
            {filteredUsers.length} de {totalCount} usuarios
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminMonitor;
