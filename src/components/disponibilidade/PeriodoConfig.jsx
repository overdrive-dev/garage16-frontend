import { useState, useEffect } from 'react';
import { format, startOfDay, addDays, eachDayOfInterval, isWithinInterval, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon } from '@heroicons/react/24/outline';
import Calendar from '@/components/Calendar';
import HorarioModal from './HorarioModal';

// Função auxiliar para normalizar a data para o início do dia no fuso horário local
function normalizeToLocalStartOfDay(date) {
  if (!date) return null;
  const localDate = new Date(date);
  return startOfDay(localDate);
}

// Função auxiliar para converter data para string no formato YYYY-MM-DD
function dateToString(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

    const from = normalizeToLocalStartOfDay(new Date(datasOrdenadas[0]));
    const to = normalizeToLocalStartOfDay(new Date(datasOrdenadas[datasOrdenadas.length - 1]));

    console.log('PeriodoConfig - getDatasExistentes - Saída:', {
      from: dateToString(from),
      to: dateToString(to)
    });

    return { from, to };
  };

  // Atualiza o período selecionado quando as datas mudam
  useEffect(() => {
    // Só atualiza se não houver período selecionado e não estiver no modo de seleção
    if (!isSelectingNewPeriod && !lastConfirmedPeriod.from) {
      const newPeriod = getDatasExistentes();
      console.log('PeriodoConfig - useEffect getDatasExistentes:', {
        newPeriod: {
          from: dateToString(newPeriod.from),
          to: dateToString(newPeriod.to)
        },
        datas: Object.keys(datas)
      });
      setSelectedPeriod(newPeriod);
    } else if (lastConfirmedPeriod.from) {
      setSelectedPeriod(lastConfirmedPeriod);
    }
  }, [datas, isSelectingNewPeriod]);

  const handleDateSelect = (range) => {
    console.log('PeriodoConfig - Range Recebido:', {
      from: dateToString(range?.from),
      to: dateToString(range?.to),
      isSelectingNew: isSelectingNewPeriod
    });

    if (!range?.from) {
      setSelectedPeriod({ from: null, to: null });
      setLastConfirmedPeriod({ from: null, to: null });
      setIsSelectingNewPeriod(false);
      return;
    }

    const from = normalizeToLocalStartOfDay(range.from);
    const to = range.to ? normalizeToLocalStartOfDay(range.to) : null;

    // Sempre inicia um novo período com um único clique
    if (!to) {
      console.log('PeriodoConfig - Iniciando Novo Período:', dateToString(from));
      setSelectedPeriod({ from, to: null });
      setIsSelectingNewPeriod(true);
      return;
    }

    // Quando seleciona a data final
    if (to) {
      const orderedDates = {
        from: isBefore(from, to) ? from : to,
        to: isBefore(from, to) ? to : from
      };
      
      console.log('PeriodoConfig - Período Final:', {
        from: dateToString(orderedDates.from),
        to: dateToString(orderedDates.to)
      });
      
      setSelectedPeriod(orderedDates);

      // Abre o modal com a data inicial do período
      const dateStr = dateToString(orderedDates.from);
      const showReplicacao = verificarReplicacao(dateStr);

      setModalConfig({
        isOpen: true,
        dateKey: dateStr,
        horarios: datas[dateStr] || [],
        showReplicacao
      });
    }
  };

  // Função para verificar se deve mostrar replicação
  const verificarReplicacao = (dataAtual) => {
    const horariosDaData = datas[dataAtual];
    const datasConfiguradas = Object.entries(datas || {})
      .filter(([data, horarios]) => data !== dataAtual && horarios && horarios.length > 0);
    
    return datasConfiguradas.length > 0;
  };

  const handleHorarioConfirm = (horarioData) => {
    console.log('PeriodoConfig - handleHorarioConfirm - Início:', {
      selectedPeriod: {
        from: dateToString(selectedPeriod.from),
        to: dateToString(selectedPeriod.to)
      },
      horarios: horarioData
    });

    const horariosArray = Array.isArray(horarioData.horarios) 
      ? horarioData.horarios 
      : [];

    if (!horariosArray.length) {
      setModalConfig({ isOpen: false, dateKey: null, horarios: [], showReplicacao: false });
      return;
    }

    const novasDatas = { ...datas };
    
    // Garante que as datas estejam normalizadas antes de gerar o intervalo
    const periodoNormalizado = {
      start: normalizeToLocalStartOfDay(selectedPeriod.from),
      end: normalizeToLocalStartOfDay(selectedPeriod.to)
    };

    const datasNoPeriodo = eachDayOfInterval(periodoNormalizado);

    console.log('PeriodoConfig - handleHorarioConfirm - Datas geradas:', {
      datasNoPeriodo: datasNoPeriodo.map(d => dateToString(d)),
      periodo: {
        from: dateToString(selectedPeriod.from),
        to: dateToString(selectedPeriod.to)
      }
    });

    datasNoPeriodo.forEach(date => {
      const dateStr = dateToString(normalizeToLocalStartOfDay(date));
      if (dateStr) {
        novasDatas[dateStr] = [...horariosArray];
      }
    });

    console.log('PeriodoConfig - handleHorarioConfirm - Antes do onChange:', {
      novasDatas: Object.keys(novasDatas).sort(),
      selectedPeriod: {
        from: dateToString(selectedPeriod.from),
        to: dateToString(selectedPeriod.to)
      }
    });

    // Salva o período atual como último confirmado
    setLastConfirmedPeriod({
      from: selectedPeriod.from,
      to: selectedPeriod.to
    });

    setModalConfig({ isOpen: false, dateKey: null, horarios: [], showReplicacao: false });
    setIsSelectingNewPeriod(false);
    onChange(novasDatas);
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
    // Usa apenas as datas que já têm horários configurados
    const todasDatas = Object.entries(datas || {})
      .map(([data, horarios]) => ({
        data,
        horarios
      }))
      .sort((a, b) => new Date(a.data) - new Date(b.data));
    
    return todasDatas;
  };

  const datasOrdenadas = getDatasOrdenadas();

  return (
    <div className="space-y-6">
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="period"
          selected={selectedPeriod}
          onChange={handleDateSelect}
          minDate={startOfDay(new Date())}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white"
          }}
          showPreview={isSelectingNewPeriod}
        />
      </div>

      {/* Lista de datas */}
      <div className="space-y-4">
        {datasOrdenadas.map(({ data, horarios }) => (
          <div key={data} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-100">
                  {format(new Date(data), "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-sm text-gray-400">
                  {horarios?.length 
                    ? `${horarios.length} horário${horarios.length !== 1 ? 's' : ''} configurado${horarios.length !== 1 ? 's' : ''}`
                    : 'Clique para configurar horários'
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  const novasDatas = { ...datas };
                  delete novasDatas[data];
                  
                  onChange(novasDatas);
                }}
                className="text-gray-400 hover:text-gray-300"
                title="Desmarcar data"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            <div 
              className="text-gray-200 cursor-pointer bg-gray-700/50 rounded p-4 hover:bg-gray-700/70"
              onClick={() => {
                const showReplicacao = verificarReplicacao(data);

                setModalConfig({
                  isOpen: true,
                  dateKey: data,
                  horarios: horarios || [],
                  showReplicacao
                });
              }}
            >
              {horarios?.length > 0 ? (
                horarios.map((horario, index) => (
                  <span key={index}>
                    {formatHorario(horario)}
                    {index < horarios.length - 1 && ', '}
                  </span>
                ))
              ) : (
                <div className="text-center text-gray-400">
                  Clique para adicionar horários
                </div>
              )}
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
      />
    </div>
  );
} 