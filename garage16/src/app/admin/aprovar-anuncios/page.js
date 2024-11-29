'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminRoute from '@/middleware/adminRoute';

const STATUS_COLORS = {
  'pendente': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'aprovado': 'bg-green-500/10 text-green-500 border-green-500/20',
  'rejeitado': 'bg-red-500/10 text-red-500 border-red-500/20'
};

export default function AprovarAnuncios() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [anuncioSelecionado, setAnuncioSelecionado] = useState(null);

  useEffect(() => {
    fetchAnuncios();
  }, []);

  const fetchAnuncios = async () => {
    try {
      const response = await fetch('/api/motos/pendentes');
      if (!response.ok) throw new Error('Erro ao carregar anúncios');
      const data = await response.json();
      setAnuncios(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (id) => {
    try {
      const response = await fetch(`/api/motos/${id}/aprovar`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Erro ao aprovar anúncio');

      setAnuncios(anuncios.filter(anuncio => anuncio.id !== id));
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao aprovar anúncio');
    }
  };

  const handleRejeitar = async () => {
    if (!anuncioSelecionado || !motivoRejeicao) return;

    try {
      const response = await fetch(`/api/motos/${anuncioSelecionado.id}/rejeitar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo: motivoRejeicao })
      });

      if (!response.ok) throw new Error('Erro ao rejeitar anúncio');

      setAnuncios(anuncios.filter(anuncio => anuncio.id !== anuncioSelecionado.id));
      setAnuncioSelecionado(null);
      setMotivoRejeicao('');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao rejeitar anúncio');
    }
  };

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Aprovar Anúncios</h1>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FD4308]"></div>
          </div>
        ) : anuncios.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">Não há anúncios pendentes de aprovação.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {anuncios.map((anuncio) => (
              <div
                key={anuncio.id}
                className="bg-gray-800 rounded-lg p-6"
              >
                <div className="flex gap-6">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Image
                      src={anuncio.imagens[0]}
                      alt={anuncio.titulo}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{anuncio.titulo}</h2>
                        <p className="text-[#FD4308] font-bold text-lg">{anuncio.preco}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[anuncio.status]}`}>
                        {anuncio.status.charAt(0).toUpperCase() + anuncio.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-400">
                      <p>Ano: {anuncio.ano}</p>
                      <p>KM: {anuncio.km}</p>
                      <p>Cor: {anuncio.cor}</p>
                    </div>

                    <p className="mt-4 text-gray-300">{anuncio.descricao}</p>

                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={() => handleAprovar(anuncio.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => setAnuncioSelecionado(anuncio)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Rejeição */}
        {anuncioSelecionado && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Motivo da Rejeição</h3>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                className="w-full bg-gray-900 rounded p-3 text-white mb-4"
                rows={4}
                placeholder="Descreva o motivo da rejeição..."
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setAnuncioSelecionado(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRejeitar}
                  disabled={!motivoRejeicao}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminRoute>
  );
} 