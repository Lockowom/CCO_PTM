export function normalizeFormSchema(schema = []) {
  return schema.map((field) => ({
    visible: true,
    required: false,
    defaultValue: '',
    ...field
  }));
}

export function evaluateFieldVisibility(field, values = {}) {
  if (typeof field.visibleWhen !== 'function') return field.visible !== false;
  return Boolean(field.visibleWhen(values));
}
