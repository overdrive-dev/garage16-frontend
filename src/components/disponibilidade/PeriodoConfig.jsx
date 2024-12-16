import { format, eachDayOfInterval, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Calendar, { CalendarSkeleton } from '@/components/Calendar';
import HorarioModal from './HorarioModal';
import { 
  normalizeDate, 
  normalizeDateString, 
  isValidDate, 
  getDayOfWeek, 
  getDayString,
  toFirebaseDate,
  fromFirebaseDate,
  formatDateDisplay
} from '@/utils/dateUtils';
import { useState, useEffect } from 'react';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import { PencilIcon, TrashIcon, LockClosedIcon, LockOpenIcon, PlusIcon } from '@heroicons/react/24/outline';
import HorarioCard from './HorarioCard';

class PeriodoManager {
  constructor(datas = {}) {
    this.datas = datas;
  }

  getDatasOrdenadas() {
    try {
      return Object.entries(this.datas)
        .map(([data, horarios]) => {
          const dataObj = fromFirebaseDate(data);
          return dataObj ? {
            data: dataObj,
            horarios: Array.isArray(horarios) ? horarios.sort() : [],
            dateStr: data
          } : null;
        })
        .filter(item => item !== null)
        .sort((a, b) => a.data - b.data);
    } catch (error) {
      console.error('Erro ao ordenar datas:', error);
      return [];
    }
  }

  getPeriodoCompleto() {
    const datasOrdenadas = this.getDatasOrdenadas();
    if (datasOrdenadas.length === 0) return null;

    return {
      from: datasOrdenadas[0].data,
      to: datasOrdenadas[datasOrdenadas.length - 1].data,
      datas: datasOrdenadas
    };
  }

  getPeriodoContendoData(data) {
    const datasOrdenadas = this.getDatasOrdenadas();
    if (datasOrdenadas.length === 0) return null;

    const dataIndex = datasOrdenadas.findIndex(
      item => item.data.getTime() === data.getTime()
    );
    if (dataIndex === -1) return null;

    let startIndex = dataIndex;
    let endIndex = dataIndex;

    while (startIndex > 0) {
      const currentDate = datasOrdenadas[startIndex].data;
      const prevDate = datasOrdenadas[startIndex - 1].data;
      const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) break;
      startIndex--;
    }

    while (endIndex < datasOrdenadas.length - 1) {
      const currentDate = datasOrdenadas[endIndex].data;
      const nextDate = datasOrdenadas[endIndex + 1].data;
      const diffDays = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) break;
      endIndex++;
    }

    return {
      from: datasOrdenadas[startIndex].data,
      to: datasOrdenadas[endIndex].data,
      datas: datasOrdenadas.slice(startIndex, endIndex + 1)
    };
  }

  getHorariosNoPeriodo(from, to) {
    const datasNoPeriodo = this.getDatasOrdenadas()
      .filter(({ data }) => data >= from && data <= to);
    
    const todosHorarios = new Set();
    datasNoPeriodo.forEach(({ horarios }) => {
      horarios.forEach(h => todosHorarios.add(h));
    });

    return Array.from(todosHorarios).sort();
  }
}

// Funções de localStorage
const STORAGE_KEY = 'periodoHorarios';

const saveToLocalStorage = (datas) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datas));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
    return null;
  }
};

