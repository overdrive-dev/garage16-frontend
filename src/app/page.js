'use client'

import VehicleCard from '@/components/VehicleCard';
import { mockAnuncios, STATUS_ANUNCIO } from '@/mocks/anuncios';
import Link from 'next/link';

const MINI_BANNERS = [
  {
    id: 'sport',
    nome: 'Racing',
    descricao: 'Motos esportivas de alta performance',
    imagem: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87',
    filtros: { categoria: 'sport' }
  },
  {
    id: 'custom',
    nome: 'Custom',
    descricao: 'Softails, Dynas e Sportsters',
    imagem: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65',
    filtros: { categoria: 'custom' }
  },
  {
    id: 'naked',
    nome: 'Naked',
    descricao: 'Streetfighters e roadsters',
    imagem: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f',
    filtros: { categoria: 'naked' }
  },
  {
    id: 'touring',
    nome: 'Touring',
    descricao: 'Conforto para longas viagens',
    imagem: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc',
    filtros: { categoria: 'touring' }
  },
  {
    id: 'adventure',
    nome: 'Adventure',
    descricao: 'Preparadas para qualquer terreno',
    imagem: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8',
    filtros: { categoria: 'adventure' }
  },
  {
    id: 'classic',
    nome: 'Classic',
    descricao: 'O charme do estilo retrô',
    imagem: 'https://images.unsplash.com/photo-1558980664-769d59546b3d',
    filtros: { categoria: 'classic' }
  }
];

export default function Home() {
  const veiculos = mockAnuncios.publicados.filter(a => a.status === STATUS_ANUNCIO.VENDENDO);

  const createCategoryUrl = (filtros) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      params.append(key, value);
    });
    return `/veiculos?${params.toString()}`;
  };

  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Mini Banners */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Categorias</h2>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
          {MINI_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              href={createCategoryUrl(banner.filtros)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg"
            >
              {/* Imagem de fundo */}
              <div className="absolute inset-0">
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"
                />
                <img
                  src={banner.imagem}
                  alt={banner.nome}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Conteúdo */}
              <div className="absolute inset-0 z-20 p-3 flex flex-col justify-end">
                <h3 className="text-sm lg:text-base font-bold text-white mb-0.5">
                  {banner.nome}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2">
                  {banner.descricao}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Veículos em Destaque */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Em Destaque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {veiculos.map((veiculo) => (
            <VehicleCard 
              key={`vehicle-${veiculo.id}`}
              veiculo={veiculo} 
            />
          ))}
        </div>
      </section>

      {/* Botão Ver Mais */}
      <div className="text-center">
        <Link
          href="/veiculos"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          Ver todos os veículos
        </Link>
      </div>
    </main>
  );
} 