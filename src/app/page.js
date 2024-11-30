'use client'

import { useState } from 'react';
import VehicleCard from '@/components/VehicleCard';

export default function Home() {
  const [filtros, setFiltros] = useState({
    marca: '',
    anoMin: '',
    anoMax: '',
    precoMin: '',
    precoMax: ''
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filtros */}
      <div className="mb-8 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Marca"
            className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
          />
          <input
            type="number"
            placeholder="Ano Mín"
            className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setFiltros({...filtros, anoMin: e.target.value})}
          />
          <input
            type="number"
            placeholder="Ano Máx"
            className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setFiltros({...filtros, anoMax: e.target.value})}
          />
          <input
            type="number"
            placeholder="Preço Mín"
            className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setFiltros({...filtros, precoMin: e.target.value})}
          />
          <input
            type="number"
            placeholder="Preço Máx"
            className="bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 border rounded p-2 focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => setFiltros({...filtros, precoMax: e.target.value})}
          />
        </div>
      </div>

      {/* Grid de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Aqui virão os cards de veículos */}
      </div>
    </main>
  );
} 