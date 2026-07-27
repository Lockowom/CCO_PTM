export function createQueryKeyFactory(scope) {
  return {
    all: () => [scope],
    list: (filters = {}) => [scope, 'list', filters],
    detail: (id) => [scope, 'detail', id],
    action: (action, payload = {}) => [scope, action, payload]
  };
}
