'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from './UserAvatar';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.email === 'admin@garage16.com';

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-gray-900 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-white text-2xl font-bold">GARAGE</span>
              <span className="text-orange-500 text-2xl font-bold">16</span>
            </Link>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/veiculos" className="text-gray-300 hover:text-white px-3 py-2">
              Veículos
            </Link>
            {user && (
              <>
                <Link href="/anunciar" className="text-gray-300 hover:text-white px-3 py-2">
                  Anunciar
                </Link>
                <Link href="/meus-anuncios" className="text-gray-300 hover:text-white px-3 py-2">
                  Meus Anúncios
                </Link>
                <Link href="/meus-agendamentos" className="text-gray-300 hover:text-white px-3 py-2">
                  Meus Agendamentos
                </Link>
              </>
            )}
            {isAdmin && (
              <>
                <Link href="/admin/anuncios" className="text-orange-500 hover:text-orange-400 px-3 py-2">
                  Admin: Anúncios
                </Link>
                <Link href="/admin/agendamentos" className="text-orange-500 hover:text-orange-400 px-3 py-2">
                  Admin: Agendamentos
                </Link>
              </>
            )}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <UserAvatar user={user} size="sm" />
                  <span>{user.displayName || user.email}</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
              >
                Login
              </Link>
            )}
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user && (
                <div className="flex items-center space-x-2 px-3 py-2 text-gray-300">
                  <UserAvatar user={user} size="sm" />
                  <span>{user.displayName || user.email}</span>
                </div>
              )}

              <Link href="/veiculos" className="text-gray-300 hover:text-white block px-3 py-2">
                Veículos
              </Link>
              {user && (
                <>
                  <Link href="/anunciar" className="text-gray-300 hover:text-white block px-3 py-2">
                    Anunciar
                  </Link>
                  <Link href="/meus-anuncios" className="text-gray-300 hover:text-white block px-3 py-2">
                    Meus Anúncios
                  </Link>
                  <Link href="/meus-agendamentos" className="text-gray-300 hover:text-white block px-3 py-2">
                    Meus Agendamentos
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link href="/admin/anuncios" className="text-orange-500 hover:text-orange-400 block px-3 py-2">
                    Admin: Anúncios
                  </Link>
                  <Link href="/admin/agendamentos" className="text-orange-500 hover:text-orange-400 block px-3 py-2">
                    Admin: Agendamentos
                  </Link>
                </>
              )}
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full text-left bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600"
                >
                  Sair
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-left bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
} 