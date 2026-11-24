import React from 'react';
import clsx from 'clsx';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-border bg-surface shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }) {
  return (
    <div className={clsx('border-b border-border px-4 py-3', className)}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className }) {
  return <div className={clsx('p-4', className)}>{children}</div>;
};

export default Card;
