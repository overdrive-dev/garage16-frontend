'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_COLORS = {
  'pendente': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'aprovado': 'bg-green-500/10 text-green-500 border-green-500/20',
  'rejeitado': 'bg-red-500/10 text-red-500 border-red-500/20',
  'disponivel': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'vendida': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  'reservada': 'bg-purple-500/10 text-purple-500 border-purple-500/20'
};

const STATUS_LABELS = {
  'pendente': 'Aguardando Aprovação',
  'aprovado': 'Aprovado',
  'rejeitado': 'Rejeitado',
  'disponivel': 'Disponível',
  'vendida': 'Vendida',
  'reservada': 'Reservada'
};

export default function MinhasMotos() {
  const { user } = useAuth();
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMotos();
  }, []);

  const fetchMotos = async () => {
    try {
      const response = await fetch('/api/motos/minhas', {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao carregar motos');
      
      const data = await response.json();
      setMotos(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Motos</h1>
        <Link
          href="/minhas-motos/nova"
          className="bg-[#FD4308] hover:bg-[#e63d07] text-white px-4 py-2 rounded-lg transition-colors"
        >
          Anunciar Moto
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FD4308]"></div>
        </div>
      ) : motos.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-4">Você ainda não tem nenhuma moto anunciada.</p>
          <Link
            href="/minhas-motos/nova"
            className="text-[#FD4308] hover:text-[#e63d07] font-semibold"
          >
            Anunciar minha primeira moto
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {motos.map((moto) => (
            <div
              key={moto.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="relative w-32 h-32 flex-shrink-0">
                <Image
                  src={moto.imagens[0]}
                  alt={moto.titulo}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{moto.titulo}</h2>
                    <p className="text-[#FD4308] font-bold">{moto.preco}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[moto.status]}`}>
                    {STATUS_LABELS[moto.status]}
                  </span>
                </div>
                
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-400">
                  <p>Ano: {moto.ano}</p>
                  <p>KM: {moto.km}</p>
                  <p>Cor: {moto.cor}</p>
                </div>

                {moto.statusMotivo && (
                  <div className="mt-2 text-sm text-red-400">
                    Motivo: {moto.statusMotivo}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <Link
                  href={`/minhas-motos/${moto.id}`}
                  className="text-[#FD4308] hover:text-[#e63d07]"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 