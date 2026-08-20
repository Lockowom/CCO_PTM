const FormSection = ({ title, description, actions, children, className = '' }) => (
  <section
    className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:p-5 ${className}`}
  >
    <header className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-semibold text-slate-100">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      {actions}
    </header>
    {children}
  </section>
);

export default FormSection;
