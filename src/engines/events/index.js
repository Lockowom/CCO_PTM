export function createDomainEvent(type, payload = {}, meta = {}) {
  return {
    type,
    payload,
    meta: {
      createdAt: new Date().toISOString(),
      ...meta
    }
  };
}

export function buildNotificationJob(event, channel = 'in-app') {
  return {
    channel,
    title: event.meta?.title || event.type,
    message: event.meta?.message || '',
    payload: event.payload || {}
  };
}
