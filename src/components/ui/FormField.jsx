// PR-012 · FormField (TXT 03 §9). Label + input + helper + error en un solo
// contenedor para formularios consistentes.

import { useId } from 'react';

const FormField = ({
  label,
  htmlFor,
  error = null,
  helper = null,
  required = false,
  className = '',
  children,
}) => {
  const autoId = useId();
  const id = htmlFor || autoId;
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-300">
          {label}
          {required && <span className="text-brand-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : (
        helper && <p className="text-xs text-slate-500">{helper}</p>
      )}
    </div>
  );
};

export default FormField;