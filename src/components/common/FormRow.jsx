import React from 'react';
import clsx from 'clsx';

export function FormRow({ label, htmlFor, children, className }) {
  return (
    <div
      className={clsx(
        'grid grid-cols-1 gap-1.5 sm:grid-cols-[9rem_1fr] sm:items-center sm:gap-4',
        className
      )}
    >
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-muted">
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

export default FormRow;
