'use client'

import Image from 'next/image';
import Link from 'next/link';

export default function VehicleCard({ veiculo }) {
  return (
    <Link href={`/${veiculo.id}`} className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={veiculo.imageUrl}
          alt={veiculo.modelo}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded backdrop-blur-sm">
            {veiculo.marca}
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded backdrop-blur-sm">
            {veiculo.ano}
          </span>
        </div>

        {/* Informações */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {veiculo.modelo}
          </h3>
          <p className="text-sm font-medium text-white">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(veiculo.preco)}
          </p>
        </div>
      </div>
    </Link>
  );
} 