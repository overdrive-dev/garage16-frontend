import { useState } from 'react';
import { format, parse, startOfDay, addDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';
import Calendar from '@/components/Calendar';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function DataUnicaConfig({ datas = {}, onChange, isWeekly = false }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: []
  });

<<<<<<< Updated upstream
  const [hoveredWeekday, setHoveredWeekday] = useState(null);
=======
  // Memoriza as datas disponíveis para evitar recálculos
  const availableDates = useMemo(() => {
    if (!availableSlots?.slots) return [];
    return Object.keys(availableSlots.slots).map(dateStr => normalizeDate(dateStr));
  }, [availableSlots]);

  // Memoriza a função de verificação de disponibilidade
  const isDateDisabled = useMemo(() => {
    return (date) => {
      if (!date) return true;
      
      // Verifica se a data tem slots disponíveis na loja
      const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
      const slotsLoja = storeSettings?.weekDays?.[diaSemana]?.slots || [];
      
      // Verifica se a data tem slots específicos
      const dateStr = normalizeDateString(date);
      const slotsData = availableSlots?.slots?.[dateStr] || [];
      
      // A data está habilitada se tiver slots da loja OU slots específicos
      const isDisabled = slotsLoja.length === 0 && slotsData.length === 0;
      
      console.log('[DataUnicaConfig] Verificando se data está desabilitada:', {
        date: date.toLocaleDateString('pt-BR'),
        diaSemana,
        slotsLoja,
        slotsData,
        isDisabled
      });
      
      return isDisabled;
    };
  }, [availableSlots, storeSettings]);

  // Pega os horários disponíveis para uma data
  const getHorariosDisponiveis = (dateStr) => {
    if (!dateStr) return [];
    const date = normalizeDate(dateStr);
    const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
    
    // Pega os slots disponíveis da loja e da data específica
    const slotsLoja = storeSettings?.weekDays?.[diaSemana]?.slots || [];
    const slotsData = availableSlots?.slots?.[dateStr] || [];
    
    // Combina os slots e remove duplicatas
    return Array.from(new Set([...slotsLoja, ...slotsData])).sort();
  };