export default function PeriodoConfig() {
  const { 
    currentConfig, 
    updateCurrentConfig, 
    storeSettings,
    hasConfiguredSlots,
    getHorariosData
  } = useDisponibilidade();

  const [periodo, setPeriodo] = useState(null);
  const [periodoTravado, setPeriodoTravado] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    data: null,
    horarios: [],
    showReplicacao: false
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Efeito para carregar o período inicial
  useEffect(() => {
    if (currentConfig?.faixaHorario?.dataInicio && currentConfig?.faixaHorario?.dataFim) {
      const from = fromFirebaseDate(currentConfig.faixaHorario.dataInicio);
      const to = fromFirebaseDate(currentConfig.faixaHorario.dataFim);
      if (from && to) {
        setPeriodo({ from, to });
        setPeriodoTravado(true);
      }
    }
  }, [currentConfig?.faixaHorario?.dataInicio, currentConfig?.faixaHorario?.dataFim]);

  // Função para destravar o período
  const handleDestravarPeriodo = () => {
    setPeriodoTravado(false);
    setPeriodo(null);
    updateCurrentConfig(prev => ({
      ...prev,
      tipo: 'faixaHorario',
      faixaHorario: {
        dataInicio: null,
        dataFim: null,
        horarios: {}
      }
    }));
  };

  // Função para atualizar o período
  const handlePeriodoChange = (newPeriod) => {
    // Sempre atualiza o estado do período
    setPeriodo(newPeriod);

    // Se não tiver período completo, retorna
    if (!newPeriod?.from || !newPeriod?.to) {
      return;
    }

    // Se tiver período completo, trava e abre modal
    setPeriodoTravado(true);

    // Obtém os horários disponíveis para o dia da semana
    const diaSemana = getDayString(getDayOfWeek(newPeriod.from));
    if (!diaSemana) return;

    const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];
    
    // Abre o modal para configurar os horários
    setModalConfig({
      isOpen: true,
      data: newPeriod.from,
      horarios: [],
      showReplicacao: true
    });

    // Atualiza o currentConfig com o novo período
    updateCurrentConfig(prev => ({
      ...prev,
      tipo: 'faixaHorario',
      faixaHorario: {
        ...prev.faixaHorario,
        dataInicio: toFirebaseDate(newPeriod.from),
        dataFim: toFirebaseDate(newPeriod.to),
        horarios: {}
      }
    }));
  };

  // Função para verificar se uma data está desabilitada
  const isDateDisabled = (date) => {
    if (!date || !storeSettings) return true;
    
    // Se o período estiver travado, só permite datas dentro do período
    if (periodoTravado && periodo) {
      if (isBefore(date, periodo.from) || isAfter(date, periodo.to)) return true;
    }
    
    const dayIndex = getDayOfWeek(date);
    const diaSemana = getDayString(dayIndex);
    if (!diaSemana) return true;

    // Verifica se o dia está disponível na loja
    const diaConfig = storeSettings.weekDays?.[diaSemana];
    const diaDisponivel = diaConfig?.active !== false && Array.isArray(diaConfig?.slots) && diaConfig.slots.length > 0;

    return !diaDisponivel;
  };

  // Função para obter os dias do período atual
  const getDiasPeriodo = () => {
    if (!periodo?.from || !periodo?.to) return [];

    const diasNoPeriodo = eachDayOfInterval({
      start: periodo.from,
      end: periodo.to
    });

    return diasNoPeriodo.map(data => ({
      data,
      horarios: getHorariosData(data) || [],
      configurado: hasConfiguredSlots(data)
    }));
  };

  // Função para alternar o bloqueio do período
  const togglePeriodoTravado = () => {
    setPeriodoTravado(prev => !prev);
  };

  // Função para selecionar uma data no calendário
  const handleCalendarSelect = (date) => {
    if (!date) return;

    const normalizedDate = normalizeDate(date);
    const diaSemana = getDayString(getDayOfWeek(normalizedDate));
    if (!diaSemana) return;

    // Obtém os horários disponíveis para o dia da semana
    const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];
    
    // Obtém os horários já configurados para a data
    const dateStr = normalizeDateString(normalizedDate);
    const horariosConfigurados = currentConfig?.faixaHorario?.horarios?.[dateStr] || [];

    setModalConfig({
      isOpen: true,
      data: normalizedDate,
      horarios: horariosConfigurados,
      showReplicacao: true
    });
  };

  // Função para fechar o modal
  const handleModalClose = () => {
    setModalConfig(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Função para confirmar horários
  const handleHorarioConfirm = ({ horarios, replicar, diasSemana }) => {
    if (!modalConfig.data || !periodo) return;

    const dateStr = normalizeDateString(modalConfig.data);
    
    updateCurrentConfig(prev => {
      const novasHorarios = { ...prev.faixaHorario?.horarios };

      // Filtra os horários que estão disponíveis para o dia
      const filtrarHorariosDisponiveis = (data, horariosParaFiltrar) => {
        const diaSemana = getDayString(getDayOfWeek(data));
        if (!diaSemana) return [];

        const horariosDisponiveisDia = storeSettings?.weekDays?.[diaSemana]?.slots || [];
        return horariosParaFiltrar.filter(horario => horariosDisponiveisDia.includes(horario));
      };

      if (replicar) {
        // Se replicação está ativada
        if (diasSemana && diasSemana.length > 0) {
          // Replicar para dias específicos da semana
          const diasNoPeriodo = eachDayOfInterval({
            start: periodo.from,
            end: periodo.to
          });

          diasNoPeriodo.forEach(data => {
            const diaSemana = getDayString(getDayOfWeek(data));
            if (!diaSemana || !diasSemana.includes(diaSemana)) return;

            // Filtra apenas os horários disponíveis para este dia
            const horariosDisponiveis = filtrarHorariosDisponiveis(data, horarios);
            if (horariosDisponiveis.length === 0) return;

            const dataStr = toFirebaseDate(data);
            if (!dataStr) return;

            novasHorarios[dataStr] = horariosDisponiveis;
          });
        } else {
          // Replicar para todos os dias do período
          const diasNoPeriodo = eachDayOfInterval({
            start: periodo.from,
            end: periodo.to
          });

          diasNoPeriodo.forEach(data => {
            // Filtra apenas os horários disponíveis para este dia
            const horariosDisponiveis = filtrarHorariosDisponiveis(data, horarios);
            if (horariosDisponiveis.length === 0) return;

            const dataStr = toFirebaseDate(data);
            if (!dataStr) return;

            novasHorarios[dataStr] = horariosDisponiveis;
          });
        }
      } else {
        // Sem replicação, atualiza apenas a data selecionada
        const horariosDisponiveis = filtrarHorariosDisponiveis(modalConfig.data, horarios);
        if (horariosDisponiveis.length > 0) {
          novasHorarios[dateStr] = horariosDisponiveis;
        }
      }

      return {
        ...prev,
        tipo: 'faixaHorario',
        faixaHorario: {
          ...prev.faixaHorario,
          horarios: novasHorarios
        }
      };
    });

    handleModalClose();
  };

  // Função para lidar com clique no calendário após período selecionado
  const handleCalendarClick = (date) => {
    if (!date) return;

    // Se o período não estiver travado, usa a lógica normal de seleção
    if (!periodoTravado) {
      handlePeriodoChange({ from: date, to: null });
      return;
    }

    // Se o período estiver travado, abre o modal de edição
    const normalizedDate = normalizeDate(date);
    const diaSemana = getDayString(getDayOfWeek(normalizedDate));
    if (!diaSemana) return;

    // Obtém os horários disponíveis para o dia da semana
    const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];
    
    // Obtém os horários já configurados para a data
    const dateStr = normalizeDateString(normalizedDate);
    const horariosConfigurados = currentConfig?.faixaHorario?.horarios?.[dateStr] || [];

    setModalConfig({
      isOpen: true,
      data: normalizedDate,
      horarios: horariosConfigurados,
      showReplicacao: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-200">
            {periodoTravado ? 'Período Selecionado' : 'Selecione um Período'}
          </h3>
          {periodoTravado && (
            <button
              type="button"
              onClick={handleDestravarPeriodo}
              className="px-3 py-1 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Alterar Período
            </button>
          )}
        </div>
        <Calendar
          mode="range"
          selected={periodo}
          onChange={handlePeriodoChange}
          minDate={normalizeDate(new Date())}
          disabledDates={isDateDisabled}
          hasConfiguredSlots={hasConfiguredSlots}
          getHorariosData={getHorariosData}
          onDateClick={handleCalendarClick}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white",
          }}
        />
      </div>

      {/* Lista de horários configurados */}
      <div className="space-y-4">
        <div className="space-y-2">
          {Object.entries(currentConfig?.faixaHorario?.horarios || {}).map(([dateStr, horarios]) => {
            const data = fromFirebaseDate(dateStr);
            if (!data || !Array.isArray(horarios)) return null;

            return (
              <HorarioCard
                key={dateStr}
                data={data}
                horarios={horarios}
                onEdit={() => {
                  setModalConfig({
                    isOpen: true,
                    data,
                    horarios,
                    showReplicacao: true
                  });
                }}
                onDelete={() => {
                  updateCurrentConfig(prev => {
                    const novasHorarios = { ...prev.faixaHorario?.horarios };
                    delete novasHorarios[dateStr];
                    return {
                      ...prev,
                      faixaHorario: {
                        ...prev.faixaHorario,
                        horarios: novasHorarios
                      }
                    };
                  });
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Modal de Horários */}
      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.data}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao="faixaHorario"
        horariosDisponiveis={modalConfig.data ? 
          storeSettings?.weekDays?.[getDayString(getDayOfWeek(modalConfig.data))]?.slots || [] 
          : []
        }
      />
    </div>
  );
} 