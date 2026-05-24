import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useWarehouseStore } from '../../store/warehouseStore';
import {
  Warehouse, Info, Grid, RefreshCw, Search, X, Download, Layers, BarChart3, Package,
  Lock, Unlock, ChevronDown, Box, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { RACK_CONFIG, TOTAL_POSITIONS, MAX_LEVELS, getPositionsForLevel } from '../../constants/warehouse';
import { useAuth } from '../../context/AuthContext';

const LOCATION_STATES = {
  LIBRE: { label: 'Libre', color: 'emerald' },
  OCUPADA: { label: 'Ocupada', color: 'blue' },
  NO_DISPONIBLE: { label: 'No Disponible', color: 'red' },
};

const getCellStyle = (pos) => {
  if (pos.estado === 'NO_DISPONIBLE') {
    return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-600', pattern: true };
  }
  if (pos.qty === 0 && !pos.occupied) {
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-300', pattern: false };
  }
  const ratio = Math.min(pos.qty / Math.max(pos.maxQty, 1), 1);
  if (ratio <= 0.25) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', pattern: false };
  if (ratio <= 0.5) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', pattern: false };
  if (ratio <= 0.75) return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', pattern: false };
  return { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', pattern: false };
};

const Heatmap = () => {
  const containerRef = useRef();
  const { user } = useAuth();
  const { layout, inventory, stats, loading, fetchWarehouseData, updateLocationState } = useWarehouseStore();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRack, setSelectedRack] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [changingState, setChangingState] = useState(false);

  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'ADMIN_DEV';

  useEffect(() => { fetchWarehouseData(); }, [fetchWarehouseData]);

  useGSAP(() => {
    gsap.from('.hm-fade', { y: 12, opacity: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out' });
  }, { scope: containerRef });

  useGSAP(() => {
    if (!loading) {
      gsap.from('.rack-section', { y: 10, opacity: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out' });
    }
  }, [selectedLevel, loading]);

  const heatmapData = useMemo(() => {
    const racks = {};
    let levelTotal = 0;
    let levelOccupied = 0;
    let levelBlocked = 0;
    let maxQtyInLevel = 0;

    Object.entries(RACK_CONFIG).forEach(([rackId, config]) => {
      if (selectedLevel > config.levels) return;
      const posCount = getPositionsForLevel(rackId, selectedLevel);
      levelTotal += posCount;

      racks[rackId] = { config, positions: [], occupied: 0, blocked: 0, totalQty: 0, posCount };

      for (let p = 1; p <= posCount; p++) {
        const posKey = p.toString().padStart(2, '0');
        const locCode = `${rackId}-${posKey}-${selectedLevel.toString().padStart(2, '0')}`;

        const node = layout[locCode];
        const qty = node ? (node.cantidad || 0) : 0;
        const estado = node?.estado || (qty > 0 ? 'OCUPADA' : 'LIBRE');
        const isBlocked = estado === 'NO_DISPONIBLE';
        const isOccupied = !isBlocked && (qty > 0 || estado === 'OCUPADA');

        if (isBlocked) {
          racks[rackId].blocked++;
          levelBlocked++;
        } else if (isOccupied) {
          racks[rackId].occupied++;
          levelOccupied++;
        }
        racks[rackId].totalQty += qty;
        if (qty > maxQtyInLevel) maxQtyInLevel = qty;

        racks[rackId].positions.push({ posKey, locCode, qty, occupied: isOccupied, estado, maxQty: 0 });
      }

      racks[rackId].positions.forEach(p => { p.maxQty = maxQtyInLevel; });
    });

    return {
      racks,
      levelTotal,
      levelOccupied,
      levelBlocked,
      levelUsed: levelOccupied + levelBlocked,
      levelPercent: levelTotal > 0 ? Math.round(((levelOccupied + levelBlocked) / levelTotal) * 100) : 0,
      maxQty: maxQtyInLevel
    };
  }, [layout, selectedLevel]);

  const filteredRacks = useMemo(() => {
    let entries = Object.entries(heatmapData.racks);
    if (selectedRack) entries = entries.filter(([id]) => id === selectedRack);
    if (searchQuery) {
      const q = searchQuery.toUpperCase();
      entries = entries.filter(([id, data]) =>
        id.includes(q) || data.positions.some(p => p.locCode.includes(q))
      );
    }
    return entries;
  }, [heatmapData.racks, selectedRack, searchQuery]);

  const rackSummary = useMemo(() => {
    return Object.entries(heatmapData.racks).map(([id, data]) => {
      const used = data.occupied + data.blocked;
      return {
        id,
        occupied: data.occupied,
        blocked: data.blocked,
        total: data.posCount,
        percent: data.posCount > 0 ? Math.round((used / data.posCount) * 100) : 0,
        totalQty: data.totalQty
      };
    });
  }, [heatmapData.racks]);

  const openDetail = useCallback((locCode) => {
    const items = inventory[locCode] || [];
    const node = layout[locCode];
    setDetailModal({ locCode, items, estado: node?.estado || 'LIBRE', node });
  }, [inventory, layout]);

  const handleStateChange = useCallback(async (locCode, newState) => {
    setChangingState(true);
    try {
      await updateLocationState(locCode, newState);
      setDetailModal(prev => prev ? { ...prev, estado: newState } : null);
      toast.success(`${locCode} → ${LOCATION_STATES[newState]?.label || newState}`);
      fetchWarehouseData();
    } catch {
      toast.error('Error al cambiar estado');
    } finally {
      setChangingState(false);
    }
  }, [updateLocationState, fetchWarehouseData]);

  const exportCSV = useCallback(() => {
    const headers = ['Ubicacion', 'Rack', 'Posicion', 'Nivel', 'Cantidad', 'Estado'];
    const rows = [];
    Object.entries(heatmapData.racks).forEach(([rackId, data]) => {
      data.positions.forEach(pos => {
        rows.push([pos.locCode, rackId, pos.posKey, selectedLevel, pos.qty, pos.estado]);
      });
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HEATMAP_NIVEL${selectedLevel}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [heatmapData.racks, selectedLevel]);

  const globalPercent = stats.ocupacion || 0;

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-[#F8F9FB] overflow-hidden">

      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
              <Grid size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Mapa de Ocupación</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {globalPercent}% global · {stats.ocupadas}/{TOTAL_POSITIONS} posiciones usadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors active:scale-[0.97]">
              <Download size={15} /> Exportar
            </button>
            <button onClick={() => fetchWarehouseData()} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all active:scale-95">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nivel:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {Array.from({ length: MAX_LEVELS }, (_, i) => i + 1).map(lvl => (
                <button key={lvl} onClick={() => setSelectedLevel(lvl)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${selectedLevel === lvl ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Rack:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg flex-wrap">
              <button onClick={() => setSelectedRack(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!selectedRack ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                Todos
              </button>
              {Object.keys(RACK_CONFIG).map(rId => (
                <button key={rId} onClick={() => setSelectedRack(selectedRack === rId ? null : rId)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${selectedRack === rId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {rId}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1 min-w-[180px] max-w-[280px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="Buscar ubicación..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder-slate-300 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {/* KPIs */}
        <div className="px-6 pt-4 pb-2">
          <div className="hm-fade grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ocupación Total</p>
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{globalPercent}%</span>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${globalPercent >= 80 ? 'bg-rose-500' : globalPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${globalPercent}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1.5">{stats.ocupadas} / {TOTAL_POSITIONS}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nivel {selectedLevel}</p>
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{heatmapData.levelPercent}%</span>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800 rounded-full transition-all duration-700" style={{ width: `${heatmapData.levelPercent}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1.5">{heatmapData.levelUsed} / {heatmapData.levelTotal}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ocupadas</p>
              <span className="text-4xl font-extrabold text-blue-600 tracking-tight">{heatmapData.levelOccupied}</span>
              <p className="text-[10px] text-slate-400 font-medium mt-3">con stock en nivel {selectedLevel}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">No Disponibles</p>
              <span className="text-4xl font-extrabold text-red-500 tracking-tight">{heatmapData.levelBlocked}</span>
              <p className="text-[10px] text-slate-400 font-medium mt-3">bloqueadas en nivel {selectedLevel}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Libres</p>
              <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">{heatmapData.levelTotal - heatmapData.levelUsed}</span>
              <p className="text-[10px] text-slate-400 font-medium mt-3">disponibles en nivel {selectedLevel}</p>
            </div>
          </div>
        </div>

        {/* Rack Cards */}
        <div className="px-6 py-2">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-2 hm-fade">
            {rackSummary.map(rack => (
              <button key={rack.id} onClick={() => setSelectedRack(selectedRack === rack.id ? null : rack.id)}
                className={`bg-white border rounded-xl p-2.5 text-left hover:shadow-md transition-all active:scale-[0.97] ${selectedRack === rack.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-extrabold text-slate-900">{rack.id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${rack.percent >= 80 ? 'bg-rose-50 text-rose-600' : rack.percent >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {rack.percent}%
                  </span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${rack.percent >= 80 ? 'bg-rose-500' : rack.percent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${rack.percent}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-slate-400 font-medium">{rack.occupied}/{rack.total}</span>
                  {rack.blocked > 0 && <span className="text-[9px] text-red-400 font-bold">{rack.blocked} bloq</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="px-6 py-3 space-y-4">
          {loading && filteredRacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando mapa...</p>
            </div>
          ) : filteredRacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Warehouse size={36} className="text-slate-200 mb-3" />
              <p className="text-sm font-bold text-slate-400">Sin resultados para este filtro</p>
            </div>
          ) : (
            filteredRacks.map(([rackId, data]) => {
              const used = data.occupied + data.blocked;
              const pct = data.posCount > 0 ? Math.round((used / data.posCount) * 100) : 0;
              return (
                <div key={rackId} className="rack-section bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-800 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        Rack {rackId}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {data.posCount} pos · {data.config.levels} niv
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        <Package size={12} className="text-slate-400" />
                        <span className="text-slate-600">{data.totalQty} uds</span>
                      </div>
                      {data.blocked > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                          {data.blocked} bloq
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pct >= 80 ? 'bg-rose-50 text-rose-600' : pct >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <div className="flex gap-1 min-w-fit">
                      {data.positions.map(pos => {
                        const style = getCellStyle(pos);
                        const isHovered = hoveredCell === pos.locCode;
                        const isHighlighted = searchQuery && pos.locCode.toUpperCase().includes(searchQuery.toUpperCase());
                        const isSelected = detailModal?.locCode === pos.locCode;

                        return (
                          <button key={pos.posKey}
                            onClick={() => openDetail(pos.locCode)}
                            onMouseEnter={() => setHoveredCell(pos.locCode)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`relative flex-shrink-0 w-9 h-11 rounded-lg border transition-all duration-150 flex flex-col items-center justify-center gap-0.5
                              ${style.bg} ${style.border}
                              ${isHovered ? 'scale-125 z-10 shadow-lg !border-blue-500 ring-2 ring-blue-200' : ''}
                              ${isSelected ? '!border-blue-600 ring-2 ring-blue-300 scale-110' : ''}
                              ${isHighlighted ? 'ring-2 ring-orange-400' : ''}
                              hover:scale-110 hover:shadow-md active:scale-95 cursor-pointer`}>
                            {pos.estado === 'NO_DISPONIBLE' ? (
                              <Lock size={10} className="text-red-500" />
                            ) : (
                              <>
                                <span className={`text-[8px] font-bold ${style.text} leading-none`}>{pos.posKey}</span>
                                {pos.qty > 0 && (
                                  <span className={`text-[7px] font-extrabold ${style.text} leading-none opacity-70`}>{pos.qty}</span>
                                )}
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="px-6 pb-8">
          <div className="hm-fade bg-white border border-slate-200 rounded-2xl p-5">
            <h4 className="text-xs font-extrabold text-slate-900 mb-3">Escala de Color</h4>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200" />
                <span className="text-[10px] font-medium text-slate-500">Libre</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200" />
                <span className="text-[10px] font-medium text-slate-500">Bajo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200" />
                <span className="text-[10px] font-medium text-slate-500">Medio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-orange-50 border border-orange-300" />
                <span className="text-[10px] font-medium text-slate-500">Alto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-rose-50 border border-rose-300" />
                <span className="text-[10px] font-medium text-slate-500">Saturado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-300 flex items-center justify-center">
                  <Lock size={8} className="text-red-500" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">No Disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <MapPin size={18} className="text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{detailModal.locCode}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      detailModal.estado === 'NO_DISPONIBLE' ? 'bg-red-50 text-red-600 border border-red-200' :
                      detailModal.items.length > 0 ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {LOCATION_STATES[detailModal.estado]?.label || detailModal.estado}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {detailModal.items.reduce((a, i) => a + (Number(i.cantidad) || 0), 0)} uds · {detailModal.items.length} SKUs
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* State Change (Admin only) */}
            {isAdmin && (
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cambiar estado:</span>
                  {Object.entries(LOCATION_STATES).map(([key, cfg]) => (
                    <button key={key} disabled={changingState || detailModal.estado === key}
                      onClick={() => handleStateChange(detailModal.locCode, key)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all
                        ${detailModal.estado === key
                          ? `bg-${cfg.color}-100 text-${cfg.color}-700 border border-${cfg.color}-300 ring-2 ring-${cfg.color}-200`
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}
                        ${changingState ? 'opacity-50' : 'active:scale-95'}`}>
                      {key === 'NO_DISPONIBLE' && <Lock size={10} className="inline mr-1" />}
                      {key === 'LIBRE' && <Unlock size={10} className="inline mr-1" />}
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {detailModal.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Box size={32} className="text-slate-200 mb-3" />
                  <p className="text-sm font-bold text-slate-400">Ubicación vacía</p>
                  <p className="text-xs text-slate-300 mt-1">No hay productos en esta posición</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {detailModal.items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/80 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">
                          {item.codigo}
                        </span>
                        <span className="text-sm text-slate-600 truncate">{item.descripcion}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-sm font-extrabold text-slate-900 tabular-nums">{Number(item.cantidad) || 0}</span>
                        <span className="text-[10px] text-slate-400 font-medium">uds</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-b-2xl">
              <span className="text-[10px] text-slate-400 font-medium">
                {detailModal.locCode.split('-')[0]} · Pos {detailModal.locCode.split('-')[1]} · Niv {detailModal.locCode.split('-')[2]}
              </span>
              <button onClick={() => setDetailModal(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors active:scale-95">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
