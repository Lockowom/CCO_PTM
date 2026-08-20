/** Decisión pura y testeable para asegurar que FLAG=true activa el runtime V2. */
export function resolveShellRuntime({ webShellEnabled = false } = {}) {
  return webShellEnabled ? 'v2' : 'legacy';
}

export default resolveShellRuntime;
