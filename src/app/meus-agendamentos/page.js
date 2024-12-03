'use client'

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { agendamentos, STATUS_AGENDAMENTO } from '@/mocks/agendamentos';
import { mockAnuncios } from '@/mocks/anuncios';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClockIcon, QuestionMarkCircleIcon, CalendarIcon, CheckCircleIcon, ArrowPathIcon, CheckBadgeIcon, XCircleIcon, EyeIcon, CheckIcon, XMarkIcon, ArrowRightOnRectangleIcon, PlayIcon, FlagIcon, UserIcon, BuildingStorefrontIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Toast, { ToastContainer } from '@/components/Toast';

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
  [STATUS_AGENDAMENTO.AGENDADO]: 'Aguardando confirmação da loja',
  [STATUS_AGENDAMENTO.CONFIRMADO]: 'Visita confirmada',
  [STATUS_AGENDAMENTO.AGUARDANDO_CHECKIN]: 'Check-in disponível',
  [STATUS_AGENDAMENTO.CHECKIN_COMPRADOR]: 'Aguardando check-in da loja',
  [STATUS_AGENDAMENTO.CHECKIN_VENDEDOR]: 'Aguardando check-in do comprador',
  [STATUS_AGENDAMENTO.ACONTECENDO]: 'Visita em andamento',
  [STATUS_AGENDAMENTO.CONCLUIDO]: 'Visita realizada',
  [STATUS_AGENDAMENTO.CANCELADO]: 'Visita desmarcada'
};

const STATUS_COLORS = {
  [STATUS_AGENDAMENTO.AGENDADO]: 'bg-yellow-900 text-yellow-300',
  [STATUS_AGENDAMENTO.CONFIRMADO]: 'bg-blue-900 text-blue-300',
  [STATUS_AGENDAMENTO.CHECKIN]: 'bg-orange-900 text-orange-300',
  [STATUS_AGENDAMENTO.VISITA_CONFIRMADA]: 'bg-purple-900 text-purple-300',
  [STATUS_AGENDAMENTO.ANDAMENTO]: 'bg-green-900 text-green-300',
  [STATUS_AGENDAMENTO.CONCLUIDO]: 'bg-gray-900 text-gray-300',
  [STATUS_AGENDAMENTO.CANCELADO]: 'bg-red-900 text-red-300'
};

const STATUS_ICONS = {
  [STATUS_AGENDAMENTO.AGENDADO]: ClockIcon,
  [STATUS_AGENDAMENTO.CONFIRMADO]: CalendarIcon,
  [STATUS_AGENDAMENTO.CHECKIN]: ArrowRightOnRectangleIcon,
  [STATUS_AGENDAMENTO.VISITA_CONFIRMADA]: CheckBadgeIcon,
  [STATUS_AGENDAMENTO.ANDAMENTO]: PlayIcon,
  [STATUS_AGENDAMENTO.CONCLUIDO]: FlagIcon
};

// Filtros de status disponíveis - com labels contextuais
const getFiltrosStatus = (isComprador) => [
  { value: 'todos', label: 'Todos' },
  { 
    value: STATUS_AGENDAMENTO.AGENDADO, 
    label: isComprador ? 'Aguardando Vendedor' : 'Novas Solicitações'
  },
  { 
    value: STATUS_AGENDAMENTO.CONFIRMADO, 
    label: 'Confirmados'
  },
  { 
    value: STATUS_AGENDAMENTO.CHECKIN, 
    label: 'Em Check-in'
  },
  { 
    value: STATUS_AGENDAMENTO.VISITA_CONFIRMADA, 
    label: 'Visitas Confirmadas'
  },
  { 
    value: STATUS_AGENDAMENTO.ANDAMENTO, 
    label: 'Em Andamento'
  },
  { 
    value: STATUS_AGENDAMENTO.CONCLUIDO, 
    label: 'Concluídos'
  },
  { 
    value: STATUS_AGENDAMENTO.CANCELADO, 
    label: 'Cancelados'
  }
];

