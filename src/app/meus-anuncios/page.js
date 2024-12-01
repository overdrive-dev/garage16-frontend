'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';
import { mockAnuncios, STATUS_ANUNCIO } from '@/mocks/anuncios';
import { 
  EyeIcon, 
  PencilSquareIcon, 
  XCircleIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

const FilterButton = ({ label, value, selected, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${selected === value 
        ? 'bg-gray-700 text-white' 
        : 'text-gray-400 hover:text-white'
      }`}
  >
    {label}
  </button>
);

export default function MeusAnuncios() {
  const [anuncios, setAnuncios] = useState([
    ...mockAnuncios.rascunhos,
    ...mockAnuncios.publicados
  ]);
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    anuncioId: null
  });
  const [vendaModal, setVendaModal] = useState({
    isOpen: false,
    anuncioId: null
  });
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    anuncioId: null
  });

  const motivosCancelamento = [
    'Veículo vendido em outro canal',
    'Desisti de vender',
    'Preço incorreto',
    'Informações incorretas',
    'Outro motivo'
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case STATUS_ANUNCIO.ATIVO:
        return 'bg-green-900 text-green-300';
      case STATUS_ANUNCIO.REVISAO:
        return 'bg-yellow-900 text-yellow-300';
      case STATUS_ANUNCIO.RASCUNHO:
        return 'bg-gray-900 text-gray-300';
      case STATUS_ANUNCIO.REPROVADO:
        return 'bg-red-900 text-red-300';
      case STATUS_ANUNCIO.VENDIDO:
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case STATUS_ANUNCIO.ATIVO:
        return 'Ativo';
      case STATUS_ANUNCIO.REVISAO:
        return 'Em Revisão';
      case STATUS_ANUNCIO.RASCUNHO:
        return 'Rascunho';
      case STATUS_ANUNCIO.REPROVADO:
        return 'Reprovado';
      case STATUS_ANUNCIO.VENDIDO:
        return 'Vendido';
      default:
        return status;
    }
  };

  const anunciosFiltrados = statusFiltro === 'todos'
    ? anuncios
    : anuncios.filter(a => a.status === statusFiltro);

  const handleDelete = (id) => {
    setDeleteModal({
      isOpen: true,
      anuncioId: id
    });
  };

  const confirmDelete = async () => {
    try {
      // Implementar lógica de exclusão
      console.log('Excluindo anúncio:', deleteModal.anuncioId);
      setAnuncios(prev => prev.filter(a => a.id !== deleteModal.anuncioId));
    } catch (error) {
      console.error('Erro ao excluir:', error);
    } finally {
      setDeleteModal({ isOpen: false, anuncioId: null });
    }
  };

  const handleMarcarVendido = (id) => {
    setVendaModal({
      isOpen: true,
      anuncioId: id
    });
  };

  const confirmVenda = async () => {
    try {
      // Atualiza o status do anúncio para vendido
      setAnuncios(prev => prev.map(anuncio => 
        anuncio.id === vendaModal.anuncioId
          ? { ...anuncio, status: STATUS_ANUNCIO.VENDIDO }
          : anuncio
      ));

      // Atualiza também no mock
      const anuncioIndex = mockAnuncios.publicados.findIndex(a => a.id === vendaModal.anuncioId);
      if (anuncioIndex >= 0) {
        mockAnuncios.publicados[anuncioIndex].status = STATUS_ANUNCIO.VENDIDO;
      }
    } catch (error) {
      console.error('Erro ao marcar como vendido:', error);
    } finally {
      setVendaModal({ isOpen: false, anuncioId: null });
    }
  };

  const filtros = [
    { label: 'Todos', value: 'todos' },
    { label: 'Rascunhos', value: STATUS_ANUNCIO.RASCUNHO },
    { label: 'Em Revisão', value: STATUS_ANUNCIO.REVISAO },
    { label: 'Ativos', value: STATUS_ANUNCIO.ATIVO },
    { label: 'Reprovados', value: STATUS_ANUNCIO.REPROVADO },
    { label: 'Vendidos', value: STATUS_ANUNCIO.VENDIDO }
  ];

  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Meus Anúncios</h1>
        <Link
          href="/novo"
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          Anunciar
        </Link>
      </div>

      {/* Filtro de Status */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {filtros.map(filtro => (
            <FilterButton
              key={filtro.value}
              label={filtro.label}
              value={filtro.value}
              selected={statusFiltro}
              onClick={setStatusFiltro}
            />
          ))}
        </nav>
      </div>

      {/* Lista de Anúncios */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        {/* Tabela para Desktop */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Ano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {anunciosFiltrados.map((anuncio, index) => (
                  <tr key={anuncio.id} className={`hover:bg-gray-700 ${
                    index === anunciosFiltrados.length - 1 ? 'last:rounded-b-xl' : ''
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      index === anunciosFiltrados.length - 1 ? 'first:rounded-bl-xl' : ''
                    }`}>
                      <div className="flex items-center">
                        <div className="h-10 w-10 relative flex-shrink-0">
                          <Image
                            src={anuncio.imageUrl}
                            alt={anuncio.modelo}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-100">
                            {anuncio.modelo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {anuncio.ano}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(anuncio.preco)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(anuncio.status)}`}>
                        {getStatusLabel(anuncio.status)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      index === anunciosFiltrados.length - 1 ? 'last:rounded-br-xl' : ''
                    }`}>
                      <div className="flex items-center justify-end space-x-4">
                        {(anuncio.status === STATUS_ANUNCIO.ATIVO || anuncio.status === STATUS_ANUNCIO.VENDIDO) && (
                          <div className="relative flex items-center">
                            <Link
                              href={`/${anuncio.id}`}
                              className="text-gray-400 hover:text-orange-400 transition-colors group flex items-center"
                            >
                              <EyeIcon className="h-5 w-5" />
                              <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                                Visualizar Anúncio
                              </span>
                            </Link>
                          </div>
                        )}

                        {anuncio.status !== STATUS_ANUNCIO.VENDIDO && (
                          <>
                            <div className="relative flex items-center">
                              <Link
                                href={`/${anuncio.id}/editar`}
                                className="text-gray-400 hover:text-orange-400 transition-colors group flex items-center"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                                <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                                  {anuncio.status === STATUS_ANUNCIO.RASCUNHO ? 'Continuar' : 'Editar'}
                                </span>
                              </Link>
                            </div>
                            
                            {anuncio.status === STATUS_ANUNCIO.ATIVO && (
                              <div className="relative flex items-center">
                                <button 
                                  onClick={() => handleMarcarVendido(anuncio.id)}
                                  className="text-gray-400 hover:text-orange-400 transition-colors group flex items-center"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                  <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                                    Marcar como Vendido
                                  </span>
                                </button>
                              </div>
                            )}

                            <div className="relative flex items-center">
                              <button 
                                onClick={() => setCancelModal({ isOpen: true, anuncioId: anuncio.id })}
                                className="text-gray-400 hover:text-red-400 transition-colors group flex items-center"
                              >
                                <XCircleIcon className="h-5 w-5" />
                                <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                                  Cancelar Anúncio
                                </span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards para Mobile */}
        <div className="md:hidden divide-y divide-gray-700">
          {anunciosFiltrados.map((anuncio, index) => (
            <div key={anuncio.id} className={`p-4 space-y-4 ${
              index === 0 ? 'first:rounded-t-xl' : ''
            } ${
              index === anunciosFiltrados.length - 1 ? 'last:rounded-b-xl' : ''
            }`}>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 relative flex-shrink-0">
                  <Image
                    src={anuncio.imageUrl}
                    alt={anuncio.modelo}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-100">
                    {anuncio.modelo}
                  </div>
                  <div className="text-sm text-gray-400">
                    {anuncio.ano}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(anuncio.preco)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(anuncio.status)}`}>
                  {getStatusLabel(anuncio.status)}
                </span>

                <div className="flex items-center space-x-4">
                  {/* Botões de ação */}
                  {(anuncio.status === STATUS_ANUNCIO.ATIVO || anuncio.status === STATUS_ANUNCIO.VENDIDO) && (
                    <div className="relative flex items-center">
                      <Link
                        href={`/${anuncio.id}`}
                        className="text-gray-400 hover:text-orange-400 transition-colors group flex items-center"
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                          Visualizar Anúncio
                        </span>
                      </Link>
                    </div>
                  )}

                  {anuncio.status !== STATUS_ANUNCIO.VENDIDO && (
                    <>
                      <div className="relative flex items-center">
                        <Link
                          href={`/${anuncio.id}/editar`}
                          className="text-gray-400 hover:text-orange-400 transition-colors group flex items-center"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                          <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                            {anuncio.status === STATUS_ANUNCIO.RASCUNHO ? 'Continuar' : 'Editar'}
                          </span>
                        </Link>
                      </div>
                      
                      {anuncio.status === STATUS_ANUNCIO.ATIVO && (
                        <div className="relative flex items-center">
                          <button 
                            onClick={() => handleMarcarVendido(anuncio.id)}
                            className="text-gray-400 hover:text-orange-400 transition-colors group flex items-center"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                              Marcar como Vendido
                            </span>
                          </button>
                        </div>
                      )}

                      <div className="relative flex items-center">
                        <button 
                          onClick={() => setCancelModal({ isOpen: true, anuncioId: anuncio.id })}
                          className="text-gray-400 hover:text-red-400 transition-colors group flex items-center"
                        >
                          <XCircleIcon className="h-5 w-5" />
                          <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                            Cancelar Anúncio
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, anuncioId: null })}
        onConfirm={confirmDelete}
        title="Excluir Anúncio"
        message="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
      />

      <ConfirmationModal
        isOpen={vendaModal.isOpen}
        onClose={() => setVendaModal({ isOpen: false, anuncioId: null })}
        onConfirm={confirmVenda}
        title="Confirmar Venda"
        message="Tem certeza que deseja marcar este anúncio como vendido? Esta ação não pode ser desfeita."
      />

      <Dialog
        open={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, anuncioId: null })}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-100 mb-4">
              Motivo do Cancelamento
            </Dialog.Title>

            <div className="space-y-4">
              <p className="text-gray-300">
                Por favor, selecione o motivo do cancelamento:
              </p>

              <div className="space-y-2">
                {motivosCancelamento.map((motivo) => (
                  <button
                    key={motivo}
                    onClick={() => {
                      handleDelete(cancelModal.anuncioId, motivo);
                      setCancelModal({ isOpen: false, anuncioId: null });
                    }}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                  >
                    {motivo}
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setCancelModal({ isOpen: false, anuncioId: null })}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </main>
  );
} 