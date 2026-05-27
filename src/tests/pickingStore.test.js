import { describe, it, expect, beforeEach } from 'vitest';
import { usePickingStore } from '../stores/pickingStore';

describe('pickingStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    usePickingStore.setState({
      activeSession: null,
      itemsStatus: {},
      tiempoTranscurrido: 0,
      tiempoOcio: 0,
    });
  });

  describe('startSession', () => {
    it('inicia sesión con NV e items', () => {
      const nv = { nv: '12345', cliente: 'Test Corp', items: [{ id: 1 }, { id: 2 }] };
      const initialStatus = {
        1: { status: 'PENDIENTE', cantidad: 10, locked: false },
        2: { status: 'PENDIENTE', cantidad: 5, locked: false },
      };

      usePickingStore.getState().startSession(nv, initialStatus);

      const state = usePickingStore.getState();
      expect(state.activeSession).toEqual(nv);
      expect(state.itemsStatus).toEqual(initialStatus);
      expect(state.tiempoTranscurrido).toBe(0);
      expect(state.tiempoOcio).toBe(0);
    });

    it('resetea tiempos al iniciar nueva sesión', () => {
      // Set some time first
      usePickingStore.setState({ tiempoTranscurrido: 120, tiempoOcio: 30 });

      usePickingStore.getState().startSession({ nv: '99999' }, {});

      const state = usePickingStore.getState();
      expect(state.tiempoTranscurrido).toBe(0);
      expect(state.tiempoOcio).toBe(0);
    });
  });

  describe('updateItemStatus', () => {
    it('actualiza status de un item específico', () => {
      usePickingStore.getState().startSession({ nv: '100' }, {
        'item-1': { status: 'PENDIENTE', cantidad: 10, locked: false },
        'item-2': { status: 'PENDIENTE', cantidad: 5, locked: false },
      });

      usePickingStore.getState().updateItemStatus('item-1', 'COMPLETO', 10);

      const state = usePickingStore.getState();
      expect(state.itemsStatus['item-1'].status).toBe('COMPLETO');
      expect(state.itemsStatus['item-1'].cantidad).toBe(10);
      // item-2 unchanged
      expect(state.itemsStatus['item-2'].status).toBe('PENDIENTE');
    });

    it('preserva locked state al actualizar', () => {
      usePickingStore.setState({
        itemsStatus: {
          'item-1': { status: 'PENDIENTE', cantidad: 10, locked: true },
        },
      });

      usePickingStore.getState().updateItemStatus('item-1', 'PARCIAL', 7);

      expect(usePickingStore.getState().itemsStatus['item-1'].locked).toBe(true);
    });

    it('maneja items con stock parcial (PARCIAL)', () => {
      usePickingStore.setState({
        itemsStatus: {
          'item-1': { status: 'PENDIENTE', cantidad: 10, locked: false },
        },
      });

      usePickingStore.getState().updateItemStatus('item-1', 'PARCIAL', 3);

      const item = usePickingStore.getState().itemsStatus['item-1'];
      expect(item.status).toBe('PARCIAL');
      expect(item.cantidad).toBe(3);
    });

    it('maneja SIN_STOCK correctamente', () => {
      usePickingStore.setState({
        itemsStatus: {
          'item-1': { status: 'PENDIENTE', cantidad: 10, locked: false },
        },
      });

      usePickingStore.getState().updateItemStatus('item-1', 'SIN_STOCK', 0);

      const item = usePickingStore.getState().itemsStatus['item-1'];
      expect(item.status).toBe('SIN_STOCK');
      expect(item.cantidad).toBe(0);
    });
  });

  describe('updateTime', () => {
    it('actualiza tiempos de picking', () => {
      usePickingStore.getState().updateTime(300, 45);

      const state = usePickingStore.getState();
      expect(state.tiempoTranscurrido).toBe(300);
      expect(state.tiempoOcio).toBe(45);
    });
  });

  describe('endSession', () => {
    it('resetea todo el estado al finalizar', () => {
      // Setup active session
      usePickingStore.getState().startSession(
        { nv: '12345', cliente: 'Test' },
        { 'item-1': { status: 'COMPLETO', cantidad: 10, locked: true } }
      );
      usePickingStore.getState().updateTime(500, 60);

      // End session
      usePickingStore.getState().endSession();

      const state = usePickingStore.getState();
      expect(state.activeSession).toBeNull();
      expect(state.itemsStatus).toEqual({});
      expect(state.tiempoTranscurrido).toBe(0);
      expect(state.tiempoOcio).toBe(0);
    });
  });

  describe('flujo completo picking', () => {
    it('simula flujo: iniciar → actualizar items → finalizar', () => {
      const items = {
        'p-1': { status: 'PENDIENTE', cantidad: 20, locked: false },
        'p-2': { status: 'PENDIENTE', cantidad: 15, locked: false },
        'p-3': { status: 'PENDIENTE', cantidad: 8, locked: false },
      };

      // 1. Iniciar picking
      usePickingStore.getState().startSession({ nv: 'NV-2024-001', cliente: 'Farmacia Central' }, items);
      expect(usePickingStore.getState().activeSession.nv).toBe('NV-2024-001');

      // 2. Primer item completo
      usePickingStore.getState().updateItemStatus('p-1', 'COMPLETO', 20);
      usePickingStore.getState().updateTime(45, 0);

      // 3. Segundo item parcial (solo encontró 10 de 15)
      usePickingStore.getState().updateItemStatus('p-2', 'PARCIAL', 10);
      usePickingStore.getState().updateTime(90, 5);

      // 4. Tercer item sin stock
      usePickingStore.getState().updateItemStatus('p-3', 'SIN_STOCK', 0);
      usePickingStore.getState().updateTime(120, 10);

      // Verificar estado final antes de cerrar
      const state = usePickingStore.getState();
      expect(state.itemsStatus['p-1'].status).toBe('COMPLETO');
      expect(state.itemsStatus['p-2'].status).toBe('PARCIAL');
      expect(state.itemsStatus['p-2'].cantidad).toBe(10);
      expect(state.itemsStatus['p-3'].status).toBe('SIN_STOCK');
      expect(state.tiempoTranscurrido).toBe(120);
      expect(state.tiempoOcio).toBe(10);

      // 5. Finalizar
      usePickingStore.getState().endSession();
      expect(usePickingStore.getState().activeSession).toBeNull();
    });
  });

  describe('persistencia', () => {
    it('partialize excluye funciones del estado persistido', () => {
      const store = usePickingStore;
      // The persist config should only save data, not actions
      const partialize = store.persist?.getOptions?.()?.partialize;
      if (partialize) {
        const fullState = {
          activeSession: { nv: '100' },
          itemsStatus: { 'a': { status: 'COMPLETO' } },
          tiempoTranscurrido: 50,
          tiempoOcio: 10,
          startSession: () => {},
          updateItemStatus: () => {},
          updateTime: () => {},
          endSession: () => {},
        };
        const persisted = partialize(fullState);
        expect(persisted).not.toHaveProperty('startSession');
        expect(persisted).not.toHaveProperty('endSession');
        expect(persisted).toHaveProperty('activeSession');
        expect(persisted).toHaveProperty('itemsStatus');
      }
    });
  });
});
