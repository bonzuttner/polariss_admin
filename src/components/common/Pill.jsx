import React from 'react';
import clsx from 'clsx';

const TONES = {
  muted: 'bg-surface-hover text-text-muted border-border',
  primary: 'bg-primary/10 text-primary border-primary/30',
  success: 'bg-success-bg text-success border-success/30',
  warning: 'bg-warning-bg text-warning border-warning/30',
  danger: 'bg-danger-bg text-danger border-danger/30',
};

export function Pill({ tone = 'muted', className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex min-w-[4.5rem] items-center justify-center rounded-full border px-3 py-1 text-xs font-medium',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Pill;
