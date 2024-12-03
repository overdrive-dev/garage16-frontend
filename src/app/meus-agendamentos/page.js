'use client'

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { agendamentos, STATUS_AGENDAMENTO } from '@/mocks/agendamentos';
import { mockAnuncios } from '@/mocks/anuncios';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClockIcon, QuestionMarkCircleIcon, CalendarIcon, CheckCircleIcon, ArrowPathIcon, CheckBadgeIcon, XCircleIcon, EyeIcon, CheckIcon, XMarkIcon, ArrowRightOnRectangleIcon, PlayIcon, FlagIcon, UserIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

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

const STATUS_LABELS = {
  [STATUS_AGENDAMENTO.AGENDADO]: 'Agendado',
  [STATUS_AGENDAMENTO.AGUARDANDO_DISPONIBILIDADE]: 'Aguardando Confirmação',
  [STATUS_AGENDAMENTO.AGUARDANDO_CHECKIN]: 'Aguardando Check-in',
  [STATUS_AGENDAMENTO.CONFIRMADO]: 'Confirmado',
  [STATUS_AGENDAMENTO.ACONTECENDO]: 'Em Andamento',
  [STATUS_AGENDAMENTO.CONCLUIDO]: 'Concluído',
  [STATUS_AGENDAMENTO.CANCELADO]: 'Cancelado'
};

const STATUS_COLORS = {
  [STATUS_AGENDAMENTO.AGENDADO]: 'bg-blue-900 text-blue-300',
  [STATUS_AGENDAMENTO.AGUARDANDO_DISPONIBILIDADE]: 'bg-yellow-900 text-yellow-300',
  [STATUS_AGENDAMENTO.AGUARDANDO_CHECKIN]: 'bg-purple-900 text-purple-300',
  [STATUS_AGENDAMENTO.CONFIRMADO]: 'bg-orange-900 text-orange-300',
  [STATUS_AGENDAMENTO.ACONTECENDO]: 'bg-green-900 text-green-300',
  [STATUS_AGENDAMENTO.CONCLUIDO]: 'bg-gray-900 text-gray-300',
  [STATUS_AGENDAMENTO.CANCELADO]: 'bg-red-900 text-red-300'
};

const STATUS_ICONS = {
  [STATUS_AGENDAMENTO.AGENDADO]: ClockIcon,
  [STATUS_AGENDAMENTO.AGUARDANDO_DISPONIBILIDADE]: QuestionMarkCircleIcon,
  [STATUS_AGENDAMENTO.AGUARDANDO_CHECKIN]: CalendarIcon,
  [STATUS_AGENDAMENTO.CONFIRMADO]: CheckCircleIcon,
  [STATUS_AGENDAMENTO.ACONTECENDO]: ArrowPathIcon,
  [STATUS_AGENDAMENTO.CONCLUIDO]: CheckBadgeIcon,
  [STATUS_AGENDAMENTO.CANCELADO]: XCircleIcon
};

const getAcoesDisponiveis = (agendamento, tipoVisualizacao) => {
  const acoes = [];

  switch (agendamento.status) {
    case STATUS_AGENDAMENTO.AGENDADO:
      if (tipoVisualizacao === 'vendedor') {
        acoes.push({
          label: 'Confirmar Disponibilidade',
          action: 'confirmar_disponibilidade',
          icon: CheckIcon,
          color: 'text-green-400 hover:text-green-300'
        });
      }
      acoes.push({
        label: 'Cancelar',
        action: 'cancelar',
        icon: XMarkIcon,
        color: 'text-red-400 hover:text-red-300'
      });
      break;

    case STATUS_AGENDAMENTO.AGUARDANDO_DISPONIBILIDADE:
      if (tipoVisualizacao === 'vendedor') {
        acoes.push({
          label: 'Confirmar',
          action: 'confirmar',
          icon: CheckIcon,
          color: 'text-green-400 hover:text-green-300'
        });
      }
      acoes.push({
        label: 'Cancelar',
        action: 'cancelar',
        icon: XMarkIcon,
        color: 'text-red-400 hover:text-red-300'
      });
      break;

    case STATUS_AGENDAMENTO.AGUARDANDO_CHECKIN:
      acoes.push({
        label: 'Fazer Check-in',
        action: 'checkin',
        icon: CheckBadgeIcon,
        color: 'text-blue-400 hover:text-blue-300'
      });
      acoes.push({
        label: 'Desmarcar',
        action: 'cancelar',
        icon: XCircleIcon,
        color: 'text-red-400 hover:text-red-300'
      });
      break;

    case STATUS_AGENDAMENTO.CONFIRMADO:
      if (tipoVisualizacao === 'vendedor') {
        acoes.push({
          label: 'Iniciar Visita',
          action: 'iniciar',
          icon: PlayIcon,
          color: 'text-green-400 hover:text-green-300'
        });
      }
      acoes.push({
        label: 'Cancelar',
        action: 'cancelar',
        icon: XMarkIcon,
        color: 'text-red-400 hover:text-red-300'
      });
      break;

    case STATUS_AGENDAMENTO.ACONTECENDO:
      if (tipoVisualizacao === 'vendedor') {
        acoes.push({
          label: 'Concluir Visita',
          action: 'concluir',
          icon: FlagIcon,
          color: 'text-green-400 hover:text-green-300'
        });
      }
      break;
  }

  return acoes;
};

