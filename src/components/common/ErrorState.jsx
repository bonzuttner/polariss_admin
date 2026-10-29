import React from 'react';
import clsx from 'clsx';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Button } from './Button.jsx';

export function ErrorState({ message = 'データの取得に失敗しました', onRetry, className }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/30 bg-danger-bg px-6 py-12 text-center',
        className
      )}
    >
      <FaExclamationTriangle className="text-2xl text-danger" />
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          再試行
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
