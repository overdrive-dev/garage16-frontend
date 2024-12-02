'use client'

import { useState } from 'react';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';

export default function VeiculoDetalhesClient({ veiculo }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Veículos', href: '/veiculos' },
    { label: veiculo.modelo }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        {/* Container do conteúdo em duas colunas */}
        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Coluna Esquerda - Fotos */}
          <div className="space-y-6">
            {/* Imagem Principal */}
            {veiculo.imagens && (
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={veiculo.imagens[selectedImage]}
                  alt={veiculo.modelo}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            )}

            {/* Galeria de Miniaturas */}
            {veiculo.imagens?.length > 0 && (
              <div className="overflow-x-auto">
                <div className="flex gap-2">
                  {veiculo.imagens.map((img, index) => (
                    <button
                      key={`thumb-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 
                        ${selectedImage === index ? 'border-orange-500' : 'border-transparent'}`}
                    >
                      <Image
                        src={img}
                        alt={`${veiculo.modelo} - Foto ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita - Informações */}
          <div className="space-y-6">
            {/* Título e Preço */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{veiculo.modelo}</h1>
              <p className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(veiculo.preco)}
              </p>
            </div>

            {/* Vistoria Info */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                Vistoria feita 10/11/12 as 00:00 por Marcos Gama na Garage16
              </p>
            </div>

            {/* Descrição */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Descrição</h2>
              <p className="text-gray-300">
                {veiculo.descricao || 'Nulla pulvinar, sapien vitae cursus pretium, ex erat convallis eros, quis viverra mi arcu sit amet est. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer convallis sapien placerat tellus accumsan dignissim.'}
              </p>
            </div>

            {/* Especificações */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Marca</p>
                <p className="text-gray-200">{veiculo.marca}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Modelo</p>
                <p className="text-gray-200">{veiculo.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Ano</p>
                <p className="text-gray-200">{veiculo.ano}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Cor</p>
                <p className="text-gray-200">{veiculo.cor || 'Não informada'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Km</p>
                <p className="text-gray-200">{veiculo.km || 'Não informada'}</p>
              </div>
            </div>

            {/* Botão de Contato */}
            <button className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Entra em contato com a loja
            </button>

            {/* Tempo */}
            <p className="text-sm text-gray-400 text-center">3 Horas atrás</p>
          </div>
        </div>
      </div>
    </div>
  );
} 