export function createQueryKeyFactory(scope) {
  return {
    all: () => [scope],
    list: (filters = {}) => [scope, 'list', filters],
    detail: (id) => [scope, 'detail', id],
    action: (action, payload = {}) => [scope, action, payload]
  };
}

// TXT 02 §15 · catálogo compartido. Los módulos legacy pueden seguir creando
// factories locales, pero las nuevas superficies deben consumir estas claves.
export const QUERY_KEYS = Object.freeze({
  nv: createQueryKeyFactory('nv'),
  dashboard: createQueryKeyFactory('dashboard'),
  routes: createQueryKeyFactory('routes'),
  tmsOrders: createQueryKeyFactory('tms-orders'),
  reception: createQueryKeyFactory('reception'),
  inventorySession: createQueryKeyFactory('inventory-session'),
  qualityCase: createQueryKeyFactory('quality-case')
});