>>>>>>> Stashed changes

  // Função isolada para verificar se deve mostrar replicação
  const verificarReplicacao = (dataAtual) => {
    console.log('\n=== Verificação de Replicação (Data Única) ===');
    console.log('Data sendo verificada:', dataAtual);
    console.log('Estado atual das datas:', datas);

    // Verifica se a data atual tem horários configurados (está editando)
    const horariosDaData = datas[dataAtual];
    console.log('Horários da data atual:', horariosDaData);
    
    const estaEditando = horariosDaData && horariosDaData.length > 0;
    console.log('Está editando?', estaEditando);

    // Conta quantas datas configuradas existem (excluindo a data atual)
    const datasConfiguradas = Object.entries(datas || {})
      .filter(([data, horarios]) => data !== dataAtual && horarios && horarios.length > 0);
    
    console.log('Datas configuradas (excluindo atual):', datasConfiguradas);
    console.log('Quantidade de datas configuradas:', datasConfiguradas.length);

    // Se estiver editando, usa os horários existentes, senão usa os horários do modal
    const horariosSelecionados = estaEditando ? horariosDaData : [];
    console.log('Horários considerados:', horariosSelecionados);

    // Deve exibir replicação se houver outras datas configuradas
    const deveExibirReplicacao = datasConfiguradas.length > 0;
    console.log('Deve exibir replicação?', deveExibirReplicacao);
    console.log('Motivo:', deveExibirReplicacao 
      ? 'Existem outras datas configuradas' 
      : 'Não existem outras datas configuradas');
    console.log('=====================================\n');
    
    return deveExibirReplicacao;
  };

  const handleDateClick = (date) => {
    console.log('\n=== Clique na Data ===');
    console.log('Data clicada:', date);
    
    // Ajusta para o fuso horário local
    const localDate = addDays(startOfDay(date), 1);
    const dateStr = localDate.toISOString().split('T')[0];
    console.log('Data ajustada:', dateStr);
    
    const horarios = datas?.[dateStr] || [];
    console.log('Horários existentes:', horarios);
    
    const showReplicacao = verificarReplicacao(dateStr);
    console.log('Mostrar replicação?', showReplicacao);

    console.log('Configurando modal com:', {
      isOpen: true,
      dateKey: dateStr,
      horarios,
      showReplicacao
    });
    console.log('===================\n');

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios,
      showReplicacao
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    if (modalConfig.dateKey) {
      const { horarios: horariosNovos, replicar } = horarioData;
<<<<<<< Updated upstream
      
      // Se não houver horários, remove a data
      if (!horariosNovos || horariosNovos.length === 0) {
        console.log('Removendo data:', modalConfig.dateKey);
        const novasDatas = { ...datas };
        delete novasDatas[modalConfig.dateKey];
        onChange(novasDatas);
        setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
        return;
=======
      const novasHorarios = { ...horariosConfig };

      // Verifica se os horários selecionados estão disponíveis
      const horariosDisponiveis = getHorariosDisponiveis(modalConfig.dateKey);
      console.log('[DataUnicaConfig] Verificando horários disponíveis:', {
        dateKey: modalConfig.dateKey,
        horariosDisponiveis,
        horariosNovos
      });
      
      const horariosValidos = horariosNovos.filter(h => horariosDisponiveis.includes(h));

      // Se não tiver horários válidos, remove a data
      if (!horariosValidos.length) {
        console.log('[DataUnicaConfig] Removendo data por não ter horários válidos:', modalConfig.dateKey);
        delete novasHorarios[modalConfig.dateKey];
      } else {
        // Adiciona os horários válidos
        novasHorarios[modalConfig.dateKey] = horariosValidos.sort();
>>>>>>> Stashed changes
      }

      // Cria um novo objeto para armazenar todas as datas
      const novasDatas = { ...datas };

<<<<<<< Updated upstream
      // Adiciona os horários à data atual
      novasDatas[modalConfig.dateKey] = horariosNovos;
=======
        // Para cada data configurada
        datasConfiguradas.forEach(dataObj => {
          const dateStr = normalizeDateString(dataObj);
          const horariosDisponiveisData = getHorariosDisponiveis(dateStr);
          console.log('[DataUnicaConfig] Verificando horários para replicação:', {
            dateStr,
            horariosDisponiveisData,
            horariosNovos
          });
          
          const horariosValidosData = horariosNovos.filter(h => horariosDisponiveisData.includes(h));
>>>>>>> Stashed changes

      // Se houver replicação, aplica de acordo com o tipo de configuração
      if (replicar?.tipo === 'todos') {
        if (isWeekly) {
          // No modo semanal, replica apenas para dias já configurados
          console.log('Replicando horários no modo semanal');
          console.log('Dias já configurados:', Object.keys(datas));
          
          Object.keys(datas).forEach(data => {
            if (data !== modalConfig.dateKey && datas[data]?.length > 0) {
              console.log('Replicando para:', data);
              novasDatas[data] = horariosNovos;
            }
          });
        } else {
          // Para outros modos (data única/período), mantém a lógica original
          Object.keys(datas).forEach(data => {
            if (data !== modalConfig.dateKey) {
              novasDatas[data] = horariosNovos;
            }
          });
        }
      }

      onChange(novasDatas);
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleCalendarSelect = (dates) => {
    if (dates.length === 1) {
      handleDateClick(dates[0]);
    } else {
      dates.forEach(date => handleDateClick(date));
    }
  };

  const handleDayMouseEnter = (date) => {
    if (!isWeekly) return; // Apenas no modo semanal
    const dayOfWeek = date.getDay(); // 0 (Dom) a 6 (Sáb)
    setHoveredWeekday(dayOfWeek);
  };

  const handleDayMouseLeave = () => {
    if (!isWeekly) return; // Apenas no modo semanal
    setHoveredWeekday(null);
  };

  // Converte as datas string para objetos Date para o calendário
  const selectedDates = Object.keys(datas || {}).map(dateStr => {
    const date = new Date(dateStr);
    return startOfDay(date);
  });

  const formatHorario = (horario) => {
    if (typeof horario === 'string') {
      return horario;
    }
    return horario?.inicio && horario?.fim ? `${horario.inicio} às ${horario.fim}` : '';
  };

  return (
    <div className="space-y-6">
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onChange={handleCalendarSelect}
          minDate={startOfDay(new Date())}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white",
            day_matches_hovered: isWeekly ? (date) => {
              // Verifica se o dia da semana do 'date' corresponde ao 'hoveredWeekday' e se é uma data futura
              return hoveredWeekday !== null && date.getDay() === hoveredWeekday && isAfter(date, new Date());
            } : null
          }}
          hoveredWeekday={isWeekly ? hoveredWeekday : null}
          onDayMouseEnter={handleDayMouseEnter}
          onDayMouseLeave={handleDayMouseLeave}
        />
      </div>

      {/* Lista de datas */}
      <div className="space-y-4">
        {Object.entries(datas || {}).sort().map(([data, horarios = []]) => (
          <div key={data} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-100">
                  {format(new Date(data), "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-sm text-gray-400">
                  {horarios.length} horário{horarios.length !== 1 ? 's' : ''} configurado{horarios.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  console.log('Removendo data:', data);
                  console.log('Estado atual das datas:', datas);
                  
                  // Cria uma cópia do objeto datas
                  const novasDatas = Object.entries(datas || {})
                    .filter(([key]) => key !== data)
                    .reduce((acc, [key, value]) => {
                      acc[key] = value;
                      return acc;
                    }, {});
                  
                  console.log('Novas datas após remoção:', novasDatas);
                  onChange(novasDatas);
                }}
                className="text-gray-400 hover:text-gray-300"
                title="Desmarcar data"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            <button 
              className="w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-left"
              onClick={() => handleDateClick(new Date(data))}
            >
              {horarios.length > 0 ? (
                <div className="text-gray-200">
                  {horarios.map((horario, index) => (
                    <span key={index}>
                      {formatHorario(horario)}
                      {index < horarios.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  Clique para adicionar horários
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

<<<<<<< Updated upstream
      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.dateKey ? new Date(modalConfig.dateKey) : null}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao="unica"
      />
=======
      {/* Modal de Horários */}
      {modalConfig.isOpen && (
        <>
          {console.log('[DataUnicaConfig] Renderizando modal:', {
            dateKey: modalConfig.dateKey,
            horarios: modalConfig.horarios,
            horariosDisponiveis: modalConfig.horariosDisponiveis,
            showReplicacao: modalConfig.showReplicacao
          })}
          <HorarioModal
            isOpen={modalConfig.isOpen}
            onClose={handleModalClose}
            onConfirm={handleHorarioConfirm}
            selectedHorarios={modalConfig.horarios}
            data={modalConfig.dateKey ? normalizeDate(modalConfig.dateKey) : null}
            showReplicacao={modalConfig.showReplicacao}
            tipoConfiguracao="dataUnica"
            horariosDisponiveis={modalConfig.horariosDisponiveis}
          />
        </>
      )}
>>>>>>> Stashed changes
    </div>
  );
} 