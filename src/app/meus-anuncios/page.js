'use client'

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';
import { mockAnuncios, STATUS_ANUNCIO } from '@/mocks/anuncios';
import { 
  EyeIcon, 
  PencilSquareIcon, 
  XCircleIcon, 
  CheckCircleIcon,
  PhotoIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  ArrowPathIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import Toast, { ToastContainer } from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { historicoAgendamentos, STATUS_AGENDAMENTO } from '@/mocks/historicoAgendamentos';

const STATUS_COLORS = {
  [STATUS_ANUNCIO.VENDENDO]: 'bg-green-900 text-green-300',
  [STATUS_ANUNCIO.REVISAO]: 'bg-yellow-900 text-yellow-300',
  [STATUS_ANUNCIO.RASCUNHO]: 'bg-gray-900 text-gray-300',
  [STATUS_ANUNCIO.CANCELADO]: 'bg-red-900 text-red-300',
  [STATUS_ANUNCIO.VENDIDO]: 'bg-blue-900 text-blue-300'
};

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
  const router = useRouter();
  const [anuncios, setAnuncios] = useState(mockAnuncios.publicados);
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
  const [ordenacao, setOrdenacao] = useState({
    campo: 'createdAt',
    direcao: 'desc'
  });
  const [rascunhos, setRascunhos] = useState(mockAnuncios.rascunhos);
  const [toasts, setToasts] = useState([]);
  const [historicoModal, setHistoricoModal] = useState({
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

  const getStatusLabel = (anuncio) => {
    if (anuncio.status === STATUS_ANUNCIO.VENDENDO) {
      return anuncio.ativo ? 'Vendendo' : 'Pausado';
    }
    return {
      [STATUS_ANUNCIO.RASCUNHO]: 'Rascunho',
      [STATUS_ANUNCIO.REVISAO]: 'Em Revisão',
      [STATUS_ANUNCIO.VENDIDO]: 'Vendido',
      [STATUS_ANUNCIO.CANCELADO]: 'Cancelado'
    }[anuncio.status];
  };

  const anunciosFiltrados = useMemo(() => {
    return anuncios.filter(anuncio => {
      if (statusFiltro === 'todos') return true;
      return anuncio.status === statusFiltro;
    });
  }, [anuncios, statusFiltro]);

  const handleDelete = (id) => {
    setDeleteModal({
      isOpen: true,
      anuncioId: id
    });
  };

  const confirmDelete = async () => {
    try {
      // Remove do estado local
      if (mockAnuncios.rascunhos.find(r => r.id === deleteModal.anuncioId)) {
        // Se for um rascunho
        setRascunhos(prev => prev.filter(r => r.id !== deleteModal.anuncioId));
        // Atualiza também no mock
        mockAnuncios.rascunhos = mockAnuncios.rascunhos.filter(r => r.id !== deleteModal.anuncioId);
      } else {
        // Se for um anúncio publicado
        setAnuncios(prev => prev.filter(a => a.id !== deleteModal.anuncioId));
      }
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

  // Primeiro definir os contadores
  const contadores = useMemo(() => {
    const todos = anuncios.length;
    const rascunhos = anuncios.filter(a => a.status === STATUS_ANUNCIO.RASCUNHO).length;
    const revisao = anuncios.filter(a => a.status === STATUS_ANUNCIO.REVISAO).length;
    const vendendo = anuncios.filter(a => a.status === STATUS_ANUNCIO.VENDENDO).length;
    const cancelados = anuncios.filter(a => a.status === STATUS_ANUNCIO.CANCELADO).length;
    const vendidos = anuncios.filter(a => a.status === STATUS_ANUNCIO.VENDIDO).length;

    return { todos, rascunhos, revisao, vendendo, cancelados, vendidos };
  }, [anuncios]);

  // Depois definir os FILTROS usando os contadores
  const FILTROS = useMemo(() => [
    { 
      value: 'todos', 
      label: 'Todos',
      count: contadores.todos
    },
    { 
      value: STATUS_ANUNCIO.REVISAO, 
      label: 'Aguardando Aprovação',
      count: contadores.revisao
    },
    { 
      value: STATUS_ANUNCIO.VENDENDO, 
      label: 'Vendendo',
      count: contadores.vendendo
    },
    { 
      value: STATUS_ANUNCIO.VENDIDO, 
      label: 'Vendidos',
      count: contadores.vendidos
    },
    { 
      value: STATUS_ANUNCIO.CANCELADO, 
      label: 'Cancelados',
      count: contadores.cancelados
    }
  ], [contadores]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const anunciosOrdenados = [...anunciosFiltrados].sort((a, b) => {
    const direcao = ordenacao.direcao === 'asc' ? 1 : -1;
    switch (ordenacao.campo) {
      case 'modelo':
        return (a.modelo || '').localeCompare(b.modelo || '') * direcao;
      case 'marca':
        return (a.marca || '').localeCompare(b.marca || '') * direcao;
      case 'preco':
        return (a.preco - b.preco) * direcao;
      case 'createdAt':
        return (new Date(a.createdAt) - new Date(b.createdAt)) * direcao;
      case 'status':
        return (a.status || '').localeCompare(b.status || '') * direcao;
      default:
        return 0;
    }
  });

  const SortButton = ({ children, campo }) => (
    <button
      onClick={() => handleSort(campo)}
      className="group flex items-center space-x-1"
    >
      <span>{children}</span>
      <span className={`transition-colors ${ordenacao.campo === campo ? 'text-orange-500' : 'text-gray-600 group-hover:text-gray-400'}`}>
        {ordenacao.campo === campo ? (
          ordenacao.direcao === 'asc' ? '↑' : '↓'
        ) : '↕'}
      </span>
    </button>
  );

  const getAcoesDisponiveis = (anuncio) => {
    const acoes = [];

    // Ver anúncio disponível para todos exceto rascunhos sem slug
    if (anuncio.status !== STATUS_ANUNCIO.RASCUNHO || anuncio.slug) {
      acoes.push({
        action: 'ver',
        label: 'Ver Anúncio',
        icon: EyeIcon
      });
    }

    // Ações específicas por status
    switch (anuncio.status) {
      case STATUS_ANUNCIO.REVISAO:
        acoes.push({
          action: 'editar',
          label: 'Editar',
          icon: PencilSquareIcon
        });
        acoes.push({
          action: 'cancelar',
          label: 'Cancelar',
          icon: XCircleIcon
        });
        break;

      case STATUS_ANUNCIO.VENDENDO:
        acoes.push({
          action: 'marcar_vendido',
          label: 'Vendido',
          icon: CheckCircleIcon
        });
        
        // Botão de Pausar/Reativar
        acoes.push({
          action: anuncio.ativo ? 'pausar' : 'reativar',
          label: anuncio.ativo ? 'Pausar' : 'Reativar',
          icon: anuncio.ativo ? PauseIcon : PlayIcon
        });
        
        acoes.push({
          action: 'cancelar',
          label: 'Cancelar',
          icon: XCircleIcon
        });
        acoes.push({
          action: 'historico',
          label: 'Histórico de Visitas',
          icon: ClockIcon
        });
        break;

      case STATUS_ANUNCIO.CANCELADO:
        acoes.push({
          action: 'recriar',
          label: 'Recriar',
          icon: ArrowPathIcon
        });
        break;
    }

    return acoes;
  };

  const handleAction = async (anuncioId, action) => {
    try {
      const anuncioIndex = anuncios.findIndex(a => a.id === anuncioId);
      if (anuncioIndex === -1) return;

      const anuncio = anuncios[anuncioIndex];

      switch (action) {
        case 'pausar':
          if (anuncio.status === STATUS_ANUNCIO.VENDENDO && anuncio.ativo) {
            anuncios[anuncioIndex] = {
              ...anuncio,
              ativo: false,
              updatedAt: new Date().toISOString()
            };
            setAnuncios([...anuncios]);
            addToast('Anúncio pausado com sucesso', 'success');
          }
          break;

        case 'reativar':
          if (anuncio.status === STATUS_ANUNCIO.VENDENDO && !anuncio.ativo) {
            anuncios[anuncioIndex] = {
              ...anuncio,
              ativo: true,
              updatedAt: new Date().toISOString()
            };
            setAnuncios([...anuncios]);
            addToast('Anúncio reativado com sucesso', 'success');
          }
          break;

        case 'ver':
          router.push(`/veiculo/${anuncio.slug}`);
          return;

        case 'editar':
          if (anuncio.status === STATUS_ANUNCIO.REVISAO) {
            router.push(`/veiculo/${anuncio.slug}/editar`);
          }
          return;

        case 'excluir':
          setDeleteModal({ isOpen: true, anuncioId });
          return;

        case 'marcar_vendido':
          setVendaModal({ isOpen: true, anuncioId });
          return;

        case 'cancelar':
          // Permitir cancelamento para anúncios em revisão ou vendendo
          if (anuncio.status === STATUS_ANUNCIO.REVISAO || 
              anuncio.status === STATUS_ANUNCIO.VENDENDO) {
            setCancelModal({ isOpen: true, anuncioId });
          }
          return;

        case 'recriar':
          if (anuncio.status === STATUS_ANUNCIO.CANCELADO) {
            // Ao invés de criar um novo rascunho aqui,
            // redirecionar para página de novo anúncio com os dados
            const dadosAnuncio = {
              modelo: anuncio.modelo,
              marca: anuncio.marca,
              categoria: anuncio.categoria,
              ano: anuncio.ano,
              preco: anuncio.preco,
              cor: anuncio.cor,
              km: anuncio.km,
              descricao: anuncio.descricao,
              imagens: anuncio.imagens
            };

            // Codificar os dados para passar na URL
            const queryString = encodeURIComponent(JSON.stringify(dadosAnuncio));
            router.push(`/veiculo/novo?dados=${queryString}`);
          }
          return;

        case 'historico':
          setHistoricoModal({ isOpen: true, anuncioId });
          return;
      }

    } catch (error) {
      console.error('Erro ao executar ação:', error);
      addToast('Erro ao executar ação', 'error');
    }
  };

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Meus Anúncios</h1>
      </div>

      {/* Seção de Rascunhos */}
      {rascunhos?.length > 0 && rascunhos.some(r => r.status === STATUS_ANUNCIO.RASCUNHO) && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-200 mb-4 sr-only">Rascunhos</h2>
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Veículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Última Atualização
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {rascunhos.map((anuncio) => (
                    <tr key={anuncio.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 relative flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
                            <PhotoIcon className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-100">
                              {anuncio.modelo || 'Novo Anúncio'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDateTime(anuncio.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <div className="flex items-center justify-end space-x-4">
                          <Link
                            href={`/veiculos/rascunho/${anuncio.id}/editar`}
                            className="text-gray-400 hover:text-orange-400 transition-colors"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(anuncio.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        <span className="text-sm text-gray-400 whitespace-nowrap">Status:</span>
        <div className="flex space-x-2">
          {FILTROS.map(filtro => (
            <button
              key={filtro.value}
              onClick={() => setStatusFiltro(filtro.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${statusFiltro === filtro.value
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <div className="flex items-center space-x-2">
                <span>{filtro.label}</span>
                {filtro.count > 0 && (
                  <span className="bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                    {filtro.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Anúncios */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        {anunciosOrdenados.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-gray-700/50 rounded-full p-4">
                <PhotoIcon className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-400 text-lg">Nenhum anúncio encontrado</p>
                <p className="text-gray-500 text-sm mt-1">Comece criando seu primeiro anúncio</p>
              </div>
              <Link
                href="/veiculos/novo"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Criar Anúncio
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tabela para Desktop */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        <SortButton campo="modelo">Veículo</SortButton>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        <SortButton campo="marca">Marca</SortButton>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        <SortButton campo="preco">Preço</SortButton>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        <SortButton campo="createdAt">Data Cadastro</SortButton>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        <SortButton campo="status">Status</SortButton>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {anunciosOrdenados.map((anuncio, index) => (
                      <tr key={anuncio.id} className={`hover:bg-gray-700 ${
                        index === anunciosOrdenados.length - 1 ? 'last:rounded-b-xl' : ''
                      }`}>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          index === anunciosOrdenados.length - 1 ? 'first:rounded-bl-xl' : ''
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
                          {anuncio.marca}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(anuncio.preco)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDateTime(anuncio.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${anuncio.status === STATUS_ANUNCIO.VENDENDO
                              ? anuncio.ativo 
                                ? 'bg-green-900 text-green-300'
                                : 'bg-yellow-900 text-yellow-300'
                              : STATUS_COLORS[anuncio.status]
                            }`}
                          >
                            {getStatusLabel(anuncio)}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                          index === anunciosOrdenados.length - 1 ? 'last:rounded-br-xl' : ''
                        }`}>
                          <div className="flex items-center justify-end space-x-4">
                            {getAcoesDisponiveis(anuncio).map(acao => (
                              <div key={acao.action} className="relative flex items-center">
                                <button
                                  onClick={() => handleAction(anuncio.id, acao.action)}
                                  className={`text-gray-400 hover:text-${
                                    acao.action === 'cancelar' ? 'red' : 
                                    acao.action === 'marcar_vendido' ? 'green' : 
                                    'orange'
                                  }-400 transition-colors group flex items-center`}
                                >
                                  <acao.icon className="h-5 w-5" />
                                  <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                                    {acao.label}
                                  </span>
                                </button>
                              </div>
                            ))}
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
              {anunciosOrdenados.map((anuncio, index) => (
                <div key={anuncio.id} className={`p-4 space-y-4 ${
                  index === 0 ? 'first:rounded-t-xl' : ''
                } ${
                  index === anunciosOrdenados.length - 1 ? 'last:rounded-b-xl' : ''
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
                        {anuncio.marca}
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[anuncio.status]}`}>
                      {getStatusLabel(anuncio)}
                    </span>

                    <div className="flex items-center space-x-4">
                      {/* Botões de ação */}
                      {(anuncio.status === STATUS_ANUNCIO.VENDENDO || anuncio.status === STATUS_ANUNCIO.VENDIDO) && (
                        <div className="relative flex items-center">
                          <Link
                            href={`/veiculo/${anuncio.slug}`}
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
                              href={`/veiculo/${anuncio.slug}/editar`}
                              className="text-gray-400 hover:text-orange-400 transition-colors group flex items-center"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                              <span className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-100 bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
                                Editar
                              </span>
                            </Link>
                          </div>
                          
                          {anuncio.status === STATUS_ANUNCIO.VENDENDO && (
                            <div className="relative flex items-center">
                              <button 
                                onClick={() => handleMarcarVendido(anuncio.id)}
                                className="text-gray-400 hover:text-green-400 transition-colors group flex items-center"
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
          </>
        )}
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
        confirmButtonText="Confirmar Venda"
        confirmButtonClass="bg-green-500 hover:bg-green-600 text-white"
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

      <Dialog
        open={historicoModal.isOpen}
        onClose={() => setHistoricoModal({ isOpen: false, anuncioId: null })}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-gray-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-100 mb-4 flex items-center justify-between">
              <span>Histórico de Visitas</span>
              <button
                onClick={() => setHistoricoModal({ isOpen: false, anuncioId: null })}
                className="text-gray-400 hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Title>

            <div className="space-y-4">
              {historicoAgendamentos[historicoModal.anuncioId]?.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {historicoAgendamentos[historicoModal.anuncioId].map((agendamento) => (
                    <div key={agendamento.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300">
                            {format(new Date(agendamento.data), "dd/MM/yyyy 'às' HH:mm")}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            agendamento.status === STATUS_AGENDAMENTO.CONCLUIDO ? 'bg-green-900 text-green-300' :
                            agendamento.status === STATUS_AGENDAMENTO.CANCELADO ? 'bg-red-900 text-red-300' :
                            agendamento.status === STATUS_AGENDAMENTO.ANDAMENTO ? 'bg-purple-900 text-purple-300' :
                            agendamento.status === STATUS_AGENDAMENTO.VISITA_CONFIRMADA ? 'bg-blue-900 text-blue-300' :
                            agendamento.status === STATUS_AGENDAMENTO.CHECKIN ? 'bg-orange-900 text-orange-300' :
                            agendamento.status === STATUS_AGENDAMENTO.CONFIRMADO ? 'bg-indigo-900 text-indigo-300' :
                            'bg-yellow-900 text-yellow-300'
                          }`}>
                            {agendamento.status === STATUS_AGENDAMENTO.VISITA_CONFIRMADA ? 'Visita Confirmada' :
                             agendamento.status === STATUS_AGENDAMENTO.CHECKIN ? 'Check-in' :
                             agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>Comprador: {agendamento.comprador.nome}</p>
                        <p>Telefone: {agendamento.comprador.telefone}</p>
                        {agendamento.observacoes && (
                          <p className="mt-1 text-gray-500">{agendamento.observacoes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Nenhuma visita agendada até o momento.
                </p>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {toasts.length > 0 && (
        <ToastContainer 
          toasts={toasts}
          removeToast={removeToast}
        />
      )}
    </main>
  );
} 