import { format, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Calendar, { CalendarSkeleton } from '@/components/Calendar';
import HorarioModal from './HorarioModal';
import { normalizeDate, normalizeDateString, isValidDate } from '@/utils/dateUtils';
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
        .map(data => new Date(data))
        .sort((a, b) => a - b);

      if (datasOrdenadas.length > 0) {
        setSelectedPeriod({
          from: datasOrdenadas[0],
          to: datasOrdenadas[datasOrdenadas.length - 1]
        });
      }
    }
  }, [datas, storeSettings]);

  const isDiaDisponivelNaLoja = (date) => {
    if (!date || !isValidDate(date)) return false;
    
    const diaSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'][date.getDay() === 0 ? 6 : date.getDay() - 1];
    const diaConfig = storeSettings?.weekDays?.[diaSemana];
    
    if (!diaConfig) return false;
    
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
        original: range.from.toLocaleDateString(),
        normalizada: normalizedFrom.toLocaleDateString()
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
          from: range.from.toLocaleDateString(),
          to: range.to.toLocaleDateString()
        },
        normalizada: {
          from: normalizedRange.from.toLocaleDateString(),
          to: normalizedRange.to.toLocaleDateString()
        }
      });
      
      setSelectedPeriod(normalizedRange);

      const datasDisponiveis = getDatasPeriodo(normalizedRange.from, normalizedRange.to);
      
      if (datasDisponiveis.length === 0) return;

      datasDisponiveis.sort((a, b) => a.getTime() - b.getTime());
      const primeiraDataDisponivel = datasDisponiveis[0];
      const dateStr = normalizeDateString(primeiraDataDisponivel);

      const todosHorarios = new Set();
      datasDisponiveis.forEach(date => {
        const diaSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'][date.getDay() === 0 ? 6 : date.getDay() - 1];
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
            const dataObj = normalizeDate(new Date(data));
            if (dataObj >= normalizedRange.from && dataObj <= normalizedRange.to && isDiaDisponivelNaLoja(dataObj)) {
              novosDatas[data] = horarios;
            }
          } catch (error) {
            // Ignora erros de processamento de data
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
      const dataObj = new Date(modalConfig.dateKey);
      const diaSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'][dataObj.getDay() === 0 ? 6 : dataObj.getDay() - 1];
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
              const dateStr = normalizeDateString(date);
              if (dateStr !== modalConfig.dateKey) {
                const horariosDispData = storeSettings?.weekDays?.[['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'][date.getDay() === 0 ? 6 : date.getDay() - 1]]?.slots || [];
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
            const dateStr = normalizeDateString(date);
            if (dateStr !== modalConfig.dateKey) {
              const diaSemanaData = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'][date.getDay() === 0 ? 6 : date.getDay() - 1];
              const horariosDispData = storeSettings?.weekDays?.[diaSemanaData]?.slots || [];
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
        const dateStr = normalizeDateString(date);
        const diaSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'][date.getDay() === 0 ? 6 : date.getDay() - 1];
        const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];
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
    const dateStr = normalizeDateString(data);
    const diaSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'][data.getDay() === 0 ? 6 : data.getDay() - 1];
    const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: datas[dateStr] || ultimoHorario,
      showReplicacao: true,
      periodo: { from: data, to: data },
      isNewRange: false,
      horariosDisponiveis: horariosDisponiveis,
      diaSemana: diaSemana
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
        .map(([data, horarios]) => ({
          data: normalizeDate(new Date(data)),
          horarios: Array.isArray(horarios) ? horarios.sort() : []
        }))
        .filter(({ data }) => isValidDate(data))
        .sort((a, b) => a.data.getTime() - b.data.getTime());

      return datasArray;
    } catch (error) {
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
              key={normalizeDateString(data)}
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
                    delete novasDatas[normalizeDateString(data)];
                    onChange(novasDatas);
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
        data={modalConfig.dateKey ? normalizeDate(modalConfig.dateKey) : null}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao="periodo"
        isNewRange={modalConfig.isNewRange}
        periodo={modalConfig.periodo}
        horariosDisponiveis={modalConfig.horariosDisponiveis}
        diaSemana={modalConfig.dateKey ? ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'][normalizeDate(modalConfig.dateKey).getDay() === 0 ? 6 : normalizeDate(modalConfig.dateKey).getDay() - 1] : null}
      />
    </div>
  );
} 