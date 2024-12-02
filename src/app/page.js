'use client'

import VehicleCard from '@/components/VehicleCard';
import { mockAnuncios, STATUS_ANUNCIO } from '@/mocks/anuncios';

export default function Home() {
  const veiculos = mockAnuncios.publicados.filter(a => a.status === STATUS_ANUNCIO.VENDENDO);

  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {veiculos.map((veiculo) => (
          <VehicleCard 
            key={`vehicle-${veiculo.id}`}
            veiculo={veiculo} 
          />
        ))}
      </div>
    </main>
  );
} 