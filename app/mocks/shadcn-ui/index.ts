import React from 'react';

export type DropdownMenuProps = { children?: React.ReactNode };
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

export const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children?: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

export const DropdownMenuContent: React.FC<{ align?: 'start' | 'end'; children?: React.ReactNode }> = ({
  children
}) => {
  return React.createElement('div', null, children);
};

export const DropdownMenuItem: React.FC<{ onClick?: () => void; className?: string; children?: React.ReactNode }> = ({
  children,
  onClick,
  className
}) => {
  return React.createElement('button', { onClick: onClick, className: className }, children);
};

export const DropdownMenuSeparator: React.FC = () => React.createElement('div', { style: { height: 1, backgroundColor: '#e5e7eb', margin: '4px 0' }, 'aria-label': 'separator' });

export default {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
};