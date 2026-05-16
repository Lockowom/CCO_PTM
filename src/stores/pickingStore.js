import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePickingStore = create(
  persist(
    (set, get) => ({
      activeSession: null, // Guardará la NV completa
      itemsStatus: {}, // { [itemId]: { status, cantidad } }
      tiempoTranscurrido: 0,
      tiempoOcio: 0,
      
      startSession: (nv, initialStatus) => set({
        activeSession: nv,
        itemsStatus: initialStatus,
        tiempoTranscurrido: 0,
        tiempoOcio: 0
      }),

      updateItemStatus: (itemId, status, cantidad) => set((state) => ({
        itemsStatus: {
          ...state.itemsStatus,
          [itemId]: { status, cantidad, locked: state.itemsStatus[itemId]?.locked }
        }
      })),

      updateTime: (transcurrido, ocio) => set({
        tiempoTranscurrido: transcurrido,
        tiempoOcio: ocio
      }),

      completePicking: () => set({ activeSession: null, itemsStatus: {}, tiempoTranscurrido: 0, tiempoOcio: 0 }),
      cancelPicking: () => set({ activeSession: null, itemsStatus: {}, tiempoTranscurrido: 0, tiempoOcio: 0 })
    }),
    {
      name: 'picking-session', // Persiste en localStorage
      partialize: (state) => ({ 
        activeSession: state.activeSession,
        itemsStatus: state.itemsStatus,
        tiempoTranscurrido: state.tiempoTranscurrido,
        tiempoOcio: state.tiempoOcio
      }),
    }
  )
);
