import { useState, useMemo, useEffect } from 'react';
import HorarioModal from './HorarioModal';
import Calendar from '../Calendar';
import { format, isAfter, startOfDay, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon, ExclamationTriangleIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import { normalizeDate, normalizeDateString } from '@/utils/dateUtils';

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
    const diaConfig = storeSettings?.weekDays?.[diaSemana];
    return diaConfig?.active !== false && diaConfig?.slots?.length > 0;
  };

  // Verifica se uma data está disponível para configuração
  const isDataDisponivel = (date) => {
    if (!date) return false;
    
    // Primeiro verifica se o dia da semana está disponível na loja
    const diaSemana = diasDaSemana[date.getDay()].key;
    if (!isDiaDisponivelNaLoja(diaSemana)) return false;
    
    // Se não houver lista de datas disponíveis, considera todas disponíveis
    if (!datasDisponiveis.length) return true;
    
    // Normaliza a data para comparação
    const dateStr = normalizeDateString(date);
    
    // Verifica se a data está na lista de datas disponíveis
    return datasDisponiveis.some(dataDisp => normalizeDateString(dataDisp) === dateStr);
  };

  // Verifica se um dia da semana está ativo
  const isDiaSemanaAtivo = (diaSemana) => {
    return isDiaDisponivelNaLoja(diaSemana) && horarios[diaSemana]?.ativo && horarios[diaSemana].horarios.length > 0;
  };

  // Converte os dias ativos em datas para o calendário
  const getDiasAtivos = () => {
    const hoje = normalizeDate(new Date());
    const todasDatasDoMes = eachDayOfInterval({
      start: hoje,
      end: endOfMonth(hoje)
    });

    return todasDatasDoMes.filter(data => {
      const diaSemana = diasDaSemana[data.getDay()].key;
      const diaAtivo = isDiaSemanaAtivo(diaSemana);
      const isFutureDate = isAfter(normalizeDate(data), hoje);
      return diaAtivo && isFutureDate && isDataDisponivel(data);
    });
  };

  const diasAtivos = useMemo(() => getDiasAtivos(), [horarios, datasDisponiveis, storeSettings]);

  const handleCalendarSelect = (dates) => {
    if (!dates || !dates.length) return;
    
    const date = dates[0];
    const diaSemana = diasDaSemana[date.getDay()].key;

    // Verifica se o dia está disponível na loja
    if (!isDiaDisponivelNaLoja(diaSemana)) {
      setError('Este dia não está disponível para agendamento.');
      return;
    }

    if (!isDataDisponivel(date)) {
      return;
    }

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
          }
        };

        // Se está removendo horários
        if (horariosNovos.length === 0) {
          novoHorarios[modalConfig.diaSemana] = {
            ativo: false,
            horarios: []
          };
        } else {
          // Adiciona apenas ao dia atual
          adicionarHorarioAoDia(modalConfig.diaSemana);

          // Se houver replicação, adiciona aos outros dias ativos
          if (replicar) {
            // Pega apenas os dias que já estão ativos
            const diasAtivos = Object.entries(horarios)
              .filter(([dia, config]) => isDiaDisponivelNaLoja(dia) && config.ativo && config.horarios.length > 0)
              .map(([dia]) => dia);

            // Replica para todos os dias ativos
            diasAtivos.forEach(dia => {
              if (dia !== modalConfig.diaSemana) {
                adicionarHorarioAoDia(dia);
              }
            });
          }
        }

        onChange(novoHorarios);
      }
    } catch (err) {
      setError(err.message || 'Erro ao salvar horários. Tente novamente.');
    } finally {
      setIsLoading(false);
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
    const isFutureDate = isAfter(normalizeDate(date), normalizeDate(new Date()));
    return isAtivo && isFutureDate;
  };

  // Função para verificar se uma data está desabilitada
  const isDateDisabled = (date) => {
    if (!date) return true;
    
    // Primeiro verifica se o dia da semana está disponível na loja
    const diaSemana = diasDaSemana[date.getDay()].key;
    if (!isDiaDisponivelNaLoja(diaSemana)) {
      return true;
    }
    
    // Se não houver lista de datas disponíveis, considera todas disponíveis
    if (!datasDisponiveis.length) return false;
    
    // Normaliza a data para comparação
    const dateStr = normalizeDateString(date);
    
    // Verifica se a data está na lista de datas disponíveis
    return !datasDisponiveis.some(dataDisp => normalizeDateString(dataDisp) === dateStr);
  };

  // Função para formatar os horários de forma padronizada
  const formatHorarios = (horarios) => {
    return horarios
      .sort()
      .map((h, idx) => (
        <span key={h} className="inline-block">
          <span className="text-gray-300">{h}</span>
          {idx < horarios.length - 1 && <span className="text-gray-500 mx-1">•</span>}
        </span>
      ));
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
          minDate={normalizeDate(new Date())}
          disabledDates={isDateDisabled}
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
          const config = horarios[key] || { ativo: false, horarios: [] };
          const isDisabled = !isDiaDisponivelNaLoja(key);
          const isHovered = hoveredWeekday === key;

          return (
            <div
              key={key}
              className={`
                bg-gray-800 rounded-lg p-4 transition-all duration-200
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/50 cursor-pointer'}
                ${isHovered ? 'ring-2 ring-orange-500/50' : ''}
              `}
              onClick={() => !isDisabled && handleOpenModal(key)}
              onMouseEnter={() => setHoveredWeekday(key)}
              onMouseLeave={() => setHoveredWeekday(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-200 font-medium">{label}</span>
                    {config.ativo && (
                      <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  {config.ativo && config.horarios.length > 0 && (
                    <div className="text-sm mt-1 truncate">
                      {formatHorarios(config.horarios)}
                    </div>
                  )}
                </div>
                {!isDisabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (config.ativo) {
                        onChange({
                          ...horarios,
                          [key]: {
                            ativo: false,
                            horarios: []
                          }
                        });
                      } else {
                        handleOpenModal(key);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {config.ativo ? (
                      <TrashIcon className="w-5 h-5 hover:text-red-400" />
                    ) : (
                      <PlusIcon className="w-5 h-5" />
                    )}
                  </button>
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