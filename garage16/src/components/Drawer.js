'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Drawer({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="drawer-content fixed right-0 top-0 h-full w-80 bg-gray-900 transform transition-transform duration-300 ease-in-out">
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          {user && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">Logado como</p>
              <p className="font-semibold">{user.displayName || user.email}</p>
            </div>
          )}

          <nav className="space-y-1">
            <Link
              href="/"
              onClick={onClose}
              className={`block px-4 py-2.5 rounded-lg transition-colors ${
                pathname === '/' ? 'bg-[#FD4308] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/perfil"
                  onClick={onClose}
                  className={`block px-4 py-2.5 rounded-lg transition-colors ${
                    pathname === '/perfil' ? 'bg-[#FD4308] text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Meu Perfil
                </Link>
                <Link
                  href="/meus-agendamentos"
                  onClick={onClose}
                  className={`block px-4 py-2.5 rounded-lg transition-colors ${
                    pathname === '/meus-agendamentos' ? 'bg-[#FD4308] text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Meus Agendamentos
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={onClose}
                className="block px-4 py-2.5 bg-[#FD4308] text-white rounded-lg hover:bg-[#e63d07] transition-colors"
              >
                Acessar
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
} 