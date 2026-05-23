import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const resetState = { activeSession: null, itemsStatus: {}, tiempoTranscurrido: 0, tiempoOcio: 0 };

export const usePickingStore = create(
  persist(
    (set) => ({
      ...resetState,

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

      endSession: () => set(resetState),
    }),
    {
      name: 'picking-session',
      partialize: (state) => ({
        activeSession: state.activeSession,
        itemsStatus: state.itemsStatus,
        tiempoTranscurrido: state.tiempoTranscurrido,
        tiempoOcio: state.tiempoOcio
      }),
    }
  )
);

// Selectores granulares para evitar re-renders innecesarios
export const useActiveSession = () => usePickingStore(s => s.activeSession);
export const useItemsStatus = () => usePickingStore(s => s.itemsStatus);
export const usePickingTime = () => usePickingStore(s => ({ tiempo: s.tiempoTranscurrido, ocio: s.tiempoOcio }));
export const usePickingActions = () => usePickingStore(s => ({
  startSession: s.startSession,
  updateItemStatus: s.updateItemStatus,
  updateTime: s.updateTime,
  endSession: s.endSession,
}));
