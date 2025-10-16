import React from 'react';

export type DropdownMenuProps = { children?: React.ReactNode };
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <>{children}</>;
};

export const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const DropdownMenuContent: React.FC<{ align?: 'start' | 'end'; children?: React.ReactNode }> = ({
  align,
  children
}) => {
  return <div>{children}</div>;
};

export const DropdownMenuItem: React.FC<{ onClick?: () => void; className?: string; children?: React.ReactNode }> = ({
  children,
  onClick,
  className
}) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export const DropdownMenuSeparator: React.FC = () => (
  <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '4px 0' }} aria-label="separator" />
);

export default {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
};