const ModuleUiBoundary = ({ runtime, children }) => (
  <div
    data-ui-module={runtime.id}
    data-ui-version={runtime.enabled ? '2' : 'legacy'}
    className={runtime.enabled ? `cco-module-v2 cco-module-${runtime.id}` : undefined}
  >
    {children}
  </div>
);

export default ModuleUiBoundary;
