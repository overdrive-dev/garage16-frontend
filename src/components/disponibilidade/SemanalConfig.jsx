import { useState } from 'react';
import HorarioModal from './HorarioModal';
import Calendar from '../Calendar';
import { format, isAfter, startOfDay, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon } from '@heroicons/react/24/outline';

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

  const diasAtivos = getDiasAtivos();

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

  const handleHorarioConfirm = (horarioData) => {
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

        // Se houver replicação, adiciona aos outros dias selecionados
        if (replicar) {
          console.log('Replicando horários...');
          // Pega apenas os dias que já estão ativos
          const diasAtivos = Object.entries(horarios)
            .filter(([_, config]) => config.ativo && config.horarios.length > 0)
            .map(([dia]) => dia);

          console.log('Dias ativos encontrados:', diasAtivos);

          if (replicar.tipo === 'todos') {
            diasAtivos.forEach(dia => {
              if (dia !== modalConfig.diaSemana) {
                adicionarHorarioAoDia(dia);
              }
            });
          } else if (replicar.tipo === 'especificos') {
            replicar.dias
              .filter(dia => diasAtivos.includes(dia))
              .forEach(dia => {
                if (dia !== modalConfig.diaSemana) {
                  adicionarHorarioAoDia(dia);
                }
              });
          }
        }
      }

      console.log('Novo estado dos horários:', novoHorarios);
      onChange(novoHorarios);
    }
    console.log('===================\n');
    setModalConfig({ isOpen: false, diaSemana: null, horarios: [] });
  };

  // Verifica se deve mostrar replicação
  const verificarReplicacao = (diaSemana) => {
    // Verifica se o dia atual tem horários configurados (está editando)
    const horariosDoDia = horarios[diaSemana]?.horarios || [];
    const estaEditando = horariosDoDia.length > 0;

    // Conta quantas datas configuradas existem (excluindo o dia atual)
    const diasConfigurados = Object.entries(horarios)
      .filter(([dia, config]) => dia !== diaSemana && config.ativo && config.horarios.length > 0);

    // Deve exibir replicação se houver outros dias configurados
    return diasConfigurados.length > 0;
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
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
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
        />
      </div>

      {/* Lista de dias */}
      <div className="space-y-4">
        {diasDaSemana.map(({ key, label }) => (
          <div 
            key={key} 
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-48">
                <div className="text-gray-200 text-lg font-medium">{label}</div>
              </div>
              
              {horarios[key]?.ativo && horarios[key].horarios.length > 0 ? (
                <>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(key)}
                      className="w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-left text-gray-200"
                    >
                      {horarios[key].horarios.join(' - ')}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleDia(key)}
                    className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => toggleDia(key)}
                    className="w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-center text-gray-400"
                  >
                    Clique para adicionar horários
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
      />
    </div>
  );
} 