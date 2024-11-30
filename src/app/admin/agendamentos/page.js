'use client'

import { useState } from 'react';
import Image from 'next/image';

export default function AdminAgendamentos() {
  const [agendamentos] = useState([
    {
      id: 1,
      veiculo: {
        id: 1,
        modelo: 'Honda Civic',
        marca: 'Honda',
        ano: 2020,
        imageUrl: '/images/civic.jpg',
      },
      comprador: {
        nome: 'Pedro Oliveira',
        email: 'pedro@email.com',
        telefone: '(11) 98765-4321'
      },
      vendedor: {
        nome: 'João Silva',
        email: 'joao@email.com'
      },
      data: '2024-03-20',
      horario: '10:00',
      status: 'confirmado'
    },
    {
      id: 2,
      veiculo: {
        id: 2,
        modelo: 'Toyota Corolla',
        marca: 'Toyota',
        ano: 2021,
        imageUrl: '/images/corolla.jpg',
      },
      comprador: {
        nome: 'Ana Santos',
        email: 'ana@email.com',
        telefone: '(11) 98888-7777'
      },
      vendedor: {
        nome: 'Maria Santos',
        email: 'maria@email.com'
      },
      data: '2024-03-21',
      horario: '14:00',
      status: 'pendente'
    }
  ]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-900 text-green-300';
      case 'pendente':
        return 'bg-yellow-900 text-yellow-300';
      case 'cancelado':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Agendamentos</h1>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Comprador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Data/Hora
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
              {agendamentos.map((agendamento) => (
                <tr key={agendamento.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 relative flex-shrink-0">
                        <Image
                          src={agendamento.veiculo.imageUrl}
                          alt={agendamento.veiculo.modelo}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-100">
                          {agendamento.veiculo.marca} {agendamento.veiculo.modelo}
                        </div>
                        <div className="text-sm text-gray-400">
                          {agendamento.veiculo.ano}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-100">{agendamento.comprador.nome}</div>
                    <div className="text-sm text-gray-400">{agendamento.comprador.email}</div>
                    <div className="text-sm text-gray-400">{agendamento.comprador.telefone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-100">{agendamento.vendedor.nome}</div>
                    <div className="text-sm text-gray-400">{agendamento.vendedor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div>
                      {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div>{agendamento.horario}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(agendamento.status)}`}>
                      {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-400 hover:text-orange-300 transition-colors">
                      Detalhes
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