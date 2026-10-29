import React from 'react';
import clsx from 'clsx';

export function ErrorBanner({ children, className }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={clsx(
        'mb-4 rounded-lg border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger',
        className
      )}
    >
      {children}
    </div>
  );
}

export default ErrorBanner;
