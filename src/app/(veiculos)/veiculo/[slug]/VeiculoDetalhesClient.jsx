'use client'

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Breadcrumb from '@/components/Breadcrumb';
import ContatoModal from '@/components/veiculo/ContatoModal';
import AgendamentoModal from '@/components/veiculo/AgendamentoModal';
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { disponibilidades } from '@/mocks/disponibilidades';
import { agendamentos } from '@/mocks/agendamentos';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function VeiculoDetalhesClient({ veiculo }) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContatoModal, setShowContatoModal] = useState(false);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const disponibilidade = disponibilidades[veiculo.userId];

  // Verifica se já existe um agendamento do usuário para este veículo
  const agendamentoExistente = useMemo(() => {
    if (!user) return null;
    
    return agendamentos.find(agendamento => 
      agendamento.veiculoId === veiculo.id && 
      agendamento.compradorId === user.uid &&
      agendamento.status !== 'cancelado' && 
      agendamento.status !== 'concluido'
    );
  }, [user, veiculo.id]);

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
            {/* ID e Título */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{veiculo.id}</p>
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
                Vistoria feita 10/11/12 por Marcos Gama na Garage16
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

            {/* Informações de Contato */}
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3 text-gray-200">
                <PhoneIcon className="h-5 w-5" />
                <span>{disponibilidade?.contato.telefone}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-200">
                <EnvelopeIcon className="h-5 w-5" />
                <span>{disponibilidade?.contato.email}</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              {agendamentoExistente ? (
                <Link
                  href="/meus-agendamentos"
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Ver Agendamento
                </Link>
              ) : (
                <button 
                  onClick={() => setShowAgendamentoModal(true)}
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Agendar Visita
                </button>
              )}
              <a
                href={`https://wa.me/${disponibilidade?.contato.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-700 text-gray-200 py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <AgendamentoModal 
        isOpen={showAgendamentoModal}
        onClose={() => setShowAgendamentoModal(false)}
        veiculo={veiculo}
      />
    </div>
  );
} 