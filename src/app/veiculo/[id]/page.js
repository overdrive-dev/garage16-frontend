'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function VehicleDetails({ params }) {
  const [veiculo] = useState({
    id: params.id,
    modelo: 'Honda Civic',
    marca: 'Honda',
    ano: 2020,
    kilometragem: 45000,
    preco: 98000,
    descricao: 'Veículo em excelente estado, único dono, todas as revisões feitas na concessionária.',
    imageUrl: '/images/civic.jpg',
    disponibilidade: {
      diasSemana: ['Quarta-feira'],
      horarios: ['09:00', '10:00', '11:00', '12:00', '13:00']
    }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="relative h-96">
            <Image
              src={veiculo.imageUrl}
              alt={veiculo.modelo}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">{veiculo.modelo}</h1>
              <p className="text-gray-400">{veiculo.marca} - {veiculo.ano}</p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400">Kilometragem: {veiculo.kilometragem} km</p>
              <p className="text-3xl font-bold text-orange-500">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(veiculo.preco)}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-100">Descrição</h2>
              <p className="text-gray-400">{veiculo.descricao}</p>
            </div>

            <Link 
              href={`/agendar/${veiculo.id}`}
              className="block w-full bg-orange-500 text-white text-center py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors"
            >
              Agendar Visita
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 