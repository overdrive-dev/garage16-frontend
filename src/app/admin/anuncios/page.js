'use client'

import { useState } from 'react';
import Image from 'next/image';

export default function AdminAnuncios() {
  const [anuncios] = useState([
    {
      id: 1,
      modelo: 'Honda Civic',
      marca: 'Honda',
      ano: 2020,
      preco: 98000,
      status: 'pendente',
      imageUrl: '/images/civic.jpg',
      vendedor: {
        nome: 'João Silva',
        email: 'joao@email.com'
      },
      createdAt: '2024-03-15T10:00:00'
    },
    {
      id: 2,
      modelo: 'Toyota Corolla',
      marca: 'Toyota',
      ano: 2021,
      preco: 105000,
      status: 'pendente',
      imageUrl: '/images/corolla.jpg',
      vendedor: {
        nome: 'Maria Santos',
        email: 'maria@email.com'
      },
      createdAt: '2024-03-16T14:30:00'
    }
  ]);

  const handleAprovar = (id) => {
    // Implementar lógica de aprovação
    console.log('Aprovar anúncio:', id);
  };

  const handleRejeitar = (id) => {
    // Implementar lógica de rejeição
    console.log('Rejeitar anúncio:', id);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Aprovação de Anúncios</h1>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Preço
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
                          {anuncio.marca} {anuncio.modelo}
                        </div>
                        <div className="text-sm text-gray-400">
                          {anuncio.ano}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-100">{anuncio.vendedor.nome}</div>
                    <div className="text-sm text-gray-400">{anuncio.vendedor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(anuncio.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(anuncio.preco)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-green-400 hover:text-green-300 mr-4 transition-colors"
                      onClick={() => handleAprovar(anuncio.id)}
                    >
                      Aprovar
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => handleRejeitar(anuncio.id)}
                    >
                      Rejeitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 