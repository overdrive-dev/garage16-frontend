import { useState, useEffect } from 'react';
import HorarioModal from './HorarioModal';
import DatePickerModal from './DatePickerModal';
import { format, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConfiguracaoFaixaHorario({ config, onChange }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: []
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerType, setDatePickerType] = useState(null);
  const [diasAtualizados, setDiasAtualizados] = useState([]);

  // Define datas padrão se não estiverem definidas
  useEffect(() => {
    if (!config.dataInicio || !config.dataFim) {
      onChange({
        ...config,
        dataInicio: config.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: config.dataFim || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  }, []);

  const getDiaSemana = (date) => {
    return format(date, 'EEEE', { locale: ptBR }).toLowerCase();
  };

  const handleDateChange = (field, value) => {
    // Se está limpando a data, usa a data padrão
    if (!value) {
      const defaultDate = field === 'dataInicio' 
        ? new Date().toISOString().split('T')[0]
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      onChange({
        ...config,
        [field]: defaultDate
      });
      return;
    }

    let newConfig = {
      ...config,
      [field]: value
    };

    // Se ambas as datas estão definidas
    if (newConfig.dataInicio && newConfig.dataFim) {
      const inicio = new Date(newConfig.dataInicio);
      const fim = new Date(newConfig.dataFim);

      // Se a data final é anterior à inicial
      if (fim < inicio) {
        if (field === 'dataInicio') {
          newConfig.dataFim = value; // Ajusta a data final para ser igual à inicial
        } else {
          newConfig.dataInicio = value; // Ajusta a data inicial para ser igual à final
        }
      }
    }

    onChange(newConfig);
  };

  const toggleData = (dateStr) => {
    const currentHorarios = config.horarios[dateStr] || { ativo: false, horarios: [] };
    
    if (!currentHorarios.ativo || !currentHorarios.horarios.length) {
      handleOpenModal(dateStr);
    } else {
      const { [dateStr]: removed, ...rest } = config.horarios;
      onChange({
        ...config,
        horarios: rest
      });
    }
  };

  const handleOpenModal = (dateKey) => {
    setModalConfig({
      isOpen: true,
      dateKey,
      horarios: config.horarios[dateKey]?.horarios || []
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    if (modalConfig.dateKey) {
      const { horarios: horariosNovos, replicar } = horarioData;
      const novoConfig = { ...config };
      const horarioAtual = config.horarios[modalConfig.dateKey]?.horarios || [];

      // Função para adicionar horário a um dia específico
      const adicionarHorarioAoDia = (data) => {
        novoConfig.horarios[data] = {
          ativo: true,
          horarios: horariosNovos
        };
      };

      // Se está removendo horários
      if (horariosNovos.length === 0) {
        // Encontra todos os dias que têm exatamente os mesmos horários
        Object.entries(config.horarios).forEach(([data, config]) => {
          if (JSON.stringify(config.horarios.sort()) === JSON.stringify(horarioAtual.sort())) {
            delete novoConfig.horarios[data];
          }
        });
      } else {
        // Se está adicionando/modificando horários
        if (horarioAtual.length > 0) {
          // Atualiza todos os dias que têm os mesmos horários
          Object.entries(config.horarios).forEach(([data, config]) => {
            if (JSON.stringify(config.horarios.sort()) === JSON.stringify(horarioAtual.sort())) {
              adicionarHorarioAoDia(data);
            }
          });
        } else {
          // Adiciona apenas ao dia atual se não havia horários antes
          adicionarHorarioAoDia(modalConfig.dateKey);
        }

        // Se houver replicação, adiciona aos outros dias selecionados
        if (replicar) {
          const dataInicial = new Date(config.dataInicio);
          const dataFinal = new Date(config.dataFim);

          // Itera por todas as datas no intervalo
          for (let d = new Date(dataInicial); d <= dataFinal; d.setDate(d.getDate() + 1)) {
            const dataStr = d.toISOString().split('T')[0];
            if (dataStr !== modalConfig.dateKey) { // Pula o dia atual que já foi adicionado
              const diaDaSemana = getDiaSemana(d);
              
              if (replicar.tipo === 'todos' || 
                  (replicar.tipo === 'especificos' && replicar.dias.includes(diaDaSemana))) {
                adicionarHorarioAoDia(dataStr);
              }
            }
          }
        }
      }

      onChange(novoConfig);
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const openDatePicker = () => {
    setIsDatePickerOpen(true);
  };

  const handleDateSelect = (date, type) => {
    handleDateChange(type, date);
  };

  const datas = eachDayOfInterval({
    start: new Date(config.dataInicio),
    end: new Date(config.dataFim)
  });

  const handleSaveHorario = (horarioData) => {
    const { horaInicio, horaFim, replicar } = horarioData;
    const novoHorario = { horaInicio, horaFim };

    setConfig(prevConfig => {
      const novoConfig = { ...prevConfig };
      
      // Função para adicionar horário a um dia específico
      const adicionarHorarioAoDia = (data) => {
        const horarios = novoConfig.horarios[data] || [];
        novoConfig.horarios[data] = [...horarios, novoHorario];
      };

      // Adiciona o horário ao dia atual
      adicionarHorarioAoDia(horarioEmEdicao.data);

      // Se houver replicação, adiciona aos outros dias
      if (replicar) {
        const dataInicial = new Date(config.dataInicio);
        const dataFinal = new Date(config.dataFim);
        const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        // Itera por todas as datas no intervalo
        for (let d = new Date(dataInicial); d <= dataFinal; d.setDate(d.getDate() + 1)) {
          const dataStr = d.toISOString().split('T')[0];
          if (dataStr !== horarioEmEdicao.data) { // Pula o dia atual que já foi adicionado
            const diaDaSemana = diasDaSemana[d.getDay()];
            
            if (replicar.tipo === 'todos' || 
                (replicar.tipo === 'especificos' && replicar.dias.includes(diaDaSemana))) {
              adicionarHorarioAoDia(dataStr);
            }
          }
        }
      }

      return novoConfig;
    });

    setHorarioEmEdicao(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {datas.map((data) => {
          const dateStr = format(data, 'yyyy-MM-dd');
          
          return (
            <div 
              key={dateStr} 
              className="flex items-center space-x-4"
            >
              <div className="w-48">
                <div className="text-gray-200">{format(data, 'dd/MM/yyyy')}</div>
                <div className="text-sm text-gray-400">{getDiaSemana(data)}</div>
              </div>
              
              {config.horarios[dateStr]?.ativo && config.horarios[dateStr].horarios.length > 0 ? (
                <>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(dateStr)}
                      className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 text-left hover:bg-gray-600 transition-colors"
                    >
                      {config.horarios[dateStr].horarios.join(' - ')}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleData(dateStr)}
                    className="p-2 text-gray-400 hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleData(dateStr)}
                  className="text-orange-500 hover:text-orange-400 text-sm"
                >
                  Adicionar horário
                </button>
              )}
            </div>
          );
        })}
      </div>

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.dateKey ? new Date(modalConfig.dateKey) : null}
        showReplicacao={true}
      />

      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleDateSelect}
        selectedStartDate={config.dataInicio}
        selectedEndDate={config.dataFim}
        title="Selecione o período"
      />
    </div>
  );
} 