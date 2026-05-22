import { create } from 'zustand';
import { supabase } from '../supabase';

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
        
        // 2. Normalización de partes (RACK-NIVEL-POSICION)
        const parts = cleaned.split('-').filter(p => p !== '');
        if (parts.length >= 2) {
          const rack = parts[0];
          let p1 = parts[1];
          let p2 = parts[2] || '01';

          const val1 = parseInt(p1);
          const val2 = parseInt(p2);

          // Lógica de Detección de Intercambio (Heurística)
          // Si el primer número es > 4 y el segundo es <= 4, asumimos que es POS-LEVEL y lo invertimos a LEVEL-POS
          if (!isNaN(val1) && !isNaN(val2) && val1 > 4 && val2 <= 4) {
            [p1, p2] = [p2, p1];
          }

          const normLevel = isNaN(parseInt(p1)) ? p1 : parseInt(p1).toString().padStart(2, '0');
          const normPos = isNaN(parseInt(p2)) ? p2 : parseInt(p2).toString().padStart(2, '0');

          return `${rack}-${normLevel}-${normPos}`;
        }
        return cleaned;
      };

      // 1. Get Real Inventory FIRST (This is the source of truth for occupancy)
      const { data: ubicacionesRows, error: ubErr } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .limit(10000);
        
      if (ubErr) throw ubErr;

      // 2. Get Physical Layout (Optional metadata)
      const { data: layoutRows, error: layoutErr } = await supabase
        .from('wms_layout')
        .select('*')
        .limit(10000);
      
      if (layoutErr) console.warn("Aviso: No se pudo cargar wms_layout", layoutErr);

      const inventoryMap = {};
      const layoutMap = {};
      const uniqueOccupiedLocations = new Set();
      
      // Procesar Inventario: Capturar TODO el stock disponible
      (ubicacionesRows || []).forEach(row => {
        if (!row.ubicacion) return;
        
        const normUbic = normalizeLoc(row.ubicacion);
        if (!inventoryMap[normUbic]) inventoryMap[normUbic] = [];
        
        inventoryMap[normUbic].push({
          ...row,
          ubicacion: normUbic
        });

        // Una ubicación está ocupada si tiene cantidad > 0
        if (Number(row.cantidad) > 0) {
          uniqueOccupiedLocations.add(normUbic);
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
        // Si el layout dice que está ocupada explícitamente, la contamos
        if (row.estado === 'OCUPADA') {
          uniqueOccupiedLocations.add(normUbic);
        }
      });

      // AÑADIR ubicaciones que están en inventario pero NO en layout (Crucial para el "AUN NO")
      Object.keys(inventoryMap).forEach(normUbic => {
        if (!layoutMap[normUbic]) {
          const parts = normUbic.split('-');
          layoutMap[normUbic] = {
            ubicacion: normUbic,
            pasillo: parts[0],
            nivel: parseInt(parts[1]) || 0,
            columna: parseInt(parts[2]) || 0,
            estado: 'OCUPADA', // Si está en inventario con stock, está ocupada
            cantidad: inventoryMap[normUbic].reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0)
          };
        }
      });

      // Stats Globales: El usuario especificó 1031 posiciones totales
      const totalSystemPositions = 1031; 
      const occupiedCount = uniqueOccupiedLocations.size;

      set({
        layout: layoutMap,
        inventory: inventoryMap,
        stats: {
          total: totalSystemPositions,
          ocupadas: occupiedCount,
          vacias: Math.max(0, totalSystemPositions - occupiedCount),
          ocupacion: totalSystemPositions > 0 ? Math.round((occupiedCount / totalSystemPositions) * 100) : 0
        },
        loading: false
      });

    } catch (error) {
      console.error('Error fetching warehouse data:', error);
      set({ loading: false });
    }
  },

  updateLocationState: async (ubicacion, nuevoEstado) => {
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
      console.error("Error al cambiar estado:", error);
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
       console.error("Error moviendo item:", error);
       throw error;
     }
  },

  subscribeToRealtime: () => {
    const channel = supabase
      .channel('warehouse-dna-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wms_ubicaciones' }, payload => {
         get().fetchWarehouseData(); // Full refresh on change for safety
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wms_layout' }, payload => {
         get().fetchWarehouseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));