const StatusIcon = ({ status }) => {
  const Icon = STATUS_ICONS[status];
  return Icon ? <Icon className="h-4 w-4" /> : null;
};

// Componente para tooltip
const Tooltip = ({ children, label }) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-0 mb-0 hidden group-hover:block" style={{ right: 'calc(100% + 5px)' }}>
      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
        {label}
      </div>
      <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute top-1/2 -translate-y-1/2 -right-1"></div>
    </div>
  </div>
);

// Componente para cabeçalho ordenável
const SortableHeader = ({ label, field, ordenacao, onSort }) => (
  <th 
    scope="col" 
    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white group"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center space-x-1">
      <span>{label}</span>
      <span className="text-gray-600 group-hover:text-gray-400">
        {ordenacao.campo === field && (
          ordenacao.direcao === 'asc' ? '↑' : '↓'
        )}
      </span>
    </div>
  </th>
);

// Componente de contador regressivo
const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) return '00:00:00';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  return <span>{timeLeft}</span>;
};

export default function MeusAgendamentosPage() {
  const { user } = useAuth();
  
  // Debug logs
  console.log('Auth User:', user);
  console.log('Auth User ID:', user?.uid);
  console.log('Todos os agendamentos:', agendamentos);

  const [tipoVisualizacao, setTipoVisualizacao] = useState('comprador');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [ordenacao, setOrdenacao] = useState({
    campo: 'data',
    direcao: 'desc'
  });

  // Estados do modal de desmarcação - movidos para dentro do componente
  const [showDesmarcarModal, setShowDesmarcarModal] = useState(false);
  const [motivoDesmarcacao, setMotivoDesmarcacao] = useState('');
  const [agendamentoParaDesmarcar, setAgendamentoParaDesmarcar] = useState(null);

  const handleDesmarcar = (agendamento) => {
    setAgendamentoParaDesmarcar(agendamento);
    setShowDesmarcarModal(true);
  };

  const handleConfirmarDesmarcacao = () => {
    if (!motivoDesmarcacao.trim()) return;

    handleAction(agendamentoParaDesmarcar.id, 'cancelar', { motivo: motivoDesmarcacao });
    setShowDesmarcarModal(false);
    setMotivoDesmarcacao('');
    setAgendamentoParaDesmarcar(null);
  };

  const meusAgendamentos = useMemo(() => {
    let filtrados = agendamentos.filter(agendamento => {
      const isMinhaParticipacao = tipoVisualizacao === 'comprador' 
        ? agendamento.compradorId === user?.uid
        : agendamento.vendedorId === user?.uid;

      const matchStatus = statusFiltro === 'todos' || agendamento.status === statusFiltro;
      return isMinhaParticipacao && matchStatus;
    });

    // Ordenação
    filtrados.sort((a, b) => {
      const aValue = a[ordenacao.campo];
      const bValue = b[ordenacao.campo];
      const modifier = ordenacao.direcao === 'asc' ? 1 : -1;

      return aValue > bValue ? modifier : -modifier;
    });

    return filtrados;
  }, [user, tipoVisualizacao, statusFiltro, ordenacao]);

  const getVeiculo = (veiculoId) => {
    return mockAnuncios.publicados.find(v => v.id === veiculoId);
  };

  const handleSort = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAction = (agendamentoId, action) => {
    // Lógica para realizar a ação correspondente ao agendamento
  };

  // Filtrar agendamentos em check-in (sem considerar tipo de visualização)
  const agendamentosEmCheckin = useMemo(() => {
    const agora = new Date();
    const quatroHorasEmMs = 4 * 60 * 60 * 1000;

    return agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.data);
      const dentroJanelaCheckin = dataAgendamento - agora <= quatroHorasEmMs && dataAgendamento > agora;
      const isMinhaParticipacao = agendamento.compradorId === user?.uid || agendamento.vendedorId === user?.uid;

      return agendamento.status === STATUS_AGENDAMENTO.AGUARDANDO_CHECKIN && 
             dentroJanelaCheckin && 
             isMinhaParticipacao;
    });
  }, [agendamentos, user]);

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div>
            <h1 className="text-2xl font-bold text-white">
              Meus Agendamentos
            </h1>
          </div>

          {/* Agendamentos em Check-in */}
          {agendamentosEmCheckin.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-medium text-white mb-4">
                Agendamentos Aguardando Check-in
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agendamentosEmCheckin.map(agendamento => {
                  const veiculo = getVeiculo(agendamento.veiculoId);
                  if (!veiculo) return null;

                  const isComprador = agendamento.compradorId === user?.uid;

                  return (
                    <div 
                      key={agendamento.id}
                      className="bg-gray-750 rounded-lg p-4 flex items-center space-x-4"
                    >
                      {/* Imagem do Veículo */}
                      <div className="h-16 w-16 flex-shrink-0">
                        <div className="relative h-16 w-16">
                          <Image
                            src={veiculo.imageUrl}
                            alt={veiculo.modelo}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      </div>

                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-white truncate">
                            {veiculo.modelo}
                          </p>
                          <span className="flex items-center space-x-1 px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                            {isComprador ? (
                              <>
                                <UserIcon className="h-3 w-3" />
                                <span>Comprador</span>
                              </>
                            ) : (
                              <>
                                <BuildingStorefrontIcon className="h-3 w-3" />
                                <span>Vendedor</span>
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {format(new Date(agendamento.data), "dd 'de' MMMM", { locale: ptBR })} às {agendamento.horario}
                        </p>
                        <div className="mt-1 flex items-center text-gray-400 text-sm">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <Countdown targetDate={agendamento.data} />
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => handleDesmarcar(agendamento)}
                          className="flex items-center space-x-1 text-gray-400 hover:text-red-400 px-3 py-1 rounded text-sm transition-colors"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          <span>Desmarcar</span>
                        </button>
                        <button
                          onClick={() => handleAction(agendamento.id, 'checkin')}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          <CheckBadgeIcon className="h-4 w-4" />
                          <span>Check-in</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-4">
            {/* Tipo de Visualização */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Visualizar como:</span>
              <div className="flex space-x-2">
                <FilterButton
                  label="Comprador"
                  value="comprador"
                  selected={tipoVisualizacao}
                  onClick={setTipoVisualizacao}
                />
                <FilterButton
                  label="Vendedor"
                  value="vendedor"
                  selected={tipoVisualizacao}
                  onClick={setTipoVisualizacao}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              <span className="text-sm text-gray-400 whitespace-nowrap">Status:</span>
              <div className="flex space-x-2">
                <FilterButton
                  label="Todos"
                  value="todos"
                  selected={statusFiltro}
                  onClick={setStatusFiltro}
                />
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <FilterButton
                    key={value}
                    label={label}
                    value={value}
                    selected={statusFiltro}
                    onClick={setStatusFiltro}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Agendamentos */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {meusAgendamentos.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                Nenhum agendamento encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <SortableHeader 
                        label="Veículo"
                        field="veiculoId"
                        ordenacao={ordenacao}
                        onSort={handleSort}
                      />
                      <SortableHeader 
                        label="Data/Hora"
                        field="data"
                        ordenacao={ordenacao}
                        onSort={handleSort}
                      />
                      <SortableHeader 
                        label="Status"
                        field="status"
                        ordenacao={ordenacao}
                        onSort={handleSort}
                      />
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {meusAgendamentos.map((agendamento) => {
                      const veiculo = getVeiculo(agendamento.veiculoId);
                      if (!veiculo) return null;

                      return (
                        <tr key={agendamento.id} className="hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="relative h-10 w-10">
                                  <Image
                                    src={veiculo.imageUrl}
                                    alt={veiculo.modelo}
                                    fill
                                    className="rounded-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {veiculo.modelo}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {veiculo.marca}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {format(new Date(agendamento.data), "dd 'de' MMMM", { locale: ptBR })}
                            </div>
                            <div className="text-sm text-gray-400">
                              {agendamento.horario}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 inline-flex items-center space-x-1 text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[agendamento.status]}`}>
                                <StatusIcon status={agendamento.status} />
                                <span>{STATUS_LABELS[agendamento.status]}</span>
                              </span>
                            </div>
                            {agendamento.observacoes && (
                              <p className="mt-1 text-xs text-gray-400">
                                {agendamento.observacoes}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            <div className="flex items-center space-x-4">
                              <Tooltip label="Ver Anúncio">
                                <Link
                                  href={`/veiculo/${veiculo.slug}`}
                                  className="text-gray-600 hover:text-white transition-colors p-1 block"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </Link>
                              </Tooltip>
                              
                              {getAcoesDisponiveis(agendamento, tipoVisualizacao).map((acao) => (
                                <Tooltip key={acao.action} label={acao.label}>
                                  <button
                                    onClick={() => handleAction(agendamento.id, acao.action)}
                                    className="text-gray-600 hover:text-white transition-colors p-1"
                                  >
                                    <acao.icon className="h-5 w-5" />
                                  </button>
                                </Tooltip>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Desmarcação */}
      {showDesmarcarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-white mb-4">
              Desmarcar Agendamento
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Por favor, informe o motivo da desmarcação:
            </p>
            <textarea
              value={motivoDesmarcacao}
              onChange={(e) => setMotivoDesmarcacao(e.target.value)}
              placeholder="Motivo da desmarcação..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDesmarcarModal(false);
                  setMotivoDesmarcacao('');
                  setAgendamentoParaDesmarcar(null);
                }}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDesmarcacao}
                disabled={!motivoDesmarcacao.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Desmarcação
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 