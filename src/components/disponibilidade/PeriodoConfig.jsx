import { format, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Calendar from '@/components/Calendar';
import HorarioModal from './HorarioModal';
import { normalizeDate, normalizeDateString, isValidDate } from '@/utils/dateUtils';
import { useState } from 'react';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function PeriodoConfig({ datas = {}, onChange, ultimoHorario = [] }) {
  const { storeSettings } = useDisponibilidade();
  const [selectedPeriod, setSelectedPeriod] = useState({ from: null, to: null });
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: [],
    showReplicacao: false,
    periodo: null,
    isNewRange: false
  });

  // Verifica se um dia está disponível na loja
  const isDiaDisponivelNaLoja = (date) => {
    if (!date) return false;
    const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
    const diaConfig = storeSettings?.weekDays?.[diaSemana];
    return diaConfig?.active !== false && diaConfig?.slots?.length > 0;
  };

  // Verifica se uma data está desabilitada
  const isDateDisabled = (date) => {
    return !isDiaDisponivelNaLoja(date);
  };

  // Verifica se todas as datas em um intervalo estão disponíveis
  const getDatasPeriodo = (from, to) => {
    if (!from || !to) return [];

    const datas = eachDayOfInterval({ start: from, end: to });
    // Filtra apenas as datas disponíveis
    return datas.filter(date => isDiaDisponivelNaLoja(date));
  };

  const handleDateSelect = (range) => {
    // Se não tiver range, apenas limpa a seleção
    if (!range) {
      setSelectedPeriod({ from: null, to: null });
      return;
    }

    // Se tiver apenas data inicial
    if (range.from && !range.to) {
      setSelectedPeriod({ from: range.from, to: null });
      return;
    }

    // Se tiver range completo
    if (range.from && range.to) {
      setSelectedPeriod(range);

      // Pega apenas as datas disponíveis no período
      const datasDisponiveis = getDatasPeriodo(range.from, range.to);
      
      // Mesmo que não tenha datas disponíveis, mantém o range selecionado
      // mas não abre o modal
      if (datasDisponiveis.length === 0) {
        return;
      }

      // Ordena as datas disponíveis para pegar a primeira
      datasDisponiveis.sort((a, b) => a.getTime() - b.getTime());
      const primeiraDataDisponivel = datasDisponiveis[0];
      const dateStr = normalizeDateString(primeiraDataDisponivel);

      // Pega todos os horários disponíveis de todas as datas do range
      const todosHorarios = new Set();
      datasDisponiveis.forEach(date => {
        const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
        const horariosDesteDia = storeSettings?.weekDays?.[diaSemana]?.slots || [];
        horariosDesteDia.forEach(horario => todosHorarios.add(horario));
      });
      const horariosDisponiveis = Array.from(todosHorarios).sort();
      
      const periodo = {
        from: range.from,
        to: range.to
      };
      
      // Mantém apenas os horários das datas disponíveis dentro do range
      const novosDatas = {};
      Object.entries(datas).forEach(([data, horarios]) => {
        const dataObj = new Date(data);
        if (dataObj >= range.from && dataObj <= range.to && isDiaDisponivelNaLoja(dataObj)) {
          novosDatas[data] = horarios;
        }
      });
      
      onChange(novosDatas);
      
      setModalConfig({
        isOpen: true,
        dateKey: dateStr,
        horarios: datas[dateStr] || ultimoHorario,
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

    // Se não tem horários selecionados, remove a data
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

    // Se é uma data única (clique direto no item)
    if (modalConfig.dateKey && !modalConfig.isNewRange) {
      const dataObj = new Date(modalConfig.dateKey);
      const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][dataObj.getDay()];
      const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];
      
      // Filtra apenas os horários que estão disponíveis para este dia
      const horariosValidos = horariosArray.filter(h => horariosDisponiveis.includes(h));
      
      if (horariosValidos.length > 0) {
        novasDatas[modalConfig.dateKey] = [...horariosValidos];
      } else {
        delete novasDatas[modalConfig.dateKey];
      }

      // Se tem replicação habilitada
      if (horarioData.replicar) {
        if (horarioData.diasSemana) {
          // Aplica nos dias da semana selecionados dentro do período
          const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);
          datasDisponiveis.forEach(date => {
            const diaSemanaData = format(date, 'EEEE', { locale: ptBR }).toLowerCase();
            if (horarioData.diasSemana.includes(diaSemanaData)) {
              const dateStr = normalizeDateString(date);
              if (dateStr !== modalConfig.dateKey) { // Não aplica na data original
                const horariosDispData = storeSettings?.weekDays?.[['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()]]?.slots || [];
                const horariosValidosData = horariosArray.filter(h => horariosDispData.includes(h));
                if (horariosValidosData.length > 0) {
                  novasDatas[dateStr] = [...horariosValidosData];
                }
              }
            }
          });
        } else {
          // Replica para todo o período
          const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);
          datasDisponiveis.forEach(date => {
            const dateStr = normalizeDateString(date);
            if (dateStr !== modalConfig.dateKey) { // Não aplica na data original
              const diaSemanaData = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
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
      // Se é um novo range, aplica para todas as datas disponíveis no período
      const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);
      datasDisponiveis.forEach(date => {
        const dateStr = normalizeDateString(date);
        const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
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
    const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][data.getDay()];
    const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: datas[dateStr] || ultimoHorario,
      showReplicacao: true,
      periodo: { from: data, to: data },
      isNewRange: false,
      horariosDisponiveis: horariosDisponiveis
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
    return Object.entries(datas)
      .map(([data]) => ({
        data: normalizeDate(new Date(data)),
        horarios: datas[data] || []
      }))
      .sort((a, b) => a.data.getTime() - b.data.getTime());
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
      </div>

      {/* Lista de datas */}
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
        diaSemana={modalConfig.dateKey ? ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][normalizeDate(modalConfig.dateKey).getDay()] : null}
      />
    </div>
  );
} 