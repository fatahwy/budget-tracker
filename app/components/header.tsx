"use client";

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

function isActive(path: string, current: string | null | undefined): boolean {
  return current === path;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const active = (path: string) => isActive(path, pathname);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between h-12">
        <Link href="/" className="text-xl font-bold" onClick={() => setIsOpen(false)} aria-current={active('/') ? 'page' : undefined}>
          Budget Tracker
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex" aria-label="Main">
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} aria-current={active('/dashboard') ? 'page' : undefined}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/accounts" onClick={() => setIsOpen(false)} aria-current={active('/accounts') ? 'page' : undefined}>
                Account
              </Link>
            </li>
            <li>
              <Link href="/users" onClick={() => setIsOpen(false)} aria-current={active('/users') ? 'page' : undefined}>
                User
              </Link>
            </li>
            <li>
              <button onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }} className="text-white cursor-pointer hover:underline" aria-label="Logout">
                Logout
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col items-center justify-center p-2 rounded-md text-white hover:bg-gray-700 focus:outline-none"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <span className="block w-6 h-0.5 bg-current mb-1"></span>
          <span className="block w-6 h-0.5 bg-current mb-1"></span>
          <span className="block w-6 h-0.5 bg-current"></span>
        </button>
      </div>

      {/* Mobile menu panel */}
      <div id="mobile-menu" className={`md:hidden ${isOpen ? 'block' : 'hidden'}`} aria-label="Mobile menu">
        <ul className="px-4 pt-2 pb-3 space-y-1 bg-gray-800">
          <li><Link href="/dashboard" onClick={() => setIsOpen(false)} aria-current={active('/dashboard') ? 'page' : undefined}>Dashboard</Link></li>
          <li><Link href="/accounts" onClick={() => setIsOpen(false)} aria-current={active('/accounts') ? 'page' : undefined}>Account</Link></li>
          <li><Link href="/users" onClick={() => setIsOpen(false)} aria-current={active('/users') ? 'page' : undefined}>User</Link></li>
          <li>
            <button
              onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }}
              className="w-full text-left text-white hover:underline"
              aria-label="Logout"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}
