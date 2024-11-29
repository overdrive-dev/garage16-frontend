'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Drawer from './Drawer';
import UserDropdown from './UserDropdown';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="text-[#FD4308] uppercase font-bold text-2xl">
              <span className="text-white">Garage</span>16
            </Link>

            {/* Busca - Versão Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar motos..."
                  className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FD4308]"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`hover:text-[#FD4308] transition-colors ${
                  pathname === '/' ? 'text-[#FD4308]' : 'text-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                href="/sobre"
                className={`hover:text-[#FD4308] transition-colors ${
                  pathname === '/sobre' ? 'text-[#FD4308]' : 'text-gray-300'
                }`}
              >
                Sobre
              </Link>

              {user ? (
                <UserDropdown />
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-[#FD4308] hover:bg-[#e63d07] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Acessar
                </Link>
              )}
            </nav>

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        user={user}
      />
    </>
  );
} 