'use client'

import Image from 'next/image';
import Link from 'next/link';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function VehicleCard({ veiculo }) {
  const hasImage = veiculo.imagens?.[0];
  const status = veiculo.status?.toLowerCase();

  return (
    <Link href={`/${veiculo.id}`} className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-800">
        {hasImage ? (
          <Image
            src={veiculo.imagens[0]}
            alt={veiculo.modelo || 'Veículo sem nome'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
            <PhotoIcon className="h-12 w-12 text-gray-600" />
            {status === 'rascunho' && (
              <span className="text-sm text-gray-500">Rascunho</span>
            )}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status Badge */}
        {status && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded backdrop-blur-sm
              ${status === 'ativo' ? 'bg-green-500/50 text-white' : ''}
              ${status === 'rascunho' ? 'bg-gray-500/50 text-white' : ''}
              ${status === 'revisao' ? 'bg-yellow-500/50 text-white' : ''}
              ${status === 'reprovado' ? 'bg-red-500/50 text-white' : ''}
              ${status === 'vendido' ? 'bg-blue-500/50 text-white' : ''}
            `}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {veiculo.marca && (
            <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded backdrop-blur-sm">
              {veiculo.marca}
            </span>
          )}
          {veiculo.ano && (
            <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded backdrop-blur-sm">
              {veiculo.ano}
            </span>
          )}
        </div>

        {/* Informações */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {veiculo.modelo || (status === 'rascunho' ? 'Novo Anúncio' : 'Sem título')}
          </h3>
          {veiculo.preco && (
            <p className="text-sm font-medium text-white">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(veiculo.preco)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
} 