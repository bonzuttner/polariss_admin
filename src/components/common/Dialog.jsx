import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { FaTimes } from 'react-icons/fa';
import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Dialog({ open, onOpenChange, size = 'md', children, className }) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" />
        <RadixDialog.Content
          className={clsx(
            'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface text-text shadow-2xl focus:outline-none',
            SIZE_CLASSES[size],
            className
          )}
        >
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

Dialog.Header = function DialogHeader({ children, onClose, showClose = true }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
      <RadixDialog.Title className="text-base font-semibold text-text">
        {children}
      </RadixDialog.Title>
      {showClose && (
        <RadixDialog.Close asChild>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <FaTimes size={14} />
          </button>
        </RadixDialog.Close>
      )}
    </div>
  );
};

Dialog.Body = function DialogBody({ children, className }) {
  return <div className={clsx('px-5 py-4 text-sm text-text', className)}>{children}</div>;
};

Dialog.Footer = function DialogFooter({ children, className }) {
  return (
    <div
      className={clsx(
        'flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Dialog;
