import React from 'react';
import clsx from 'clsx';
import { Spinner } from './Button.jsx';

export function PageLoader({ label = '読み込み中...', className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 py-16 text-text-muted', className)}>
      <Spinner className="h-7 w-7 text-primary" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export default PageLoader;
