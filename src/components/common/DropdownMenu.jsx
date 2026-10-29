import React from 'react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

export function DropdownMenu({ trigger, children, align = 'end', className }) {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>{trigger}</RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content
          align={align}
          sideOffset={8}
          className={clsx(
            'z-50 min-w-[12rem] rounded-lg border border-border bg-surface p-1 text-sm text-text shadow-lg',
            className
          )}
        >
          {children}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  );
}

DropdownMenu.Item = function DropdownMenuItem({ children, className, ...props }) {
  return (
    <RadixDropdown.Item
      className={clsx(
        'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 outline-none transition data-[highlighted]:bg-surface-hover data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </RadixDropdown.Item>
  );
};

DropdownMenu.Separator = function DropdownMenuSeparator() {
  return <RadixDropdown.Separator className="my-1 h-px bg-border" />;
};

DropdownMenu.Label = function DropdownMenuLabel({ children }) {
  return (
    <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-text-faint">
      {children}
    </div>
  );
};

export default DropdownMenu;
