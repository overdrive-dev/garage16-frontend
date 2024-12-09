import { useState, useEffect } from 'react';
import { 
  format, 
  startOfDay, 
  addDays, 
  eachDayOfInterval, 
  isWithinInterval, 
  isBefore,
  parseISO,
  formatISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon } from '@heroicons/react/24/outline';
import Calendar from '@/components/Calendar';
import HorarioModal from './HorarioModal';

export default function PeriodoConfig({ datas = {}, onChange }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: [],
    showReplicacao: false
  });

  const [selectedPeriod, setSelectedPeriod] = useState({ from: null, to: null });
  const [isSelectingNewPeriod, setIsSelectingNewPeriod] = useState(false);
  const [lastConfirmedPeriod, setLastConfirmedPeriod] = useState({ from: null, to: null });

  // Converte as datas existentes para o formato do período
  const getDatasExistentes = () => {
    const datasOrdenadas = Object.keys(datas || {}).sort();
    
    console.log('PeriodoConfig - getDatasExistentes - Entrada:', {
      datasOrdenadas,
      datas
    });

    if (datasOrdenadas.length === 0) {
      return { from: null, to: null };
    }

    const from = startOfDay(parseISO(datasOrdenadas[0]));
    const to = startOfDay(parseISO(datasOrdenadas[datasOrdenadas.length - 1]));

    console.log('PeriodoConfig - getDatasExistentes - Saída:', {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd')
    });

    return { from, to };
  };

  // Atualiza o período selecionado quando as datas mudam
  useEffect(() => {
    if (!isSelectingNewPeriod && !lastConfirmedPeriod.from) {
      const newPeriod = getDatasExistentes();
      setSelectedPeriod(newPeriod);
    } else if (lastConfirmedPeriod.from) {
      setSelectedPeriod(lastConfirmedPeriod);
    }
  }, [datas, isSelectingNewPeriod, lastConfirmedPeriod]);

  const handleDateSelect = (range) => {
    console.log('\n=== handleDateSelect ===');
    console.log('CLICK - Range recebido:', {
      from: range?.from ? format(range.from, 'dd/MM/yyyy') : null,
      to: range?.to ? format(range.to, 'dd/MM/yyyy') : null,
      isRangeObject: !!range,
      fromType: range?.from ? typeof range.from : null,
      toType: range?.to ? typeof range.to : null
    });
    console.log('CLICK - Estado atual antes da mudança:', {
      isSelectingNewPeriod,
      selectedPeriod: {
        from: selectedPeriod?.from ? format(selectedPeriod.from, 'dd/MM/yyyy') : null,
        to: selectedPeriod?.to ? format(selectedPeriod.to, 'dd/MM/yyyy') : null
      }
    });

    // Se não recebeu range, limpa a seleção
    if (!range?.from) {
      console.log('CLICK - Limpando seleção por falta de range');
      setSelectedPeriod({ from: null, to: null });
      setLastConfirmedPeriod({ from: null, to: null });
      setIsSelectingNewPeriod(false);
      return;
    }

    const from = startOfDay(range.from);
    const to = range.to ? startOfDay(range.to) : null;

    // Se já está selecionando um período e recebeu uma data final
    if (isSelectingNewPeriod && selectedPeriod.from && to) {
      console.log('CLICK - Finalizando período existente:', {
        existingFrom: format(selectedPeriod.from, 'dd/MM/yyyy'),
        clickedDate: format(to, 'dd/MM/yyyy')
      });

      const orderedDates = {
        from: isBefore(selectedPeriod.from, to) ? selectedPeriod.from : to,
        to: isBefore(selectedPeriod.from, to) ? to : selectedPeriod.from
      };
      
      console.log('CLICK - Período final selecionado:', {
        from: format(orderedDates.from, 'dd/MM/yyyy'),
        to: format(orderedDates.to, 'dd/MM/yyyy')
      });

      setSelectedPeriod(orderedDates);

      // Abre o modal com a data inicial do período
      const dateStr = format(orderedDates.from, 'yyyy-MM-dd');
      const showReplicacao = verificarReplicacao(dateStr);

      console.log('CLICK - Abrindo modal com:', {
        dateStr,
        showReplicacao,
        horarios: datas[dateStr] || []
      });

      setModalConfig({
        isOpen: true,
        dateKey: dateStr,
        horarios: datas[dateStr] || [],
        showReplicacao,
        periodo: orderedDates
      });
      return;
    }

    // Qualquer outro clique inicia um novo período
    console.log('CLICK - Iniciando novo período:', {
      clickedDate: format(from, 'dd/MM/yyyy'),
      wasSelectingBefore: isSelectingNewPeriod,
      hadPreviousSelection: !!selectedPeriod.from
    });

    setSelectedPeriod({ from, to: null });
    setIsSelectingNewPeriod(true);
    
    console.log('CLICK - Estado após mudança:', {
      isSelectingNewPeriod: true,
      selectedPeriod: {
        from: format(from, 'dd/MM/yyyy'),
        to: null
      }
    });
    console.log('===================\n');
  };

  // Função para verificar se deve mostrar replicação
  const verificarReplicacao = (dataAtual) => {
    const horariosDaData = datas[dataAtual];
    const datasConfiguradas = Object.entries(datas || {})
      .filter(([data, horarios]) => data !== dataAtual && horarios && horarios.length > 0);
    
    return datasConfiguradas.length > 0;
  };

  const handleHorarioConfirm = (horarioData) => {
    console.log('\n=== handleHorarioConfirm ===');
    console.log('Dados recebidos:', {
      horarios: horarioData.horarios,
      replicar: horarioData.replicar
    });
    console.log('Estado atual:', {
      modalConfig: {
        dateKey: modalConfig.dateKey,
        showReplicacao: modalConfig.showReplicacao,
        periodo: modalConfig.periodo ? {
          from: format(modalConfig.periodo.from, 'dd/MM/yyyy'),
          to: format(modalConfig.periodo.to, 'dd/MM/yyyy')
        } : null
      },
      selectedPeriod: {
        from: selectedPeriod?.from ? format(selectedPeriod.from, 'dd/MM/yyyy') : null,
        to: selectedPeriod?.to ? format(selectedPeriod.to, 'dd/MM/yyyy') : null
      }
    });

    const horariosArray = Array.isArray(horarioData.horarios) 
      ? horarioData.horarios 
      : [];

    if (!horariosArray.length) {
      console.log('Nenhum horário selecionado, fechando modal');
      setModalConfig({ isOpen: false, dateKey: null, horarios: [], showReplicacao: false });
      return;
    }

    const novasDatas = { ...datas };
    
    // Sempre processa o range completo
    const periodoNormalizado = {
      start: modalConfig.periodo.from,
      end: modalConfig.periodo.to
    };

    const datasNoPeriodo = eachDayOfInterval(periodoNormalizado);

    console.log('Datas no período:', datasNoPeriodo.map(d => format(d, 'dd/MM/yyyy')));

    // Se não houver replicação, atualiza apenas as datas do range atual
    if (!horarioData.replicar) {
      console.log('Sem replicação, atualizando range:', {
        from: format(periodoNormalizado.start, 'dd/MM/yyyy'),
        to: format(periodoNormalizado.end, 'dd/MM/yyyy')
      });

      datasNoPeriodo.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (dateStr) {
          novasDatas[dateStr] = [...horariosArray];
        }
      });
    } else {
      // Se houver replicação, atualiza todas as datas existentes
      console.log('Com replicação, atualizando todas as datas existentes');
      Object.keys(datas).forEach(dateStr => {
        novasDatas[dateStr] = [...horariosArray];
      });
    }

    console.log('Novas datas:', Object.keys(novasDatas).sort());

    // Salva o período atual como último confirmado
    setLastConfirmedPeriod({
      from: selectedPeriod.from,
      to: selectedPeriod.to
    });

    setModalConfig({ isOpen: false, dateKey: null, horarios: [], showReplicacao: false });
    setIsSelectingNewPeriod(false);
    onChange(novasDatas);
    console.log('===================\n');
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [], showReplicacao: false });
    setSelectedPeriod({ from: null, to: null });
    setIsSelectingNewPeriod(false);
  };

  const formatHorario = (horario) => {
    if (typeof horario === 'string') {
      return horario;
    }
    return horario?.inicio && horario?.fim ? `${horario.inicio} às ${horario.fim}` : '';
  };

  // Obtém a lista de datas ordenadas
  const getDatasOrdenadas = () => {
    console.log('\n=== getDatasOrdenadas ===');
    console.log('Datas recebidas:', datas);
    
    const datasProcessadas = Object.entries(datas).map(([data, horarios]) => ({
      data,
      horarios,
      dataFormatada: format(parseISO(data), "d 'de' MMMM", { locale: ptBR })
    }));

    const ordenadas = datasProcessadas.sort((a, b) => {
      return parseISO(a.data) - parseISO(b.data);
    });

    console.log('Datas ordenadas:', ordenadas);
    console.log('===================\n');

    return ordenadas;
  };

  const datasOrdenadas = getDatasOrdenadas();

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="range"
          selected={{
            from: selectedPeriod.from,
            to: selectedPeriod.to
          }}
          onChange={(range) => {
            console.log('\n=== Calendar onChange ===');
            console.log('Range do Calendar:', range);
            console.log('Selected Period:', selectedPeriod);

            // Se já tem um período completo, qualquer clique inicia um novo
            if (selectedPeriod.from && selectedPeriod.to && range?.from) {
              console.log('CLICK - Iniciando novo período após período completo');
              setSelectedPeriod({ from: range.from, to: null });
              setIsSelectingNewPeriod(true);
              return;
            }

            handleDateSelect(range);
          }}
          minDate={startOfDay(new Date())}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600 font-semibold",
            day_today: "bg-gray-700 text-white",
            day_range_middle: "bg-orange-500/20 hover:bg-orange-500/30",
            day_range_start: "bg-orange-500 text-white rounded-l-full font-semibold",
            day_range_end: "bg-orange-500 text-white rounded-r-full font-semibold"
          }}
        />
      </div>

      <div className="space-y-4">
        {datasOrdenadas.map(({ data, dataFormatada, horarios }) => (
          <div
            key={data}
            className="bg-gray-800 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-200">{dataFormatada}</h3>
              <button
                onClick={() => handleRemoveData(data)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {horarios.map((horario, index) => (
                <span
                  key={`${data}-${index}`}
                  className="bg-gray-700 text-gray-200 px-3 py-1 rounded-md text-sm"
                >
                  {formatHorario(horario)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.dateKey ? parseISO(modalConfig.dateKey) : null}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao="periodo"
      />
    </div>
  );
} 