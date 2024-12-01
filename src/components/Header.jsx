'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from './UserAvatar';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const isAdmin = user?.email === 'admin@garage16.com';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/veiculos?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchModalOpen(false);
      setSearchTerm('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para formatar o nome do usuário
  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.displayName) {
      // Pega apenas o primeiro nome
      return user.displayName.split(' ')[0];
    }
    // Se não tiver displayName, usa a parte antes do @ do email
    return user.email.split('@')[0];
  };

  return (
    <header className="bg-gray-900 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-white text-2xl font-bold">GARAGE</span>
              <span className="text-orange-500 text-2xl font-bold">16</span>
            </Link>
          </div>

          {/* Busca Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar veículos..."
                  className="w-full bg-gray-800 text-gray-100 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 px-4 text-gray-400 hover:text-white"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <Link 
                href="/anunciar" 
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Anunciar Veículo
              </Link>
            )}
            
            {isAdmin && (
              <>
                <Link href="/admin/anuncios" className="text-orange-500 hover:text-orange-400 px-3 py-2 transition-colors">
                  Admin: Anúncios
                </Link>
                <Link href="/admin/agendamentos" className="text-orange-500 hover:text-orange-400 px-3 py-2 transition-colors">
                  Admin: Agendamentos
                </Link>
              </>
            )}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 transition-colors group"
                >
                  <UserAvatar user={user} size="sm" />
                  <span>{getUserDisplayName()}</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 py-1 z-[100]">
                    <Link
                      href="/perfil/editar"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Editar Perfil
                    </Link>
                    <Link
                      href="/meus-anuncios"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Meus Anúncios
                    </Link>
                    <Link
                      href="/meus-agendamentos"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Agendamentos
                    </Link>
                    <Link
                      href="/perfil/disponibilidade"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Disponibilidade
                    </Link>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="text-gray-300 hover:text-white p-2"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
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
                  <span>{getUserDisplayName()}</span>
                </div>
              )}

              {user && (
                <>
                  <Link href="/anunciar" className="bg-orange-500 text-white block px-3 py-2 rounded-md hover:bg-orange-600 transition-colors">
                    Anunciar Veículo
                  </Link>
                  <Link href="/perfil/editar" className="text-gray-300 hover:text-white block px-3 py-2 transition-colors">
                    Editar Perfil
                  </Link>
                  <Link href="/meus-anuncios" className="text-gray-300 hover:text-white block px-3 py-2 transition-colors">
                    Meus Anúncios
                  </Link>
                  <Link href="/meus-agendamentos" className="text-gray-300 hover:text-white block px-3 py-2 transition-colors">
                    Agendamentos
                  </Link>
                  <Link href="/perfil/disponibilidade" className="text-gray-300 hover:text-white block px-3 py-2 transition-colors">
                    Disponibilidade
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link href="/admin/anuncios" className="text-orange-500 hover:text-orange-400 block px-3 py-2 transition-colors">
                    Admin: Anúncios
                  </Link>
                  <Link href="/admin/agendamentos" className="text-orange-500 hover:text-orange-400 block px-3 py-2 transition-colors">
                    Admin: Agendamentos
                  </Link>
                </>
              )}
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full text-left bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Sair
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-left bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modal de Busca Mobile */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Buscar</h2>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar veículos..."
                  autoFocus
                  className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-white"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Aqui você pode adicionar sugestões de busca ou histórico */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Sugestões</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setSearchTerm('Honda Civic');
                    handleSearch({ preventDefault: () => {} });
                  }}
                  className="block w-full text-left text-gray-300 hover:text-white py-2"
                >
                  Honda Civic
                </button>
                {/* ... outras sugestões ... */}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 