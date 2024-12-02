'use client'

import { useState, useMemo } from 'react';
import VehicleCard from '@/components/VehicleCard';
import { mockAnuncios, STATUS_ANUNCIO } from '@/mocks/anuncios';
import Breadcrumb from '@/components/Breadcrumb';

export default function VeiculosPage() {
  const [filtros, setFiltros] = useState({
    marca: '',
    anoMin: '',
    anoMax: '',
    precoMin: '',
    precoMax: ''
  });

  // Extrair dados únicos do mock para os filtros
  const dadosFiltros = useMemo(() => {
    const anuncios = mockAnuncios.publicados.filter(a => a.status === STATUS_ANUNCIO.VENDENDO);
    
    const marcas = [...new Set(anuncios.map(a => a.marca))].sort();
    const anos = anuncios.map(a => a.ano);
    const precos = anuncios.map(a => a.preco);
    
    return {
      marcas,
      anoMin: Math.min(...anos),
      anoMax: Math.max(...anos),
      precoMin: Math.min(...precos),
      precoMax: Math.max(...precos)
    };
  }, []);

  // Filtrar veículos
  const veiculos = useMemo(() => {
    return mockAnuncios.publicados.filter(anuncio => {
      if (anuncio.status !== STATUS_ANUNCIO.VENDENDO) return false;

      const matchMarca = !filtros.marca || 
        anuncio.marca?.toLowerCase() === filtros.marca.toLowerCase();

      const matchAnoMin = !filtros.anoMin || 
        anuncio.ano >= parseInt(filtros.anoMin);

      const matchAnoMax = !filtros.anoMax || 
        anuncio.ano <= parseInt(filtros.anoMax);

      const matchPrecoMin = !filtros.precoMin || 
        anuncio.preco >= parseInt(filtros.precoMin);

      const matchPrecoMax = !filtros.precoMax || 
        anuncio.preco <= parseInt(filtros.precoMax);

      return matchMarca && matchAnoMin && matchAnoMax && matchPrecoMin && matchPrecoMax;
    });
  }, [filtros]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Veículos' }
  ];

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex gap-8 p-6">
          {/* Sidebar com Filtros */}
          <div className="w-64 flex-shrink-0 space-y-6">
            <div className="bg-gray-800 rounded-lg p-4 space-y-6">
              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Marca
                </label>
                <select
                  value={filtros.marca}
                  onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
                  className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option key="todas" value="">Todas as marcas</option>
                  {dadosFiltros.marcas.map(marca => (
                    <option key={`marca-${marca}`} value={marca}>{marca}</option>
                  ))}
                </select>
              </div>

              {/* Ano */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Ano
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filtros.anoMin}
                    onChange={(e) => setFiltros({...filtros, anoMin: e.target.value})}
                    placeholder="Min"
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="number"
                    value={filtros.anoMax}
                    onChange={(e) => setFiltros({...filtros, anoMax: e.target.value})}
                    placeholder="Max"
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Preço
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={filtros.precoMin}
                    onChange={(e) => setFiltros({...filtros, precoMin: e.target.value})}
                    placeholder="Mínimo"
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="number"
                    value={filtros.precoMax}
                    onChange={(e) => setFiltros({...filtros, precoMax: e.target.value})}
                    placeholder="Máximo"
                    className="w-full bg-gray-700 border-gray-600 text-gray-100 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Botão Limpar */}
              <button
                onClick={() => setFiltros({
                  marca: '',
                  anoMin: '',
                  anoMax: '',
                  precoMin: '',
                  precoMax: ''
                })}
                className="w-full bg-gray-700 text-gray-200 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Grid de Veículos */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {veiculos.map((veiculo) => (
                <VehicleCard 
                  key={`vehicle-${veiculo.id}`}
                  veiculo={veiculo} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 