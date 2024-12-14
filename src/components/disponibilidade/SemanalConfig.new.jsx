import { useState, useMemo, useEffect } from 'react';
import HorarioModal from './HorarioModal';
import Calendar from '../Calendar';
import { format, isAfter, startOfDay, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';

const diasDaSemana = [
  { key: 'dom', label: 'Domingo' },
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' }
];

export default function SemanalConfig({ horarios, onChange, datasDisponiveis = [] }) {
  const { storeSettings } = useDisponibilidade();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    diaSemana: null,
    horarios: []
  });
  const [hoveredWeekday, setHoveredWeekday] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verifica se um dia está disponível nas configurações da loja
  const isDiaDisponivelNaLoja = (diaSemana) => {
    return storeSettings?.weekDays?.[diaSemana]?.active !== false;
  };

  // Verifica se uma data está disponível para configuração
  const isDataDisponivel = (date) => {
    // Primeiro verifica se o dia da semana está disponível na loja
    const diaSemana = diasDaSemana[date.getDay()].key;
    if (!isDiaDisponivelNaLoja(diaSemana)) return false;
    
    // Se não houver lista de datas disponíveis, considera todas disponíveis
    if (!datasDisponiveis.length) return true;
    
    // Verifica se a data está na lista de datas disponíveis
    return datasDisponiveis.some(dataDisp => {
      const dataDispDate = new Date(dataDisp);
      return date.getDate() === dataDispDate.getDate() &&
             date.getMonth() === dataDispDate.getMonth() &&
             date.getFullYear() === dataDispDate.getFullYear();
    });
  };

  // Verifica se um dia da semana está ativo
  const isDiaSemanaAtivo = (diaSemana) => {
    return isDiaDisponivelNaLoja(diaSemana) && horarios[diaSemana]?.ativo && horarios[diaSemana].horarios.length > 0;
  };

  // Converte os dias ativos em datas para o calendário
  const getDiasAtivos = () => {
    const hoje = startOfDay(new Date());
    const todasDatasDoMes = eachDayOfInterval({
      start: startOfDay(hoje),
      end: endOfMonth(hoje)
    });

    return todasDatasDoMes.filter(data => {
      const diaSemana = diasDaSemana[data.getDay()].key;
      const diaAtivo = isDiaSemanaAtivo(diaSemana);
      const isFutureDate = isAfter(startOfDay(data), startOfDay(new Date()));
      return diaAtivo && isFutureDate && isDataDisponivel(data);
    });
  };

  const diasAtivos = useMemo(() => getDiasAtivos(), [horarios, datasDisponiveis, storeSettings]);

  const handleCalendarSelect = (dates) => {
    console.log('\n=== handleCalendarSelect ===');
    console.log('Datas selecionadas:', dates?.map(d => d.toISOString().split('T')[0]));
    
    if (!dates || !dates.length) return;
    
    const date = dates[0];
    const diaSemana = diasDaSemana[date.getDay()].key;

    // Verifica se o dia está disponível na loja
    if (!isDiaDisponivelNaLoja(diaSemana)) {
      setError('Este dia não está disponível para agendamento.');
      return;
    }

    if (!isDataDisponivel(date)) {
      console.log('Data não disponível:', date.toISOString().split('T')[0]);
      return;
    }

    console.log('Dia da semana selecionado:', diaSemana);
    console.log('===================\n');

    handleOpenModal(diaSemana);
  };

  const handleDayMouseEnter = (date) => {
    if (!isDataDisponivel(date)) return;
    const dayOfWeek = date.getDay();
    setHoveredWeekday(dayOfWeek);
  };

  const handleDayMouseLeave = () => {
    setHoveredWeekday(null);
  };

  const toggleDia = (dia) => {
    // Verifica se o dia está disponível na loja
    if (!isDiaDisponivelNaLoja(dia)) {
      setError('Este dia não está disponível para agendamento.');
      return;
    }

    const diaConfig = horarios[dia];
    
    if (!diaConfig.ativo || !diaConfig.horarios.length) {
      handleOpenModal(dia);
    } else {
      onChange({
        ...horarios,
        [dia]: {
          ativo: false,
          horarios: []
        }
      });
    }
  };

  const handleHorarioConfirm = async (horarioData) => {
    setError(null);
    setIsLoading(true);
    try {
      console.log('\n=== handleHorarioConfirm ===');
      console.log('Dados recebidos:', horarioData);
      console.log('Estado atual:', modalConfig);
      
      if (modalConfig.diaSemana) {
        // Verifica se o dia está disponível na loja
        if (!isDiaDisponivelNaLoja(modalConfig.diaSemana)) {
          throw new Error('Este dia não está disponível para agendamento.');
        }

        const { horarios: horariosNovos, replicar } = horarioData;
        const novoHorarios = { ...horarios };
        const horarioAtual = horarios[modalConfig.diaSemana]?.horarios || [];

        // Função para adicionar horário a um dia específico
        const adicionarHorarioAoDia = (dia) => {
          // Verifica se o dia está disponível na loja
          if (!isDiaDisponivelNaLoja(dia)) return;

          // Filtra apenas os horários disponíveis na loja
          const horariosPermitidos = horariosNovos.filter(horario => 
            storeSettings?.weekDays?.[dia]?.slots?.includes(horario)
          );

          if (horariosPermitidos.length > 0) {
            novoHorarios[dia] = {
              ativo: true,
              horarios: horariosPermitidos
            };
            console.log(`Adicionando horários ao dia ${dia}:`, horariosPermitidos);
          }
        };

        // Se está removendo horários
        if (horariosNovos.length === 0) {
          console.log('Removendo horários do dia:', modalConfig.diaSemana);
          novoHorarios[modalConfig.diaSemana] = {
            ativo: false,
            horarios: []
          };
        } else {
          // Adiciona apenas ao dia atual
          adicionarHorarioAoDia(modalConfig.diaSemana);

          // Se houver replicação, adiciona aos outros dias ativos
          if (replicar) {
            console.log('Replicando horários para dias ativos...');
            // Pega apenas os dias que já estão ativos
            const diasAtivos = Object.entries(horarios)
              .filter(([dia, config]) => isDiaDisponivelNaLoja(dia) && config.ativo && config.horarios.length > 0)
              .map(([dia]) => dia);

            console.log('Dias ativos encontrados:', diasAtivos);

            // Replica para todos os dias ativos
            diasAtivos.forEach(dia => {
              if (dia !== modalConfig.diaSemana) {
                adicionarHorarioAoDia(dia);
              }
            });
          }
        }

        console.log('Novo estado dos horários:', novoHorarios);
        onChange(novoHorarios);
      }
    } catch (err) {
      console.error('Erro ao salvar horários:', err);
      setError(err.message || 'Erro ao salvar horários. Tente novamente.');
    } finally {
      setIsLoading(false);
      console.log('===================\n');
      setModalConfig({ isOpen: false, diaSemana: null, horarios: [] });
    }
  };

  // Memoiza os dias configurados para evitar recálculos
  const diasConfigurados = useMemo(() => {
    return Object.entries(horarios)
      .reduce((acc, [dia, config]) => {
        if (isDiaDisponivelNaLoja(dia) && config.ativo && config.horarios.length > 0) {
          acc.push(dia);
        }
        return acc;
      }, []);
  }, [horarios, storeSettings]);

  // Verifica se deve mostrar replicação
  const verificarReplicacao = (diaSemana) => {
    // Filtra o dia atual dos dias configurados
    return diasConfigurados.length > 1 || 
           (diasConfigurados.length === 1 && diasConfigurados[0] !== diaSemana);
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, diaSemana: null, horarios: [] });
  };

  const handleOpenModal = (diaSemana) => {
    // Verifica se o dia está disponível na loja
    if (!isDiaDisponivelNaLoja(diaSemana)) {
      setError('Este dia não está disponível para agendamento.');
      return;
    }

    setModalConfig({
      isOpen: true,
      diaSemana,
      horarios: horarios[diaSemana]?.horarios || [],
      showReplicacao: verificarReplicacao(diaSemana)
    });
  };

  const isDateActive = (date) => {
    const diaSemana = diasDaSemana[date.getDay()].key;
    const isAtivo = isDiaSemanaAtivo(diaSemana);
    const isFutureDate = isAfter(startOfDay(date), startOfDay(new Date()));
    return isAtivo && isFutureDate;
  };

  return (
    <div className="space-y-8">
      {/* Mensagens de Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg animate-fade-in">
          <p className="text-red-200 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}
      
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4 transform transition-all duration-200 hover:shadow-lg">
        <Calendar
          mode="multiple"
          selected={diasAtivos}
          onChange={handleCalendarSelect}
          weekView={true}
          minDate={startOfDay(new Date())}
          disabledDates={datasDisponiveis.length > 0 ? 
            (date) => !isDataDisponivel(date) 
            : undefined
          }
          onDayMouseEnter={handleDayMouseEnter}
          onDayMouseLeave={handleDayMouseLeave}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600 transform transition-all duration-200 scale-110",
            day_today: "bg-gray-700 text-white",
          }}
        />
      </div>

      {/* Lista de dias */}
      <div className="space-y-4">
        {diasDaSemana.map(({ key, label }) => {
          const isAtivo = isDiaSemanaAtivo(key);
          const isDisponivel = isDiaDisponivelNaLoja(key);
          const isHovered = hoveredWeekday === diasDaSemana.findIndex(d => d.key === key);

          return (
            <div 
              key={key} 
              className={`
                p-4 rounded-lg border transition-all duration-200
                ${isDisponivel ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                ${isAtivo ? 'bg-orange-500/20 border-orange-500/30' : 'bg-gray-800 border-gray-700'}
                ${isHovered ? 'border-orange-500/50' : ''}
                ${isDisponivel ? 'hover:border-orange-500/50' : ''}
              `}
              onClick={() => isDisponivel && toggleDia(key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`text-lg ${isAtivo ? 'text-orange-500' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  {!isDisponivel && (
                    <span className="text-sm text-gray-500">
                      (Indisponível)
                    </span>
                  )}
                </div>
                {isAtivo && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                      {horarios[key].horarios.length} horário(s)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDia(key);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Horários */}
      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        horariosSelecionados={modalConfig.horarios}
        showReplicacao={modalConfig.showReplicacao}
        isLoading={isLoading}
        diaSemana={modalConfig.diaSemana}
        horariosDisponiveis={modalConfig.diaSemana ? storeSettings?.weekDays?.[modalConfig.diaSemana]?.slots || [] : []}
      />
    </div>
  );
} 