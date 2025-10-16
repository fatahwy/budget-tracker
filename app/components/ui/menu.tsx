import React from 'react';

type MenuContextType = { open: boolean; setOpen: (v: boolean) => void; };
const MenuContext = React.createContext<MenuContextType | null>(null);

export const Menu: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </MenuContext.Provider>
  );
};

export const MenuTrigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const ctx = React.useContext(MenuContext);
  if (!ctx) return <>{children}</>;
  // Use a wrapper to attach the click handler without mutating child props types
  return (
    <div onClick={() => ctx.setOpen(!ctx.open)} aria-expanded={ctx.open} role="button" style={{ display: 'inline-block' }}>
      {children}
    </div>
  );
};

export const MenuContent: React.FC<{ align?: 'start' | 'end'; children?: React.ReactNode }> = ({
  align = 'start',
  children
}) => {
  const ctx = React.useContext(MenuContext);
  if (!ctx || !ctx.open) return null;
  const positionClass = align === 'start' ? 'left-0' : 'right-0';
  return (
    <div
      className={`absolute z-10 mt-2 w-48 rounded-md bg-white shadow-md border border-gray-200 ${positionClass}`}
      role="menu"
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

type MenuItemProps = React.PropsWithChildren<{ onClick?: () => void; className?: string }>;

export const MenuItem: React.FC<MenuItemProps> = ({ children, onClick, className = '' }) => {
  const ctx = React.useContext(MenuContext);
  const handleClick = () => {
    if (onClick) onClick();
    if (ctx) ctx.setOpen(false);
  };
  return (
    <button onClick={handleClick} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${className}`} role="menuitem">
      {children}
    </button>
  );
};

export const MenuSeparator: React.FC = () => <div className="h-px bg-gray-200 my-1" role="separator" />;

export default Menu;