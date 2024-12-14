import { format, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Calendar from '@/components/Calendar';
import HorarioModal from './HorarioModal';
import { normalizeDate, normalizeDateString, isValidDate } from '@/utils/dateUtils';
import { useState } from 'react';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';

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
    console.log('handleDateSelect - range recebido:', range);
    console.log('handleDateSelect - período atual:', selectedPeriod);
    
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
      console.log('Datas disponíveis no período:', datasDisponiveis);
      
      // Mesmo que não tenha datas disponíveis, mantém o range selecionado
      // mas não abre o modal
      if (datasDisponiveis.length === 0) {
        console.log('Nenhuma data disponível no período');
        return;
      }

      // Ordena as datas disponíveis para pegar a primeira
      datasDisponiveis.sort((a, b) => a.getTime() - b.getTime());
      const primeiraDataDisponivel = datasDisponiveis[0];
      const dateStr = normalizeDateString(primeiraDataDisponivel);
      
      console.log('Primeira data disponível:', dateStr);
      
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
        isNewRange: true
      });
    }
  };

  const handleHorarioConfirm = (horarioData) => {
    const novasDatas = { ...datas };
    const horariosArray = horarioData.horarios;

    if (modalConfig.periodo?.from && modalConfig.periodo?.to) {
      // Se é um novo range, sempre replica para todas as datas do período
      if (modalConfig.isNewRange) {
        // Pega apenas as datas disponíveis no período
        const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);

        datasDisponiveis.forEach(date => {
          const dateStr = normalizeDateString(date);
          if (horariosArray.length > 0) {
            novasDatas[dateStr] = [...horariosArray];
          } else {
            delete novasDatas[dateStr];
          }
        });
      } else {
        // Se é edição de data específica
        if (!horarioData.replicar) {
          // Aplica apenas na data selecionada
          if (horariosArray.length > 0) {
            novasDatas[modalConfig.dateKey] = [...horariosArray];
          } else {
            delete novasDatas[modalConfig.dateKey];
          }
        } else if (horarioData.diasSemana) {
          // Aplica nos dias da semana selecionados dentro do período
          const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);

          datasDisponiveis.forEach(date => {
            const diaSemana = format(date, 'EEEE', { locale: ptBR }).toLowerCase();
            if (horarioData.diasSemana.includes(diaSemana)) {
              const dateStr = normalizeDateString(date);
              if (horariosArray.length > 0) {
                novasDatas[dateStr] = [...horariosArray];
              } else {
                delete novasDatas[dateStr];
              }
            }
          });
        } else {
          // Replica para todo o período (apenas datas disponíveis)
          const datasDisponiveis = getDatasPeriodo(modalConfig.periodo.from, modalConfig.periodo.to);

          datasDisponiveis.forEach(date => {
            const dateStr = normalizeDateString(date);
            if (horariosArray.length > 0) {
              novasDatas[dateStr] = [...horariosArray];
            } else {
              delete novasDatas[dateStr];
            }
          });
        }
      }
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
    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: datas[dateStr] || ultimoHorario,
      showReplicacao: true,
      periodo: selectedPeriod,
      isNewRange: false
    });
  };

  const handleModalClose = () => {
    console.log('handleModalClose - período atual:', selectedPeriod);
    
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
            className="bg-gray-800 hover:bg-gray-700/80 transition-colors rounded-lg p-4 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-200 font-medium">
                  {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <div className="text-sm text-gray-400 mt-1">
                  {horarios.map((horario, idx) => (
                    <span key={idx}>
                      {horario}
                      {idx < horarios.length - 1 ? ' | ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.dateKey ? new Date(modalConfig.dateKey) : null}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao="periodo"
        isNewRange={modalConfig.isNewRange}
        periodo={modalConfig.periodo}
      />
    </div>
  );
} 