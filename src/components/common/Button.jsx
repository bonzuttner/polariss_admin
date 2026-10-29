import React from 'react';
import clsx from 'clsx';

const VARIANTS = {
  primary: 'border border-primary bg-primary text-primary-fg hover:bg-primary-hover hover:border-primary-hover',
  outline: 'border border-primary bg-transparent text-primary hover:bg-primary/10',
  secondary: 'border border-border bg-surface-hover text-text hover:bg-border-strong/40',
  danger: 'border border-danger bg-danger text-white hover:opacity-90',
  'outline-danger': 'border border-danger bg-transparent text-danger hover:bg-danger/10',
  success: 'border border-success bg-success text-white hover:opacity-90',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export function Spinner({ className }) {
  return (
    <span
      className={clsx(
        'inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
    />
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export default Button;
