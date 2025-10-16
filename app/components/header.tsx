"use client";

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">
          Budget Tracker
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/accounts">Account</Link>
            </li>
            <li>
              <Link href="/user">User</Link>
            </li>
            <li>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-white hover:underline">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
