import { create } from 'zustand';
import { supabase } from '../supabase';
import { RACK_CONFIG, TOTAL_POSITIONS, getPositionsForLevel } from '../constants/warehouse';

export const useWarehouseStore = create((set, get) => ({
  layout: {},
  inventory: {},
  stats: { total: 0, ocupadas: 0, vacias: 0, ocupacion: 0 },
  loading: false,
  ui: {
    activeCell: null,
    searchQuery: '',
    heatmapMode: false,
    camera: { x: -1500, y: -1500, zoom: 0.1 }
  },

  setSearchQuery: (query) => set((state) => ({ ui: { ...state.ui, searchQuery: query } })),
  setActiveCell: (cellId) => set((state) => ({ ui: { ...state.ui, activeCell: cellId } })),
  toggleHeatmap: () => set((state) => ({ ui: { ...state.ui, heatmapMode: !state.ui.heatmapMode } })),
  setCamera: (camera) => set((state) => ({ ui: { ...state.ui, camera: { ...state.ui.camera, ...camera } } })),

  fetchWarehouseData: async () => {
    set({ loading: true });
    try {
      const normalizeLoc = (loc) => {
        if (!loc) return '';
        // 1. Limpieza agresiva: eliminar todo lo que no sea letras, números o guiones/espacios
        let cleaned = loc.trim().toUpperCase().replace(/[\s\.]+/g, '-');
        
        // 2. Normalización de partes: RACK-POSICION-NIVEL
        const parts = cleaned.split('-').filter(p => p !== '');
        if (parts.length >= 2) {
          const rack = parts[0];
          let p1 = parts[1];
          let p2 = parts[2] || '01';

          const val1 = parseInt(p1);
          const val2 = parseInt(p2);

          // Heurística: si p1 parece nivel (<=4) y p2 parece posición (>4), invertir a POSICION-NIVEL
          if (!isNaN(val1) && !isNaN(val2) && val1 <= 4 && val2 > 4) {
            [p1, p2] = [p2, p1];
          }

          const normPos = isNaN(parseInt(p1)) ? p1 : parseInt(p1).toString().padStart(2, '0');
          const normLevel = isNaN(parseInt(p2)) ? p2 : parseInt(p2).toString().padStart(2, '0');

          return `${rack}-${normPos}-${normLevel}`;
        }
        return cleaned;
      };

      // Función auxiliar para traer TODOS los registros (Paginación automática)
      const fetchAll = async (tableName) => {
        let allData = [];
        let from = 0;
        const step = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .range(from, from + step - 1);
          
          if (error) throw error;
          allData = [...allData, ...data];
          
          if (data.length < step) {
            hasMore = false;
          } else {
            from += step;
          }
        }
        return allData;
      };

      // 1. Get Real Inventory FIRST (Source of truth for occupancy)
      const ubicacionesRows = await fetchAll('wms_ubicaciones');
        
      // 2. Get Physical Layout (Optional metadata)
      const layoutRows = await fetchAll('wms_layout').catch(() => []);

      const inventoryMap = {};
      const layoutMap = {};
      const validOccupiedLocations = new Set();
      
      // Procesar Inventario: Capturar TODO el stock disponible
      (ubicacionesRows || []).forEach(row => {
        if (!row.ubicacion) return;
        
        const normUbic = normalizeLoc(row.ubicacion);
        if (!inventoryMap[normUbic]) inventoryMap[normUbic] = [];
        
        inventoryMap[normUbic].push({
          ...row,
          ubicacion: normUbic
        });

        // Validar si la ubicación es físicamente posible (formato: RACK-POS-NIVEL)
        const parts = normUbic.split('-');
        const rackId = parts[0];
        const pos = parseInt(parts[1]);
        const level = parseInt(parts[2]);
        const config = RACK_CONFIG[rackId];

        const maxPos = config ? getPositionsForLevel(rackId, level) : 0;
        const isValid = config && level <= config.levels && pos <= maxPos;

        if (Number(row.cantidad) > 0 && isValid) {
          validOccupiedLocations.add(normUbic);
        }
      });

      // Procesar Layout y MERGE con Inventario
      (layoutRows || []).forEach(row => {
        const normUbic = normalizeLoc(row.ubicacion);
        layoutMap[normUbic] = {
          ...row,
          ubicacion: normUbic,
          cantidad: (inventoryMap[normUbic] || []).reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0)
        };

        const parts = normUbic.split('-');
        const rackId = parts[0];
        const pos = parseInt(parts[1]);
        const level = parseInt(parts[2]);
        const config = RACK_CONFIG[rackId];
        const maxPos = config ? getPositionsForLevel(rackId, level) : 0;
        const isValid = config && level <= config.levels && pos <= maxPos;

        if (row.estado === 'OCUPADA' && isValid) {
          validOccupiedLocations.add(normUbic);
        }
      });

      // AÑADIR ubicaciones que están en inventario pero NO en layout (Crucial para el "AUN NO")
      Object.keys(inventoryMap).forEach(normUbic => {
        if (!layoutMap[normUbic]) {
          const parts = normUbic.split('-');
          layoutMap[normUbic] = {
            ubicacion: normUbic,
            pasillo: parts[0],
            columna: parseInt(parts[1]) || 0,
            nivel: parseInt(parts[2]) || 0,
            estado: 'OCUPADA', // Si está en inventario con stock, está ocupada
            cantidad: inventoryMap[normUbic].reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0)
          };
        }
      });

      const occupiedCount = validOccupiedLocations.size;

      set({
        layout: layoutMap,
        inventory: inventoryMap,
        stats: {
          total: TOTAL_POSITIONS,
          ocupadas: occupiedCount,
          vacias: Math.max(0, TOTAL_POSITIONS - occupiedCount),
          ocupacion: TOTAL_POSITIONS > 0 ? Math.round((occupiedCount / TOTAL_POSITIONS) * 100) : 0
        },
        loading: false
      });

    } catch (_) {
      console.error('Warehouse data fetch error:', _);
      set({ loading: false });
    }
  },

  updateLocationState: async (ubicacion, nuevoEstado) => {
    if (!ubicacion || typeof ubicacion !== 'string') return;
    try {
      const parsed = ubicacion.split('-');
      const payload = {
        ubicacion: ubicacion,
        estado: nuevoEstado,
        pasillo: parsed[0],
        columna: parseInt(parsed[1]) || 0,
        nivel: parseInt(parsed[2]) || 0,
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('wms_layout')
        .upsert(payload, { onConflict: 'ubicacion' });

      if (error) throw error;
      
      // Update local state instantly
      set((state) => {
        const newLayout = { ...state.layout };
        if (newLayout[ubicacion]) {
          newLayout[ubicacion].estado = nuevoEstado;
        } else {
           newLayout[ubicacion] = {
             id: ubicacion,
             pasillo: payload.pasillo,
             columna: payload.columna,
             nivel: payload.nivel,
             estado: nuevoEstado,
             cantidad: 0
           };
        }
        return { layout: newLayout };
      });

    } catch (error) {
      throw error;
    }
  },

  moveItem: async (itemId, targetUbicacion, newQuantity) => {
     try {
        const normalizedTarget = targetUbicacion.toUpperCase().trim();
        const { error } = await supabase
          .from('wms_ubicaciones')
          .update({ 
              cantidad: Number(newQuantity),
              ubicacion: normalizedTarget
          })
          .eq('id', itemId);

        if (error) throw error;
        
        // Refresh full state to ensure consistency
        get().fetchWarehouseData();
     } catch (error) {
       throw error;
     }
  },

  subscribeToRealtime: () => {
    let debounceTimer = null;
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => get().fetchWarehouseData(), 2000);
    };

    const channel = supabase
      .channel('warehouse-dna-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wms_ubicaciones' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wms_layout' }, debouncedFetch)
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err);
      });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }
}));