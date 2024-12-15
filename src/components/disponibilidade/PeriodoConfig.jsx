import { format, eachDayOfInterval } from 'date-fns';
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
import { PencilIcon, TrashIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

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

export default function PeriodoConfig({ datas = {}, onChange, ultimoHorario = [] }) {
  const { storeSettings, loading } = useDisponibilidade();
  const [selectedPeriod, setSelectedPeriod] = useState({ from: null, to: null });
  const [isRangeDefined, setIsRangeDefined] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [shouldClearHorarios, setShouldClearHorarios] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: [],
    showReplicacao: false,
    periodo: null,
    isNewRange: false
  });

  // Cria uma instância do PeriodoManager
  const periodoManager = new PeriodoManager(datas);

  // Carrega dados do Firebase para o localStorage e verifica período existente
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (!savedData && Object.keys(datas).length > 0) {
      console.log('🔍 Salvando dados do Firebase no localStorage:', datas);
      saveToLocalStorage(datas);
    }

    // Verifica se já existe um período
    const periodoCompleto = periodoManager.getPeriodoCompleto();
    if (periodoCompleto) {
      const periodoNormalizado = {
        from: normalizeDate(periodoCompleto.from),
        to: normalizeDate(periodoCompleto.to)
      };
      setSelectedPeriod(periodoNormalizado);
      setIsRangeDefined(true);
    }
  }, [datas]);

  // Função para resetar o período
  const handleReset = () => {
    setShowResetModal(true);
  };

  // Função para confirmar o reset
  const confirmReset = () => {
    setSelectedPeriod({ from: null, to: null });
    setIsRangeDefined(false);
    
    if (shouldClearHorarios) {
      onChange({});
      saveToLocalStorage({});
    }
    
    setShowResetModal(false);
    setShouldClearHorarios(false);
  };

  // Função para lidar com a seleção de datas
  const handleDateSelect = async (range) => {
    // Se não houver range, reseta a seleção
    if (!range) {
      if (!isRangeDefined) {
        setSelectedPeriod({ from: null, to: null });
        setIsRangeDefined(false);
        onChange({});
      }
      return;
    }

    // Se o range já está definido, trata como clique individual
    if (isRangeDefined) {
      if (range) {
        const date = range;
        // Verifica se a data está dentro do período permitido
        if (date >= selectedPeriod.from && date <= selectedPeriod.to) {
          handleDayClick(date);
        }
      }
      return;
    }

    // Se for um clique único (from === to), considera como data inicial
    if (range.from && (!range.to || range.from.getTime() === range.to.getTime())) {
      console.log('👆 [PeriodoConfig] Seleção única:', format(range.from, 'dd/MM/yyyy'));
      setSelectedPeriod({ from: range.from, to: null });
      return;
    }

    console.log('🔍 Range selecionado:', range);

    // Se tiver início e fim, normaliza e atualiza
    if (range.from && range.to) {
      let dataInicio = range.from;
      let dataFim = range.to;

      // Troca as datas se necessário
      if (dataFim < dataInicio) {
        console.log('🔄 [PeriodoConfig] Trocando datas');
        [dataInicio, dataFim] = [dataFim, dataInicio];
      }

      const novoRange = { from: dataInicio, to: dataFim };
      
      // Obtém todas as datas válidas no período
      const datasValidas = getDatasPeriodo(dataInicio, dataFim);
      console.log('📅 [PeriodoConfig] Datas válidas no período:', datasValidas.map(d => format(d, 'dd/MM/yyyy')));

      // Para cada data válida, pega os horários disponíveis da loja
      const novasDatas = datasValidas.reduce((acc, date) => {
        const dateStr = toFirebaseDate(date);
        if (!dateStr) return acc;

        const dayIndex = getDayOfWeek(date);
        const diaSemana = getDayString(dayIndex);
        const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];

        // Se já existem horários configurados para esta data, mantém
        if (datas[dateStr] && datas[dateStr].length > 0) {
          acc[dateStr] = datas[dateStr];
        } 
        // Não define horário inicial na criação
        else if (horariosDisponiveis.length > 0) {
          acc[dateStr] = [];
        }

        return acc;
      }, {});

      console.log('🕒 [PeriodoConfig] Novas datas com horários:', novasDatas);
      
      // Atualiza os estados em sequência
      await new Promise(resolve => {
        setSelectedPeriod(novoRange);
        setIsRangeDefined(true);
        onChange(novasDatas);
        saveToLocalStorage(novasDatas);
        resolve();
      });

      // Abre o modal para a primeira data do período após os estados serem atualizados
      const primeiraData = datasValidas[0];
      if (primeiraData) {
        // Aguarda os estados serem atualizados
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('🎯 [PeriodoConfig] Abrindo modal para primeira data:', format(primeiraData, 'dd/MM/yyyy'), {
          isRangeDefined,
          selectedPeriod: novoRange
        });

        // Coleta todos os horários disponíveis no período
        const todosHorarios = new Set();
        datasValidas.forEach(date => {
          const dayIndex = getDayOfWeek(date);
          if (dayIndex === null) return;
          
          const diaSemana = getDayString(dayIndex);
          if (!diaSemana) return;
          
          const horariosDesteDia = storeSettings?.weekDays?.[diaSemana]?.slots || [];
          horariosDesteDia.forEach(horario => todosHorarios.add(horario));
        });
        
        // Força a atualização do estado antes de chamar handleDayClick
        setModalConfig({
          isOpen: true,
          dateKey: toFirebaseDate(primeiraData),
          horarios: novasDatas[toFirebaseDate(primeiraData)] || [],
          showReplicacao: false,
          periodo: {
            from: format(novoRange.from, 'yyyy-MM-dd'),
            to: format(novoRange.to, 'yyyy-MM-dd')
          },
          isNewRange: true,
          horariosDisponiveis: Array.from(todosHorarios).sort(),
          tipoConfiguracao: 'data',
          diaSemana: getDayString(getDayOfWeek(primeiraData))
        });
      }
    }
  };

  // Função para verificar se uma data está no período existente
  const isDateInExistingPeriod = (date) => {
    if (!date) return false;
    const periodoCompleto = periodoManager.getPeriodoCompleto();
    if (!periodoCompleto) return false;

    const normalizedDate = normalizeDate(date);
    return normalizedDate >= periodoCompleto.from && normalizedDate <= periodoCompleto.to;
  };

  // Função para verificar se um dia está disponível na loja
  const isDiaDisponivelNaLoja = (date) => {
    if (!date || !isValidDate(date)) return false;
    
    const dayIndex = getDayOfWeek(date);
    if (dayIndex === null) return false;
    
    const diaSemana = getDayString(dayIndex);
    const diaConfig = storeSettings?.weekDays?.[diaSemana];
    
    return diaConfig?.active !== false && Array.isArray(diaConfig?.slots) && diaConfig?.slots?.length > 0;
  };

  // Função para verificar se uma data deve estar desabilitada
  const isDateDisabled = (date) => {
    if (!date || !isValidDate(date)) return true;

    // Verifica se a data já passou
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (date < hoje) return true;

    // Verifica se o dia está disponível na loja
    if (!isDiaDisponivelNaLoja(date)) return true;

    // Se houver período selecionado, verifica se a data está fora dele
    if (selectedPeriod.from && selectedPeriod.to) {
      return date < selectedPeriod.from || date > selectedPeriod.to;
    }

    // Se não houver período selecionado, só desabilita datas passadas e indisponíveis
    return false;
  };

  // Função para verificar se uma data está ativa (tem horários configurados)
  const isDateActive = (date) => {
    if (!date || !isValidDate(date)) return false;
    const dateStr = toFirebaseDate(date);
    return dateStr && datas[dateStr] && datas[dateStr].length > 0;
  };

  // Função para obter datas válidas no período
  const getDatasPeriodo = (from, to) => {
    if (!from || !to || !isValidDate(from) || !isValidDate(to)) return [];

    try {
      const datas = eachDayOfInterval({ start: from, end: to });
      return datas.filter(date => {
        // Filtra apenas datas futuras e dias disponíveis na loja
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return date >= hoje && isDiaDisponivelNaLoja(date);
      });
    } catch (error) {
      console.error('Erro ao obter datas do período:', error);
      return [];
    }
  };

  // Função para lidar com o clique em um dia específico
  const handleDayClick = (date) => {
    console.log('🎯 [PeriodoConfig] Clique no dia:', {
      data: date ? format(date, 'dd/MM/yyyy') : null,
      isRangeDefined,
      selectedPeriod: {
        from: selectedPeriod.from ? format(selectedPeriod.from, 'dd/MM/yyyy') : null,
        to: selectedPeriod.to ? format(selectedPeriod.to, 'dd/MM/yyyy') : null
      }
    });

    if (!date || !isValidDate(date)) {
      console.log('❌ [PeriodoConfig] Data inválida');
      return;
    }

    // Se não houver período definido, ignora
    if (!isRangeDefined || !selectedPeriod.from || !selectedPeriod.to) {
      console.log('❌ [PeriodoConfig] Nenhum período definido');
      return;
    }

    // Se a data estiver fora do período selecionado, ignora
    if (date < selectedPeriod.from || date > selectedPeriod.to) {
      console.log('❌ [PeriodoConfig] Data fora do período selecionado:', {
        data: format(date, 'dd/MM/yyyy'),
        inicio: format(selectedPeriod.from, 'dd/MM/yyyy'),
        fim: format(selectedPeriod.to, 'dd/MM/yyyy')
      });
      return;
    }

    // Se a data já passou, ignora
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (date < hoje) {
      console.log('❌ [PeriodoConfig] Data já passou');
      return;
    }

    // Se o dia não está disponível na loja, ignora
    if (!isDiaDisponivelNaLoja(date)) {
      console.log('❌ [PeriodoConfig] Dia não disponível na loja');
      return;
    }

    const dateStr = toFirebaseDate(date);
    if (!dateStr) {
      console.log('❌ [PeriodoConfig] Erro ao converter data para Firebase');
      return;
    }

    // Obtém os horários disponíveis para este dia
    const dayIndex = getDayOfWeek(date);
    const diaSemana = getDayString(dayIndex);
    const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];

    // Obtém os horários já configurados para este dia
    const horariosExistentes = datas[dateStr] || [];

    console.log('✅ [PeriodoConfig] Abrindo modal para:', {
      data: format(date, 'dd/MM/yyyy'),
      diaSemana,
      horariosExistentes,
      horariosDisponiveis,
      dateStr
    });

    // Abre o modal com os horários
    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: horariosExistentes,
      showReplicacao: true,
      periodo: {
        from: format(date, 'yyyy-MM-dd'),
        to: format(date, 'yyyy-MM-dd')
      },
      isNewRange: false,
      horariosDisponiveis,
      tipoConfiguracao: 'data',
      diaSemana,
      data: date // Passa a data diretamente como objeto Date
    });
  };

  // Reseta o modalConfig quando o modal fecha
  const handleModalClose = () => {
    console.log('🔒 [PeriodoConfig] Fechando modal');
    setModalConfig(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Função para confirmar horários
  const handleHorarioConfirm = (horarioData) => {
    console.log('💾 [PeriodoConfig] Confirmando horários:', horarioData);

    if (!horarioData.horarios.length) {
      console.log('ℹ️ [PeriodoConfig] Nenhum horário selecionado');
      handleModalClose();
      return;
    }

    // Mantém as datas existentes como base
    const novasDatas = { ...datas };
    const { dateKey } = modalConfig;

    if (modalConfig.isNewRange) {
      // Se for uma criação inicial, aplica os horários para todas as datas válidas
      const datasValidas = getDatasPeriodo(selectedPeriod.from, selectedPeriod.to);
      datasValidas.forEach(date => {
        const dateStr = toFirebaseDate(date);
        if (!dateStr) return;

        const dayIdx = getDayOfWeek(date);
        const diaSem = getDayString(dayIdx);
        const horariosDisponiveis = storeSettings?.weekDays?.[diaSem]?.slots || [];
        
        // Aplica os horários selecionados se estiverem disponíveis neste dia
        const horariosValidos = horarioData.horarios.filter(h => horariosDisponiveis.includes(h));
        if (horariosValidos.length > 0) {
          novasDatas[dateStr] = [...horariosValidos];
        }
      });
    } else if (horarioData.replicar) {
      // Lógica de replicação para o período selecionado
      const datasValidas = getDatasPeriodo(selectedPeriod.from, selectedPeriod.to);
      
      datasValidas.forEach(date => {
        const dateStr = toFirebaseDate(date);
        if (!dateStr) return;

        const dayIdx = getDayOfWeek(date);
        const diaSem = getDayString(dayIdx);
        
        const deveAplicar = horarioData.tipoReplicacao === 'todos' || 
          (horarioData.tipoReplicacao === 'diasSemana' && 
           Array.isArray(horarioData.diasSemana) && 
           horarioData.diasSemana.includes(format(date, 'EEEE', { locale: ptBR }).toLowerCase()));

        if (deveAplicar) {
          const horariosDisponiveis = storeSettings?.weekDays?.[diaSem]?.slots || [];
          const horariosValidos = horarioData.horarios.filter(h => horariosDisponiveis.includes(h));
          
          if (horariosValidos.length > 0) {
            novasDatas[dateStr] = [...horariosValidos];
          }
        }
      });
    } else {
      // Atualiza apenas o dia específico
      if (dateKey) {
        novasDatas[dateKey] = [...horarioData.horarios];
      }
    }

    // Salva no localStorage
    saveToLocalStorage(novasDatas);

    handleModalClose();
    onChange(novasDatas);
  };

  const handleItemClick = (data) => {
    const dateStr = toFirebaseDate(data);
    if (!dateStr) return;

    // Se não houver período selecionado, ignora
    if (!selectedPeriod.from || !selectedPeriod.to) {
      console.log('🔍 [PeriodoConfig] Nenhum período selecionado');
      return;
    }

    // Coleta todos os horários disponíveis no período
    const todosHorarios = new Set();
    const datasDisponiveis = getDatasPeriodo(selectedPeriod.from, selectedPeriod.to);
    
    datasDisponiveis.forEach(date => {
      const dayIndex = getDayOfWeek(date);
      if (dayIndex === null) return;
      
      const diaSemana = getDayString(dayIndex);
      if (!diaSemana) return;
      
      const horariosDesteDia = storeSettings?.weekDays?.[diaSemana]?.slots || [];
      horariosDesteDia.forEach(horario => todosHorarios.add(horario));
    });

    const horariosDisponiveis = Array.from(todosHorarios).sort();
    const horariosExistentes = datas[dateStr] || [];

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: horariosExistentes,
      showReplicacao: true,
      periodo: selectedPeriod, // Usa o período selecionado atual
      isNewRange: false,
      horariosDisponiveis,
      tipoConfiguracao: 'periodo'
    });
  };

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
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-gray-200 font-medium">Selecione o período</h2>
            {selectedPeriod?.from && selectedPeriod?.to && (
              <span className="text-sm text-gray-400">
                {format(selectedPeriod.from, 'dd/MM/yyyy')} até {format(selectedPeriod.to, 'dd/MM/yyyy')}
              </span>
            )}
          </div>
          {selectedPeriod?.from && selectedPeriod?.to && (
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1 text-sm"
            >
              <LockOpenIcon className="w-4 h-4" />
              Resetar período
            </button>
          )}
        </div>

        {loading ? (
          <CalendarSkeleton />
        ) : (
          <Calendar
            mode={isRangeDefined ? "single" : "range"}
            selected={isRangeDefined ? Object.keys(datas).map(d => fromFirebaseDate(d)).filter(Boolean) : selectedPeriod}
            onChange={handleDateSelect}
            minDate={new Date()}
            disabledDates={isDateDisabled}
            classNames={{
              day: "hover:bg-gray-700/50 transition-colors",
              day_today: "bg-gray-700 text-white font-semibold",
              day_disabled: "text-gray-500 cursor-not-allowed opacity-50",
              day_selected: isRangeDefined 
                ? "bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                : "bg-orange-500/20 text-white hover:bg-orange-600/20",
              day_range_middle: "bg-orange-500/20 hover:bg-orange-500/30",
              day_range_start: "bg-orange-500 text-white rounded-l-full font-semibold",
              day_range_end: "bg-orange-500 text-white rounded-r-full font-semibold",
              day_outside: "text-gray-500 opacity-50"
            }}
            locale={ptBR}
          />
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-700 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-8 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {getDatasPeriodo(selectedPeriod.from, selectedPeriod.to).map(data => {
            const dateStr = toFirebaseDate(data);
            const horarios = datas[dateStr] || [];
            const isActive = isDateActive(data);

            return (
              <div
                key={dateStr}
                onClick={() => handleDayClick(data)}
                className="bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-700/50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-200 font-medium">
                        {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </span>
                      {isActive ? (
                        <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                          {horarios.length} horário{horarios.length !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="bg-gray-700/50 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                          Clique para configurar
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <div className="text-sm mt-1 truncate">
                        {formatHorarios(horarios)}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const novasDatas = { ...datas };
                        if (dateStr) {
                          delete novasDatas[dateStr];
                          onChange(novasDatas);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.dateKey ? fromFirebaseDate(modalConfig.dateKey) : null}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao={modalConfig.tipoConfiguracao}
        isNewRange={modalConfig.isNewRange}
        periodo={modalConfig.periodo}
        horariosDisponiveis={modalConfig.horariosDisponiveis}
        diaSemana={modalConfig.diaSemana}
        ultimoHorario={ultimoHorario}
      />

      {/* Modal de confirmação de reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-medium text-gray-200">
              Deseja resetar o período selecionado?
            </h3>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="clearHorarios"
                checked={shouldClearHorarios}
                onChange={(e) => setShouldClearHorarios(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="clearHorarios" className="text-gray-300 text-sm">
                Limpar também os horários configurados
              </label>
            </div>

            <p className="text-sm text-gray-400">
              Nota: Esta ação permitirá selecionar um novo período.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 