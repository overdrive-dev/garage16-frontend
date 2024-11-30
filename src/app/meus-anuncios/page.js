'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function MeusAnuncios() {
  const [anuncios, setAnuncios] = useState([
    {
      id: 1,
      modelo: 'Honda Civic',
      ano: 2020,
      preco: 98000,
      status: 'aprovado',
      imageUrl: '/images/civic.jpg',
    },
    {
      id: 2,
      modelo: 'Toyota Corolla',
      ano: 2021,
      preco: 105000,
      status: 'pendente',
      imageUrl: '/images/corolla.jpg',
    }
  ]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    anuncioId: null
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-900 text-green-300';
      case 'pendente':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  const handleDelete = (id) => {
    setDeleteModal({
      isOpen: true,
      anuncioId: id
    });
  };

  const confirmDelete = async () => {
    try {
      // Implementar lógica de exclusão
      console.log('Excluindo anúncio:', deleteModal.anuncioId);
      setAnuncios(prev => prev.filter(a => a.id !== deleteModal.anuncioId));
    } catch (error) {
      console.error('Erro ao excluir:', error);
    } finally {
      setDeleteModal({ isOpen: false, anuncioId: null });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Meus Anúncios</h1>
        <Link
          href="/anunciar"
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          Novo Anúncio
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Ano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {anuncios.map((anuncio) => (
                <tr key={anuncio.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 relative flex-shrink-0">
                        <Image
                          src={anuncio.imageUrl}
                          alt={anuncio.modelo}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-100">
                          {anuncio.modelo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {anuncio.ano}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(anuncio.preco)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(anuncio.status)}`}>
                      {anuncio.status.charAt(0).toUpperCase() + anuncio.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/anuncio/editar/${anuncio.id}`}
                      className="text-orange-400 hover:text-orange-300 mr-4 transition-colors"
                    >
                      Editar
                    </Link>
                    <button 
                      onClick={() => handleDelete(anuncio.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, anuncioId: null })}
        onConfirm={confirmDelete}
        title="Excluir Anúncio"
        message="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
      />
    </main>
  );
} 