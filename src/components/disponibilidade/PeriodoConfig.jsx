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

  useEffect(() => {
    if (Object.keys(datas).length > 0) {
      const datasOrdenadas = Object.keys(datas)
        .map(data => fromFirebaseDate(data))
        .filter(date => date !== null)
        .sort((a, b) => a - b);

      if (datasOrdenadas.length > 0) {
        setSelectedPeriod({
          from: datasOrdenadas[0],
          to: datasOrdenadas[datasOrdenadas.length - 1]
        });
      }
    }
  }, [datas]);

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
    if (!range) {
      setSelectedPeriod({ from: null, to: null });
      return;
    }

    if (range.from && !range.to) {
      const normalizedFrom = normalizeDate(range.from);
      console.log('🔍 Seleção de data:', {
        tipo: 'inicial',
        original: formatDateDisplay(range.from),
        normalizada: formatDateDisplay(normalizedFrom)
      });
      setSelectedPeriod({ from: normalizedFrom, to: null });
      return;
    }

    if (range.from && range.to) {
      const normalizedRange = {
        from: normalizeDate(range.from),
        to: normalizeDate(range.to)
      };
      
      console.log('🔍 Seleção de data:', {
        tipo: 'range',
        original: {
          from: formatDateDisplay(range.from),
          to: formatDateDisplay(range.to)
        },
        normalizada: {
          from: formatDateDisplay(normalizedRange.from),
          to: formatDateDisplay(normalizedRange.to)
        }
      });
      
      setSelectedPeriod(normalizedRange);

      const datasDisponiveis = getDatasPeriodo(normalizedRange.from, normalizedRange.to);
      
      if (datasDisponiveis.length === 0) return;

      datasDisponiveis.sort((a, b) => a - b);
      const primeiraDataDisponivel = datasDisponiveis[0];
      const dateStr = toFirebaseDate(primeiraDataDisponivel);

      const todosHorarios = new Set();
      datasDisponiveis.forEach(date => {
        const dayIndex = getDayOfWeek(date);
        const diaSemana = getDayString(dayIndex);
        const horariosDesteDia = storeSettings?.weekDays?.[diaSemana]?.slots || [];
        horariosDesteDia.forEach(horario => todosHorarios.add(horario));
      });
      const horariosDisponiveis = Array.from(todosHorarios).sort();
      
      const periodo = {
        from: normalizedRange.from,
        to: normalizedRange.to
      };
      
      const novosDatas = {};
      if (datas) {
        Object.entries(datas).forEach(([data, horarios]) => {
          if (!data || !horarios) return;
          try {
            const dataObj = fromFirebaseDate(data);
            if (dataObj && dataObj >= normalizedRange.from && dataObj <= normalizedRange.to && isDiaDisponivelNaLoja(dataObj)) {
              novosDatas[data] = horarios;
            }
          } catch (error) {
            console.error('Erro ao processar data:', error);
          }
        });
      }
      
      const horariosExistentes = datas[dateStr] || ultimoHorario;
      const horariosValidos = horariosExistentes.filter(h => horariosDisponiveis.includes(h));
      
      setModalConfig({
        isOpen: true,
        dateKey: dateStr,
        horarios: horariosValidos,
        showReplicacao: false,
        periodo,
        isNewRange: true,
        horariosDisponiveis
      });
    }
  };

  const handleHorarioConfirm = (horarioData) => {
    const novasDatas = { ...datas };
    const horariosArray = horarioData.horarios;

    if (horariosArray.length === 0 && modalConfig.dateKey) {
      delete novasDatas[modalConfig.dateKey];
      setModalConfig({ 
        isOpen: false, 
        dateKey: null, 
        horarios: [], 
        showReplicacao: false, 
        periodo: null,
        isNewRange: false 
      });
      onChange(novasDatas);
      return;
    }

    if (modalConfig.dateKey && !modalConfig.isNewRange) {
      const dataObj = fromFirebaseDate(modalConfig.dateKey);
      if (!dataObj) return;

      const dayIndex = getDayOfWeek(dataObj);
      const diaSemana = getDayString(dayIndex);
      const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];
      
      const horariosValidos = horariosArray.filter(h => horariosDisponiveis.includes(h));
      
      if (horariosValidos.length > 0) {
        novasDatas[modalConfig.dateKey] = [...horariosValidos];
      } else {
        delete novasDatas[modalConfig.dateKey];
      }

      if (horarioData.replicar) {
        if (horarioData.diasSemana) {
          const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);
          datasDisponiveis.forEach(date => {
            const diaSemanaData = format(date, 'EEEE', { locale: ptBR }).toLowerCase();
            if (horarioData.diasSemana.includes(diaSemanaData)) {
              const dateStr = toFirebaseDate(date);
              if (dateStr && dateStr !== modalConfig.dateKey) {
                const dayIdx = getDayOfWeek(date);
                const diaSem = getDayString(dayIdx);
                const horariosDispData = storeSettings?.weekDays?.[diaSem]?.slots || [];
                const horariosValidosData = horariosArray.filter(h => horariosDispData.includes(h));
                if (horariosValidosData.length > 0) {
                  novasDatas[dateStr] = [...horariosValidosData];
                }
              }
            }
          });
        } else {
          const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);
          datasDisponiveis.forEach(date => {
            const dateStr = toFirebaseDate(date);
            if (dateStr && dateStr !== modalConfig.dateKey) {
              const dayIdx = getDayOfWeek(date);
              const diaSem = getDayString(dayIdx);
              const horariosDispData = storeSettings?.weekDays?.[diaSem]?.slots || [];
              const horariosValidosData = horariosArray.filter(h => horariosDispData.includes(h));
              if (horariosValidosData.length > 0) {
                novasDatas[dateStr] = [...horariosValidosData];
              }
            }
          });
        }
      }
    } else if (modalConfig.isNewRange && modalConfig.periodo) {
      const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);
      datasDisponiveis.forEach(date => {
        const dateStr = toFirebaseDate(date);
        if (!dateStr) return;

        const dayIdx = getDayOfWeek(date);
        const diaSem = getDayString(dayIdx);
        const horariosDisponiveis = storeSettings?.weekDays?.[diaSem]?.slots || [];
        const horariosValidos = horariosArray.filter(h => horariosDisponiveis.includes(h));
        if (horariosValidos.length > 0) {
          novasDatas[dateStr] = [...horariosValidos];
        }
      });
    }

    setModalConfig({ 
      isOpen: false, 
      dateKey: null, 
      horarios: [], 
      showReplicacao: false, 
      periodo: null,
      isNewRange: false 
    });

    onChange(novasDatas);
  };

  const handleItemClick = (data) => {
    const dateStr = toFirebaseDate(data);
    if (!dateStr) return;

    const dayIdx = getDayOfWeek(data);
    const diaSem = getDayString(dayIdx);
    const horariosDisponiveis = storeSettings?.weekDays?.[diaSem]?.slots || [];

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: datas[dateStr] || ultimoHorario,
      showReplicacao: true,
      periodo: { from: data, to: data },
      isNewRange: false,
      horariosDisponiveis: horariosDisponiveis,
      diaSemana: diaSem
    });
  };

  const handleModalClose = () => {
    setModalConfig({ 
      isOpen: false, 
      dateKey: null, 
      horarios: [], 
      showReplicacao: false, 
      periodo: null,
      isNewRange: false 
    });
  };

  const getDatasOrdenadas = () => {
    try {
      const datasArray = Object.entries(datas)
        .map(([data, horarios]) => {
          const dataObj = fromFirebaseDate(data);
          return dataObj ? {
            data: dataObj,
            horarios: Array.isArray(horarios) ? horarios.sort() : []
          } : null;
        })
        .filter(item => item !== null)
        .sort((a, b) => a.data - b.data);

      return datasArray;
    } catch (error) {
      console.error('Erro ao ordenar datas:', error);
      return [];
    }
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
            {selectedPeriod.from 
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
          {getDatasOrdenadas().map(({ data, horarios }) => (
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