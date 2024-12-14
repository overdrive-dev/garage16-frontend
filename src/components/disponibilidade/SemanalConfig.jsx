import { useState, useMemo, useEffect } from 'react';
import HorarioModal from './HorarioModal';
import Calendar from '../Calendar';
import { format, isAfter, startOfDay, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const diasDaSemana = [
  { key: 'dom', label: 'Domingo' },
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' }
];

export default function SemanalConfig({ horarios, onChange, datasDisponiveis = [] }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    diaSemana: null,
    horarios: []
  });
  const [hoveredWeekday, setHoveredWeekday] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verifica se uma data está disponível para configuração
  const isDataDisponivel = (date) => {
    // Se não houver lista de datas disponíveis, considera todas disponíveis
    if (!datasDisponiveis.length) return true;
    
    // Verifica se a data está na lista de datas disponíveis
    return datasDisponiveis.some(dataDisp => {
      const dataDispDate = new Date(dataDisp);
      return date.getDate() === dataDispDate.getDate() &&
             date.getMonth() === dataDispDate.getMonth() &&
             date.getFullYear() === dataDispDate.getFullYear();
    });
  };

  // Verifica se um dia da semana está ativo
  const isDiaSemanaAtivo = (diaSemana) => {
    return horarios[diaSemana]?.ativo && horarios[diaSemana].horarios.length > 0;
  };

  // Converte os dias ativos em datas para o calendário
  const getDiasAtivos = () => {
    const hoje = startOfDay(new Date());
    const todasDatasDoMes = eachDayOfInterval({
      start: startOfDay(hoje),
      end: endOfMonth(hoje)
    });

    return todasDatasDoMes.filter(data => {
      const diaSemana = diasDaSemana[data.getDay()].key;
      const diaAtivo = horarios[diaSemana]?.ativo && horarios[diaSemana].horarios.length > 0;
      const isFutureDate = isAfter(startOfDay(data), startOfDay(new Date()));
      return diaAtivo && isFutureDate && isDataDisponivel(data);
    });
  };

  const diasAtivos = useMemo(() => getDiasAtivos(), [horarios, datasDisponiveis]);

  const handleCalendarSelect = (dates) => {
    console.log('\n=== handleCalendarSelect ===');
    console.log('Datas selecionadas:', dates?.map(d => d.toISOString().split('T')[0]));
    
    if (!dates || !dates.length) return;
    
    const date = dates[0];
    if (!isDataDisponivel(date)) {
      console.log('Data não disponível:', date.toISOString().split('T')[0]);
      return;
    }

    const diaSemana = diasDaSemana[date.getDay()].key;
    console.log('Dia da semana selecionado:', diaSemana);
    console.log('===================\n');

    handleOpenModal(diaSemana);
  };

  const handleDayMouseEnter = (date) => {
    if (!isDataDisponivel(date)) return;
    const dayOfWeek = date.getDay();
    setHoveredWeekday(dayOfWeek);
  };

  const handleDayMouseLeave = () => {
    setHoveredWeekday(null);
  };

  const toggleDia = (dia) => {
    const diaConfig = horarios[dia];
    
    if (!diaConfig.ativo || !diaConfig.horarios.length) {
      handleOpenModal(dia);
    } else {
      onChange({
        ...horarios,
        [dia]: {
          ativo: false,
          horarios: []
        }
      });
    }
  };

  const handleHorarioConfirm = async (horarioData) => {
    setError(null);
    setIsLoading(true);
    try {
      console.log('\n=== handleHorarioConfirm ===');
      console.log('Dados recebidos:', horarioData);
      console.log('Estado atual:', modalConfig);
      
      if (modalConfig.diaSemana) {
        const { horarios: horariosNovos, replicar } = horarioData;
        const novoHorarios = { ...horarios };
        const horarioAtual = horarios[modalConfig.diaSemana]?.horarios || [];

        // Função para adicionar horário a um dia específico
        const adicionarHorarioAoDia = (dia) => {
          novoHorarios[dia] = {
            ativo: true,
            horarios: horariosNovos
          };
          console.log(`Adicionando horários ao dia ${dia}:`, horariosNovos);
        };

        // Se está removendo horários
        if (horariosNovos.length === 0) {
          console.log('Removendo horários do dia:', modalConfig.diaSemana);
          novoHorarios[modalConfig.diaSemana] = {
            ativo: false,
            horarios: []
          };
        } else {
          // Adiciona apenas ao dia atual
          adicionarHorarioAoDia(modalConfig.diaSemana);

          // Se houver replicação, adiciona aos outros dias ativos
          if (replicar) {
            console.log('Replicando horários para dias ativos...');
            // Pega apenas os dias que já estão ativos
            const diasAtivos = Object.entries(horarios)
              .filter(([_, config]) => config.ativo && config.horarios.length > 0)
              .map(([dia]) => dia);

            console.log('Dias ativos encontrados:', diasAtivos);

            // Replica para todos os dias ativos
            diasAtivos.forEach(dia => {
              if (dia !== modalConfig.diaSemana) {
                adicionarHorarioAoDia(dia);
              }
            });
          }
        }

        console.log('Novo estado dos horários:', novoHorarios);
        onChange(novoHorarios);
      }
    } catch (err) {
      console.error('Erro ao salvar horários:', err);
      setError('Erro ao salvar horários. Tente novamente.');
    } finally {
      setIsLoading(false);
      console.log('===================\n');
      setModalConfig({ isOpen: false, diaSemana: null, horarios: [] });
    }
  };

  // Memoiza os dias configurados para evitar recálculos
  const diasConfigurados = useMemo(() => {
    return Object.entries(horarios)
      .reduce((acc, [dia, config]) => {
        if (config.ativo && config.horarios.length > 0) {
          acc.push(dia);
        }
        return acc;
      }, []);
  }, [horarios]);

  // Verifica se deve mostrar replicação
  const verificarReplicacao = (diaSemana) => {
    // Filtra o dia atual dos dias configurados
    return diasConfigurados.length > 1 || 
           (diasConfigurados.length === 1 && diasConfigurados[0] !== diaSemana);
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, diaSemana: null, horarios: [] });
  };

  const handleOpenModal = (diaSemana) => {
    setModalConfig({
      isOpen: true,
      diaSemana,
      horarios: horarios[diaSemana]?.horarios || [],
      showReplicacao: verificarReplicacao(diaSemana)
    });
  };

  const isDateActive = (date) => {
    const diaSemana = diasDaSemana[date.getDay()].key;
    const isAtivo = horarios[diaSemana]?.ativo && horarios[diaSemana].horarios.length > 0;
    const isFutureDate = isAfter(startOfDay(date), startOfDay(new Date()));
    return isAtivo && isFutureDate;
  };

  return (
    <div className="space-y-8">
      {/* Mensagens de Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg animate-fade-in">
          <p className="text-red-200 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}
      
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4 transform transition-all duration-200 hover:shadow-lg">
        <Calendar
          mode="multiple"
          selected={diasAtivos}
          onChange={handleCalendarSelect}
          weekView={true}
          minDate={startOfDay(new Date())}
          disabledDates={datasDisponiveis.length > 0 ? 
            (date) => !isDataDisponivel(date) 
            : undefined
          }
          onDayMouseEnter={handleDayMouseEnter}
          onDayMouseLeave={handleDayMouseLeave}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600 transform transition-all duration-200 scale-110",
            day_today: "bg-gray-700 text-white",
          }}
        />
      </div>

      {/* Lista de dias */}
      <div className="space-y-4">
        {diasDaSemana.map(({ key, label }) => (
          <div 
            key={key} 
            className="bg-gray-800 rounded-lg p-4 transform transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-48">
                <div className="text-gray-200 text-lg font-medium">{label}</div>
              </div>
              
              {horarios[key]?.ativo && horarios[key].horarios.length > 0 ? (
                <>
                  <div className="flex-1 group relative">
                    <button
                      type="button"
                      onClick={() => !isLoading && handleOpenModal(key)}
                      disabled={isLoading}
                      className={`w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-left text-gray-200
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {horarios[key].horarios.join(' - ')}
                    </button>
                    <div className="hidden group-hover:block absolute z-10 p-2 bg-gray-900 rounded-md shadow-lg -top-2 left-full ml-2">
                      <div className="text-sm text-gray-300">
                        Clique para editar os horários
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => !isLoading && toggleDia(key)}
                    disabled={isLoading}
                    className={`p-2 text-gray-400 hover:text-gray-300 transition-colors
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => !isLoading && toggleDia(key)}
                    disabled={isLoading}
                    className={`w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-center text-gray-400
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Salvando...
                      </span>
                    ) : "Clique para adicionar horários"}
                  </button>
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
        data={modalConfig.diaSemana}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao="semanal"
        isLoading={isLoading}
      />
    </div>
  );
} 