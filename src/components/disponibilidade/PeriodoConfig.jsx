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
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

export default function PeriodoConfig({ datas = {}, onChange, ultimoHorario = [] }) {
  const { storeSettings, loading } = useDisponibilidade();
  const [selectedPeriod, setSelectedPeriod] = useState({ from: null, to: null });
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

  // Atualiza o período quando as datas mudam
  useEffect(() => {
    const periodoCompleto = periodoManager.getPeriodoCompleto();
    if (periodoCompleto) {
      console.log('🔍 Período completo detectado:', {
        from: formatDateDisplay(periodoCompleto.from),
        to: formatDateDisplay(periodoCompleto.to),
        totalDatas: periodoCompleto.datas.length
      });

      // Garante que as datas estão normalizadas
      const periodoNormalizado = {
        from: normalizeDate(periodoCompleto.from),
        to: normalizeDate(periodoCompleto.to)
      };

      // Atualiza o período selecionado
      setSelectedPeriod(periodoNormalizado);

      // Se o modal estiver aberto, atualiza o período dele também
      if (modalConfig.isOpen) {
        setModalConfig(prev => ({
          ...prev,
          periodo: periodoNormalizado
        }));
      }

      // Atualiza a lista de datas disponíveis
      const datasDisponiveis = getDatasPeriodo(periodoNormalizado.from, periodoNormalizado.to);
      console.log('🔍 Datas disponíveis no período:', datasDisponiveis.map(d => formatDateDisplay(d)));
    }
  }, [datas]);

  // Reseta o modalConfig quando o modal fecha
  const handleModalClose = () => {
    setModalConfig(prev => ({ 
      ...prev,
      isOpen: false
    }));
  };

  // Reseta completamente o modalConfig apenas quando necessário
  const resetModalConfig = () => {
    setModalConfig({
      isOpen: false,
      dateKey: null,
      horarios: [],
      showReplicacao: false,
      periodo: null,
      isNewRange: false
    });
  };

  // Função para verificar se uma data está no período existente
  const isDateInExistingPeriod = (date) => {
    if (!date) return false;
    const periodoCompleto = periodoManager.getPeriodoCompleto();
    if (!periodoCompleto) return false;

    const normalizedDate = normalizeDate(date);
    return normalizedDate >= periodoCompleto.from && normalizedDate <= periodoCompleto.to;
  };

  const isDiaDisponivelNaLoja = (date) => {
    if (!date || !isValidDate(date)) return false;
    
    const dayIndex = getDayOfWeek(date);
    if (dayIndex === null) return false;
    
    const diaSemana = getDayString(dayIndex);
    const diaConfig = storeSettings?.weekDays?.[diaSemana];
    
    return diaConfig?.active !== false && Array.isArray(diaConfig?.slots) && diaConfig?.slots?.length > 0;
  };

  const isDateDisabled = (date) => {
    if (!date || !isValidDate(date)) return true;

    // Se a data está no período existente, não deve estar desabilitada
    if (isDateInExistingPeriod(date)) return false;

    return !isDiaDisponivelNaLoja(date);
  };

  const getDatasPeriodo = (from, to) => {
    if (!from || !to || !isValidDate(from) || !isValidDate(to)) return [];

    try {
      const datas = eachDayOfInterval({ start: from, end: to });
      return datas.filter(date => isDiaDisponivelNaLoja(date));
    } catch (error) {
      console.error('Erro ao obter datas do período:', error);
      return [];
    }
  };

  const handleDateSelect = (range) => {
    console.log('🔍 Estado atual:', {
      datas,
      storeSettings,
      ultimoHorario
    });

    console.log('🔍 Range recebido:', range);

    if (!range) {
      console.log('🔍 Limpando seleção');
      setSelectedPeriod({ from: null, to: null });
      return;
    }

    const normalizedRange = {
      from: range.from ? normalizeDate(range.from) : null,
      to: range.to ? normalizeDate(range.to) : null
    };

    console.log('🔍 Range normalizado:', {
      from: normalizedRange.from ? formatDateDisplay(normalizedRange.from) : null,
      to: normalizedRange.to ? formatDateDisplay(normalizedRange.to) : null
    });

    if (normalizedRange.from && !normalizedRange.to) {
      console.log('🔍 Seleção inicial');
      setSelectedPeriod({ from: normalizedRange.from, to: null });
      return;
    }

    if (normalizedRange.from && normalizedRange.to) {
      console.log('🔍 Seleção completa do range');
      
      const orderedRange = {
        from: normalizedRange.from < normalizedRange.to ? normalizedRange.from : normalizedRange.to,
        to: normalizedRange.from < normalizedRange.to ? normalizedRange.to : normalizedRange.from
      };

      setSelectedPeriod(orderedRange);

      const datasDisponiveis = getDatasPeriodo(orderedRange.from, orderedRange.to);
      console.log('🔍 Datas disponíveis:', datasDisponiveis.map(d => formatDateDisplay(d)));
      
      if (datasDisponiveis.length === 0) {
        console.log('❌ Nenhuma data disponível no período');
        return;
      }

      const todosHorarios = new Set();
      datasDisponiveis.forEach(date => {
        const dayIndex = getDayOfWeek(date);
        if (dayIndex === null) return;
        
        const diaSemana = getDayString(dayIndex);
        if (!diaSemana) return;
        
        const horariosDesteDia = storeSettings?.weekDays?.[diaSemana]?.slots || [];
        horariosDesteDia.forEach(horario => todosHorarios.add(horario));
      });
      
      const horariosDisponiveis = Array.from(todosHorarios).sort();

      let horariosValidos = [];
      if (horariosDisponiveis.length > 0) {
        const horariosExistentes = Object.entries(datas)
          .filter(([data]) => {
            const dataObj = fromFirebaseDate(data);
            if (!dataObj) return false;
            return dataObj >= orderedRange.from && dataObj <= orderedRange.to;
          })
          .map(([_, horarios]) => horarios)
          .flat();

        if (horariosExistentes.length > 0) {
          horariosValidos = [...new Set(horariosExistentes)].filter(h => horariosDisponiveis.includes(h));
        } else if (ultimoHorario && ultimoHorario.length > 0) {
          horariosValidos = ultimoHorario.filter(h => horariosDisponiveis.includes(h));
        }
      }

      setModalConfig({
        isOpen: true,
        dateKey: null,
        horarios: horariosValidos,
        showReplicacao: true,
        periodo: {
          from: normalizeDate(orderedRange.from),
          to: normalizeDate(orderedRange.to)
        },
        isNewRange: true,
        horariosDisponiveis,
        tipoConfiguracao: 'periodo'
      });
    }
  };

  const handleHorarioConfirm = (horarioData) => {
    console.log('🔍 Iniciando confirmação de horários:', {
        horarioData,
        modalConfig,
        selectedPeriod
    });

    // Se não há horários selecionados, não faz nada
    if (horarioData.horarios.length === 0) {
        console.log('❌ Nenhum horário selecionado');
        handleModalClose();
        onChange({});
        return;
    }

    // Obtém apenas as datas válidas dentro do período selecionado
    const datasValidas = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);
    console.log('🔍 Datas válidas no período:', datasValidas.map(d => formatDateDisplay(d)));

    // Mantém as datas existentes como base
    const novasDatas = { ...datas };

    // Para cada data válida no período
    datasValidas.forEach(date => {
        const dateStr = toFirebaseDate(date);
        if (!dateStr) return;

        const dayIdx = getDayOfWeek(date);
        const diaSem = getDayString(dayIdx);
        
        // Verifica se é um dia válido e se devemos aplicar os horários
        const deveAplicar = horarioData.replicar ? (
            horarioData.tipoReplicacao === 'todos' || 
            (horarioData.tipoReplicacao === 'diasSemana' && 
             Array.isArray(horarioData.diasSemana) && 
             horarioData.diasSemana.includes(format(date, 'EEEE', { locale: ptBR }).toLowerCase()))
        ) : true;

        if (deveAplicar) {
            const horariosDisponiveis = storeSettings?.weekDays?.[diaSem]?.slots || [];
            const horariosValidos = horarioData.horarios.filter(h => horariosDisponiveis.includes(h));
            
            if (horariosValidos.length > 0) {
                console.log(`✅ Aplicando horários para ${formatDateDisplay(date)}:`, horariosValidos);
                novasDatas[dateStr] = [...horariosValidos];
            }
        }
    });

    console.log('🔍 Novas datas finais:', novasDatas);

    handleModalClose();

    // Chama onChange com as novas datas
    onChange(novasDatas);
  };

  const handleItemClick = (data) => {
    const dateStr = toFirebaseDate(data);
    if (!dateStr) return;

    const periodo = periodoManager.getPeriodoContendoData(data);
    if (!periodo) return;

    // Coleta todos os horários disponíveis no período
    const todosHorarios = new Set();
    const datasDisponiveis = getDatasPeriodo(periodo.from, periodo.to);
    
    datasDisponiveis.forEach(date => {
      const dayIndex = getDayOfWeek(date);
      if (dayIndex === null) return;
      
      const diaSemana = getDayString(dayIndex);
      if (!diaSemana) return;
      
      const horariosDesteDia = storeSettings?.weekDays?.[diaSemana]?.slots || [];
      horariosDesteDia.forEach(horario => todosHorarios.add(horario));
    });

    const horariosDisponiveis = Array.from(todosHorarios).sort();
    const horariosExistentes = periodoManager.getHorariosNoPeriodo(periodo.from, periodo.to);

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: horariosExistentes,
      showReplicacao: true,
      periodo: {
        from: normalizeDate(periodo.from),
        to: normalizeDate(periodo.to)
      },
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
        <div className="mb-4">
          <h2 className="text-gray-200 font-medium">Selecione o período</h2>
          <p className="text-sm text-gray-400 mt-1">
            {selectedPeriod.from && selectedPeriod.to
              ? `Período selecionado: ${formatDateDisplay(selectedPeriod.from)} a ${formatDateDisplay(selectedPeriod.to)}`
              : selectedPeriod.from 
                ? "Clique em uma data para definir o fim do período"
                : "Clique em uma data para iniciar o período"}
          </p>
        </div>
        {loading ? (
          <CalendarSkeleton />
        ) : (
          <Calendar
            mode="range"
            selected={selectedPeriod}
            onChange={handleDateSelect}
            minDate={new Date()}
            disabledDates={isDateDisabled}
            classNames={{
              day_selected: "bg-orange-500 text-white hover:bg-orange-600 font-semibold",
              day_today: "bg-gray-700 text-white",
              day_range_middle: "bg-orange-500/20 hover:bg-orange-500/30",
              day_range_start: "bg-orange-500 text-white rounded-l-full font-semibold",
              day_range_end: "bg-orange-500 text-white rounded-r-full font-semibold"
            }}
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
          {periodoManager.getDatasOrdenadas().map(({ data, horarios }) => (
            <div
              key={toFirebaseDate(data)}
              onClick={() => handleItemClick(data)}
              className="bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-700/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-200 font-medium">
                      {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                      {horarios.length} horário{horarios.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm mt-1 truncate">
                    {formatHorarios(horarios)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const novasDatas = { ...datas };
                    const dateStr = toFirebaseDate(data);
                    if (dateStr) {
                      delete novasDatas[dateStr];
                      onChange(novasDatas);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.dateKey ? fromFirebaseDate(modalConfig.dateKey) : null}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao="periodo"
        isNewRange={modalConfig.isNewRange}
        periodo={modalConfig.periodo}
        horariosDisponiveis={modalConfig.horariosDisponiveis}
        diaSemana={modalConfig.diaSemana}
      />
    </div>
  );
} 