// Motivos de desmarcação personalizados por tipo de usuário
const MOTIVOS_DESMARCACAO = {
  comprador: [
    {
      id: 'indisponibilidade',
      label: 'Não poderei comparecer',
      descricao: 'Surgiu um imprevisto e não poderei comparecer no horário agendado'
    },
    {
      id: 'outro_veiculo',
      label: 'Interesse em outro veículo',
      descricao: 'Decidi visitar/comprar outro veículo'
    },
    {
      id: 'desistencia',
      label: 'Desisti da compra',
      descricao: 'Não tenho mais interesse em comprar um veículo no momento'
    },
    {
      id: 'outro',
      label: 'Outro motivo',
      descricao: 'Especificar outro motivo'
    }
  ],
  vendedor: [
    {
      id: 'indisponibilidade',
      label: 'Loja fechada no horário',
      descricao: 'A loja não estará em funcionamento no horário agendado'
    },
    {
      id: 'veiculo_vendido',
      label: 'Veículo já foi vendido',
      descricao: 'O veículo não está mais disponível para venda'
    },
    {
      id: 'veiculo_reservado',
      label: 'Veículo está reservado',
      descricao: 'O veículo está em processo de venda com outro comprador'
    },
    {
      id: 'manutencao',
      label: 'Veículo em manutenção',
      descricao: 'O veículo está temporariamente indisponível para visitas'
    },
    {
      id: 'outro',
      label: 'Outro motivo',
      descricao: 'Especificar outro motivo'
    }
  ]
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
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('');
  const [agendamentoParaDesmarcar, setAgendamentoParaDesmarcar] = useState(null);

  const [toasts, setToasts] = useState([]);

  const handleDesmarcar = (agendamento) => {
    setAgendamentoParaDesmarcar(agendamento);
    setShowDesmarcarModal(true);
  };

  const handleConfirmarDesmarcacao = () => {
    if (!motivoDesmarcacao || (motivoDesmarcacao === 'outro' && !motivoPersonalizado.trim())) return;

    try {
      const motivos = MOTIVOS_DESMARCACAO[agendamentoParaDesmarcar?.compradorId === user?.uid ? 'comprador' : 'vendedor'];
      const motivo = motivos.find(m => m.id === motivoDesmarcacao);
      const motivoTexto = motivoDesmarcacao === 'outro' 
        ? motivoPersonalizado 
        : motivo.descricao;

      // Atualiza o status do agendamento
      const agendamentoIndex = agendamentos.findIndex(a => a.id === agendamentoParaDesmarcar.id);
      if (agendamentoIndex >= 0) {
        agendamentos[agendamentoIndex] = {
          ...agendamentos[agendamentoIndex],
          status: STATUS_AGENDAMENTO.CANCELADO,
          resultado: 'cancelado',
          motivoCancelamento: motivoTexto,
          observacoes: `Desmarcado por ${agendamentoParaDesmarcar.compradorId === user?.uid ? 'comprador' : 'vendedor'}: ${motivoTexto}`
        };
      }

      // Feedback para o usuário
      addToast('Agendamento desmarcado com sucesso', 'success');

    } catch (error) {
      console.error('Erro ao desmarcar:', error);
      addToast('Erro ao desmarcar agendamento', 'error');
    } finally {
      // Limpa o estado do modal
      setShowDesmarcarModal(false);
      setMotivoDesmarcacao('');
      setMotivoPersonalizado('');
      setAgendamentoParaDesmarcar(null);
    }
  };

  // Agendamentos filtrados apenas por tipo (comprador/vendedor)
  const todosAgendamentos = useMemo(() => {
    return agendamentos.filter(agendamento => {
      return tipoVisualizacao === 'comprador' 
        ? agendamento.compradorId === user?.uid
        : agendamento.vendedorId === user?.uid;
    });
  }, [user, tipoVisualizacao]);

  // Agendamentos com todos os filtros aplicados
  const meusAgendamentos = useMemo(() => {
    let filtrados = todosAgendamentos;

    // Aplicar filtro de status
    if (statusFiltro !== 'todos') {
      filtrados = filtrados.filter(agendamento => {
        // Se o filtro for CONCLUIDO, mostrar apenas os realmente concluídos
        if (statusFiltro === STATUS_AGENDAMENTO.CONCLUIDO) {
          return agendamento.status === STATUS_AGENDAMENTO.CONCLUIDO && agendamento.resultado !== 'cancelado';
        }
        // Se o filtro for CANCELADO, mostrar apenas os cancelados
        if (statusFiltro === STATUS_AGENDAMENTO.CANCELADO) {
          return agendamento.status === STATUS_AGENDAMENTO.CANCELADO;
        }
        // Para outros status, filtrar normalmente
        return agendamento.status === statusFiltro;
      });
    }

    // Ordenação
    filtrados.sort((a, b) => {
      const aValue = a[ordenacao.campo];
      const bValue = b[ordenacao.campo];
      const modifier = ordenacao.direcao === 'asc' ? 1 : -1;

      return aValue > bValue ? modifier : -modifier;
    });

    return filtrados;
  }, [todosAgendamentos, statusFiltro, ordenacao]);

  const getVeiculo = (veiculoId) => {
    return mockAnuncios.publicados.find(v => v.id === veiculoId);
  };

  const handleSort = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAction = async (agendamentoId, action) => {
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    if (!agendamento) return;

    // Se a ação for cancelar, abre o modal ao invés de executar direto
    if (action === 'cancelar') {
      setAgendamentoParaDesmarcar(agendamento);
      setShowDesmarcarModal(true);
      return;
    }

    const agora = new Date();
    const dataAgendamento = new Date(agendamento.data);
    const quatroHorasAntes = new Date(dataAgendamento.getTime() - (4 * 60 * 60 * 1000));
    const isComprador = agendamento.compradorId === user?.uid;

    try {
      // Validações gerais
      if (!user) throw new Error('Usuário não autenticado');
      if (agendamento.status === STATUS_AGENDAMENTO.CONCLUIDO) 
        throw new Error('Agendamento já concluído');

      // Validações específicas por ação
      switch (action) {
        case 'confirmar':
          if (isComprador) throw new Error('Apenas o vendedor pode confirmar');
          if (agendamento.status !== STATUS_AGENDAMENTO.AGENDADO)
            throw new Error('Agendamento não está aguardando confirmação');

          // Executa a ação
          agendamento.status = STATUS_AGENDAMENTO.CONFIRMADO;
          agendamento.observacoes = 'Vendedor confirmou disponibilidade';
          break;

        case 'checkin':
          if (agendamento.status !== STATUS_AGENDAMENTO.CHECKIN)
            throw new Error('Agendamento não está em período de check-in');
          
          if (agora < quatroHorasAntes)
            throw new Error('Check-in ainda não está disponível');
          
          if (isComprador && agendamento.checkInComprador)
            throw new Error('Você já realizou o check-in');
          if (!isComprador && agendamento.checkInVendedor)
            throw new Error('Você já realizou o check-in');

          // Executa a ação
          if (isComprador) {
            agendamento.checkInComprador = true;
            agendamento.observacoes = 'Comprador realizou check-in';
          } else {
            agendamento.checkInVendedor = true;
            agendamento.observacoes = 'Vendedor realizou check-in';
          }

          // Se ambos fizeram check-in, muda para visita confirmada
          if (agendamento.checkInComprador && agendamento.checkInVendedor) {
            agendamento.status = STATUS_AGENDAMENTO.VISITA_CONFIRMADA;
            agendamento.observacoes = 'Visita confirmada por ambas as partes';
          }
          break;

        case 'concluir':
          if (!isComprador) throw new Error('Apenas o vendedor pode concluir');
          if (agendamento.status !== STATUS_AGENDAMENTO.ANDAMENTO)
            throw new Error('Visita não está em andamento');

          // Executa a ação
          agendamento.status = STATUS_AGENDAMENTO.CONCLUIDO;
          agendamento.resultado = 'realizado';
          agendamento.observacoes = 'Visita concluída pelo vendedor';
          break;

        case 'cancelar':
          if ([STATUS_AGENDAMENTO.ANDAMENTO, STATUS_AGENDAMENTO.CONCLUIDO, STATUS_AGENDAMENTO.CANCELADO].includes(agendamento.status))
            throw new Error('Não é possível desmarcar uma visita em andamento ou finalizada');
          if (!motivoDesmarcacao?.trim())
            throw new Error('Informe o motivo da desmarcação');

          // Executa a ação
          agendamento.status = STATUS_AGENDAMENTO.CANCELADO;
          agendamento.resultado = 'cancelado';
          agendamento.motivoCancelamento = motivoDesmarcacao;
          agendamento.observacoes = `Desmarcado por ${isComprador ? 'comprador' : 'vendedor'}: ${motivoDesmarcacao}`;
          break;

        default:
          throw new Error('Ação inválida');
      }

      // Atualiza o estado local (em produção, isso viria da API)
      setAgendamentos([...agendamentos]);

      // Feedback específico por ação
      switch (action) {
        case 'confirmar':
          addToast('Agendamento confirmado com sucesso!', 'success');
          break;
        case 'checkin':
          addToast('Check-in realizado com sucesso!', 'success');
          break;
        case 'concluir':
          addToast('Visita concluída com sucesso!', 'success');
          break;
        case 'cancelar':
          addToast('Agendamento desmarcado com sucesso', 'info');
          break;
      }

    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  // Filtrar agendamentos em check-in (independente do tipo de visualização)
  const agendamentosEmCheckin = useMemo(() => {
    return agendamentos.filter(agendamento => {
      // Verifica se o usuário é participante do agendamento (como comprador OU vendedor)
      const isMinhaParticipacao = agendamento.compradorId === user?.uid || 
                                 agendamento.vendedorId === user?.uid;

      // Verifica se está em status de check-in
      const estaEmCheckin = agendamento.status === STATUS_AGENDAMENTO.CHECKIN;

      // Verifica se está dentro da janela de check-in
      const agora = new Date();
      const dataAgendamento = new Date(agendamento.data);
      const quatroHorasAntes = new Date(dataAgendamento.getTime() - (4 * 60 * 60 * 1000));
      const dentroJanelaCheckin = agora >= quatroHorasAntes && agora <= dataAgendamento;

      // Retorna true se todas as condições forem atendidas
      return isMinhaParticipacao && estaEmCheckin && dentroJanelaCheckin;
    });
  }, [agendamentos, user]);

  // Contadores para as abas
  const contadorComprador = useMemo(() => {
    return agendamentos.filter(a => a.compradorId === user?.uid).length;
  }, [agendamentos, user]);

  const contadorVendedor = useMemo(() => {
    return agendamentos.filter(a => a.vendedorId === user?.uid).length;
  }, [agendamentos, user]);

  // Filtrar agendamentos aguardando confirmação
  const agendamentosAguardandoConfirmacao = useMemo(() => {
    return agendamentos.filter(agendamento => {
      const isMinhaParticipacao = agendamento.compradorId === user?.uid || agendamento.vendedorId === user?.uid;
      const precisaMinhaConfirmacao = (
        agendamento.status === STATUS_AGENDAMENTO.AGENDADO && 
        (
          (tipoVisualizacao === 'vendedor' && agendamento.vendedorId === user?.uid) ||
          (tipoVisualizacao === 'comprador' && agendamento.compradorId === user?.uid)
        )
      );

      return isMinhaParticipacao && precisaMinhaConfirmacao;
    });
  }, [agendamentos, user, tipoVisualizacao]);

  // Função para pegar o label contextual do status
  const getStatusLabel = (agendamento) => {
    const isComprador = agendamento.compradorId === user?.uid;
    const agora = new Date();
    const dataAgendamento = new Date(agendamento.data);
    const quatroHorasAntes = new Date(dataAgendamento.getTime() - (4 * 60 * 60 * 1000));
    const dentroJanelaCheckin = agora >= quatroHorasAntes;

    switch (agendamento.status) {
      case STATUS_AGENDAMENTO.AGENDADO:
        return isComprador 
          ? 'Aguardando confirmação do vendedor' 
          : 'Nova solicitação de visita';

      case STATUS_AGENDAMENTO.CONFIRMADO:
        if (!dentroJanelaCheckin) {
          return 'Aguardando horário de check-in';
        }
        // Se está dentro da janela, cai no próximo case
        
      case STATUS_AGENDAMENTO.CHECKIN:
        if (!dentroJanelaCheckin) {
          return 'Aguardando horário de check-in';
        }

        if (!agendamento.checkInComprador && !agendamento.checkInVendedor) {
          return 'Check-in disponível';
        }

        if (isComprador) {
          if (agendamento.checkInComprador && !agendamento.checkInVendedor) {
            return 'Você fez check-in • Aguardando vendedor';
          }
          if (!agendamento.checkInComprador && agendamento.checkInVendedor) {
            return 'Vendedor fez check-in • Faça seu check-in';
          }
        } else {
          if (agendamento.checkInComprador && !agendamento.checkInVendedor) {
            return 'Comprador fez check-in • Faça seu check-in';
          }
          if (!agendamento.checkInComprador && agendamento.checkInVendedor) {
            return 'Você fez check-in • Aguardando comprador';
          }
        }
        break;

      case STATUS_AGENDAMENTO.VISITA_CONFIRMADA:
        return 'Visita confirmada';

      case STATUS_AGENDAMENTO.ANDAMENTO:
        return 'Visita em andamento';

      case STATUS_AGENDAMENTO.CONCLUIDO:
        return 'Concluído';

      case STATUS_AGENDAMENTO.CANCELADO:
        return 'Cancelado';

      default:
        return 'Status desconhecido';
    }
  };

  // Movido para dentro do componente
  const getAcoesDisponiveis = (agendamento) => {
    const acoes = [];
    const isComprador = agendamento.compradorId === user?.uid;
    const agora = new Date();
    const dataAgendamento = new Date(agendamento.data);
    const quatroHorasAntes = new Date(dataAgendamento.getTime() - (4 * 60 * 60 * 1000));
    const dentroJanelaCheckin = agora >= quatroHorasAntes;

    switch (agendamento.status) {
      case STATUS_AGENDAMENTO.AGENDADO:
        // Apenas vendedor pode confirmar
        if (!isComprador) {
          acoes.push({
            label: 'Confirmar Disponibilidade',
            action: 'confirmar',
            icon: CheckIcon,
            color: 'text-green-400 hover:text-green-300'
          });
        }
        break;

      case STATUS_AGENDAMENTO.CONFIRMADO:
        // Nenhuma ação disponível, aguardando janela de check-in
        break;

      case STATUS_AGENDAMENTO.CHECKIN:
        // Check-in disponível apenas dentro da janela de 4h
        if (dentroJanelaCheckin) {
          if (isComprador && !agendamento.checkInComprador) {
            acoes.push({
              label: 'Fazer Check-in',
              action: 'checkin',
              icon: CheckBadgeIcon,
              color: 'text-blue-400 hover:text-blue-300'
            });
          }
          if (!isComprador && !agendamento.checkInVendedor) {
            acoes.push({
              label: 'Fazer Check-in',
              action: 'checkin',
              icon: CheckBadgeIcon,
              color: 'text-blue-400 hover:text-blue-300'
            });
          }
        }
        break;

      case STATUS_AGENDAMENTO.ANDAMENTO:
        // Apenas vendedor pode concluir manualmente
        if (!isComprador) {
          acoes.push({
            label: 'Concluir Visita',
            action: 'concluir',
            icon: FlagIcon,
            color: 'text-green-400 hover:text-green-300'
          });
        }
        break;
    }

    // Pode desmarcar até o início da visita
    if (![STATUS_AGENDAMENTO.ANDAMENTO, STATUS_AGENDAMENTO.CONCLUIDO].includes(agendamento.status)) {
      acoes.push({
        label: 'Desmarcar',
        action: 'cancelar',
        icon: XMarkIcon,
        color: 'text-red-400 hover:text-red-300'
      });
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

  // Função helper para mostrar toast
  const addToast = (message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Função para remover toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Função melhorada para verificar janela de check-in
  const isCheckInDisponivel = (agendamento) => {
    const agora = new Date();
    const dataAgendamento = new Date(agendamento.data);
    const quatroHorasAntes = new Date(dataAgendamento.getTime() - (4 * 60 * 60 * 1000));
    const umMinutoAntes = new Date(dataAgendamento.getTime() - (1 * 60 * 1000));

    return agora >= quatroHorasAntes && agora <= umMinutoAntes;
  };

  // Função melhorada para verificar transições automáticas
  const checkAutoTransitions = (agendamento) => {
    const agora = new Date();
    const dataAgendamento = new Date(agendamento.data);
    const quatroHorasAntes = new Date(dataAgendamento.getTime() - (4 * 60 * 60 * 1000));
    const duasHorasDepois = new Date(dataAgendamento.getTime() + (2 * 60 * 60 * 1000));

    // Se chegou na janela de check-in (4h antes)
    if (agora >= quatroHorasAntes && agendamento.status === STATUS_AGENDAMENTO.CONFIRMADO) {
      agendamento.status = STATUS_AGENDAMENTO.CHECKIN;
      agendamento.observacoes = 'Check-in disponível';
      addToast('Check-in disponível para um agendamento', 'info');
    }

    // Se ambos fizeram check-in
    if (agendamento.status === STATUS_AGENDAMENTO.CHECKIN && 
        agendamento.checkInComprador && 
        agendamento.checkInVendedor) {
      agendamento.status = STATUS_AGENDAMENTO.VISITA_CONFIRMADA;
      agendamento.observacoes = 'Visita confirmada por ambas as partes';
      addToast('Visita confirmada! Ambas as partes fizeram check-in', 'success');
    }

    // Se chegou no horário e a visita está confirmada
    if (agora >= dataAgendamento && agendamento.status === STATUS_AGENDAMENTO.VISITA_CONFIRMADA) {
      agendamento.status = STATUS_AGENDAMENTO.ANDAMENTO;
      agendamento.observacoes = 'Visita em andamento';
      addToast('Uma visita está em andamento', 'info');
    }

    // Se passou 2 horas do horário e estava em andamento
    if (agora >= duasHorasDepois && agendamento.status === STATUS_AGENDAMENTO.ANDAMENTO) {
      agendamento.status = STATUS_AGENDAMENTO.CONCLUIDO;
      agendamento.resultado = 'realizado';
      agendamento.observacoes = 'Visita concluída automaticamente';
      addToast('Uma visita foi concluída automaticamente', 'success');
    }
  };

  // Usar no useEffect para verificar periodicamente
  useEffect(() => {
    const timer = setInterval(() => {
      const needsUpdate = agendamentos.some(agendamento => {
        const oldStatus = agendamento.status;
        checkAutoTransitions(agendamento);
        return oldStatus !== agendamento.status;
      });

      if (needsUpdate) {
        setAgendamentos([...agendamentos]);
      }
    }, 60000); // Verifica a cada minuto

    return () => clearInterval(timer);
  }, [agendamentos]);

  const filtrosStatus = useMemo(() => {
    const isComprador = tipoVisualizacao === 'comprador';
    return getFiltrosStatus(isComprador);
  }, [tipoVisualizacao]);

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
            <div className="border-b border-gray-700 pb-6">
              <h2 className="sr-only">
                Agendamentos Aguardando Check-in
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Confirme sua presença até 4 horas antes do horário agendado
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agendamentosEmCheckin.map(agendamento => {
                  const veiculo = getVeiculo(agendamento.veiculoId);
                  if (!veiculo) return null;

                  const isComprador = agendamento.compradorId === user?.uid;

                  return (
                    <div 
                      key={agendamento.id}
                      className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
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

          {/* Agendamentos Aguardando Confirmação */}
          {agendamentosAguardandoConfirmacao.length > 0 && (
            <div className="border-b border-gray-700 pb-6">
              <h2 className="sr-only">
                Agendamentos Aguardando Confirmação
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                {tipoVisualizacao === 'vendedor' 
                  ? 'Confirme sua disponibilidade para as visitas solicitadas'
                  : 'Aguardando confirmação do vendedor para as visitas solicitadas'
                }
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agendamentosAguardandoConfirmacao.map(agendamento => {
                  const veiculo = getVeiculo(agendamento.veiculoId);
                  if (!veiculo) return null;

                  const isComprador = agendamento.compradorId === user?.uid;

                  return (
                    <div 
                      key={agendamento.id}
                      className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
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
                        {tipoVisualizacao === 'vendedor' && (
                          <button
                            onClick={() => handleAction(agendamento.id, 'confirmar')}
                            className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            <CheckIcon className="h-4 w-4" />
                            <span>Confirmar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="space-y-6">
            {/* Tipo de Visualização - Estilo de abas com contador */}
            <div className="border-b border-gray-700">
              <div className="flex space-x-8">
                <button
                  onClick={() => setTipoVisualizacao('comprador')}
                  className={`relative py-4 px-1 text-sm font-medium transition-colors ${
                    tipoVisualizacao === 'comprador'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5" />
                    <span>Comprador</span>
                    {contadorComprador > 0 && (
                      <span className="bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                        {contadorComprador}
                      </span>
                    )}
                  </div>
                  {tipoVisualizacao === 'comprador' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
                <button
                  onClick={() => setTipoVisualizacao('vendedor')}
                  className={`relative py-4 px-1 text-sm font-medium transition-colors ${
                    tipoVisualizacao === 'vendedor'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BuildingStorefrontIcon className="h-5 w-5" />
                    <span>Vendedor</span>
                    {contadorVendedor > 0 && (
                      <span className="bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                        {contadorVendedor}
                      </span>
                    )}
                  </div>
                  {tipoVisualizacao === 'vendedor' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Status - Pills com contador */}
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              <span className="text-sm text-gray-400 whitespace-nowrap">Status:</span>
              <div className="flex space-x-2">
                {filtrosStatus.map(({ value, label }) => {
                  const count = value === 'todos' 
                    ? todosAgendamentos.length
                    : todosAgendamentos.filter(a => {
                        if (value === STATUS_AGENDAMENTO.CONCLUIDO) {
                          return a.status === value && a.resultado !== 'cancelado';
                        }
                        if (value === STATUS_AGENDAMENTO.CANCELADO) {
                          return a.status === value;
                        }
                        return a.status === value;
                      }).length;
                  
                  return (
                    <button
                      key={value}
                      onClick={() => setStatusFiltro(value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        statusFiltro === value
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{label}</span>
                        {count > 0 && (
                          <span className="bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
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
                                <span>{getStatusLabel(agendamento)}</span>
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
                                  className="text-gray-500 hover:text-white transition-colors p-1 block"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </Link>
                              </Tooltip>
                              
                              {getAcoesDisponiveis(agendamento).map((acao) => (
                                <Tooltip key={acao.action} label={acao.label}>
                                  <button
                                    onClick={() => handleAction(agendamento.id, acao.action)}
                                    className={`text-gray-500 ${
                                      acao.action === 'cancelar' 
                                        ? 'hover:text-red-400' 
                                        : acao.action === 'confirmar' || acao.action === 'checkin'
                                          ? 'hover:text-green-400'
                                          : 'hover:text-white'
                                    } transition-colors p-1`}
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
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">
                Desmarcar Agendamento
              </h3>
              <button
                onClick={() => {
                  setShowDesmarcarModal(false);
                  setMotivoDesmarcacao('');
                  setMotivoPersonalizado('');
                  setAgendamentoParaDesmarcar(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-500">
                    Atenção
                  </h4>
                  <p className="mt-1 text-sm text-yellow-400/90">
                    Esta ação não pode ser desfeita. A outra parte será notificada sobre o cancelamento e o motivo informado.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-gray-200">
                Selecione o motivo da desmarcação:
              </label>
              <div className="space-y-2">
                {MOTIVOS_DESMARCACAO[agendamentoParaDesmarcar?.compradorId === user?.uid ? 'comprador' : 'vendedor'].map((motivo) => (
                  <label
                    key={motivo.id}
                    className={`flex items-start p-3 rounded-lg border ${
                      motivoDesmarcacao === motivo.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-700 hover:bg-gray-750'
                    } cursor-pointer transition-colors`}
                  >
                    <input
                      type="radio"
                      name="motivo"
                      value={motivo.id}
                      checked={motivoDesmarcacao === motivo.id}
                      onChange={() => setMotivoDesmarcacao(motivo.id)}
                      className="mt-1 text-orange-500 focus:ring-orange-500 border-gray-600 bg-gray-700"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{motivo.label}</p>
                      <p className="text-xs text-gray-400">{motivo.descricao}</p>
                    </div>
                  </label>
                ))}
              </div>

              {motivoDesmarcacao === 'outro' && (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Especifique o motivo:
                  </label>
                  <textarea
                    value={motivoPersonalizado}
                    onChange={(e) => setMotivoPersonalizado(e.target.value)}
                    placeholder="Descreva o motivo da desmarcação..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleConfirmarDesmarcacao}
                disabled={!motivoDesmarcacao || (motivoDesmarcacao === 'outro' && !motivoPersonalizado.trim())}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Confirmar Desmarcação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <ToastContainer 
          toasts={toasts}
          removeToast={removeToast}
        />
      )}
    </main>
  );
} 