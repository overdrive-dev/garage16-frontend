import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';
import Calendar from '@/components/Calendar';
import { TrashIcon } from '@heroicons/react/24/outline';
import { normalizeDate, normalizeDateString } from '@/utils/dateUtils';

export default function DataUnicaConfig({ datas = {}, onChange, isWeekly = false }) {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, dateKey: null, horarios: [] });
  const [hoveredWeekday, setHoveredWeekday] = useState(null);

  const verificarReplicacao = (dataAtual) => {
    console.log('\n=== Verificação de Replicação (Data Única) ===');
    console.log('Data sendo verificada:', dataAtual);
    console.log('Estado atual das datas:', datas);

    const horariosDaData = datas[dataAtual];
    console.log('Horários da data atual:', horariosDaData);

    const estaEditando = horariosDaData && horariosDaData.length > 0;
    console.log('Está editando?', estaEditando);

    if (!estaEditando) {
      console.log('Não mostra replicação pois não está editando');
      return false;
    }

    const datasConfiguradas = Object.entries(datas || {})
      .filter(([data, horarios]) => data !== dataAtual && horarios && horarios.length > 0)
      .map(([data]) => data);

    console.log('Datas configuradas (excluindo atual):', datasConfiguradas);
    console.log('Quantidade de datas configuradas:', datasConfiguradas.length);

    const horariosConsiderados = horariosDaData;
    console.log('Horários considerados:', horariosConsiderados);

    const deveExibirReplicacao = datasConfiguradas.length > 0;
    console.log('Deve exibir replicação?', deveExibirReplicacao);
    console.log('Motivo:', deveExibirReplicacao ? 'Existem outras datas configuradas' : 'Não existem outras datas configuradas');
    console.log('=====================================\n');

    return deveExibirReplicacao;
  };

  const handleDateClick = (date) => {
    console.log('\n=== Clique na Data ===');
    console.log('Data clicada:', date);
    
    const dateStr = normalizeDateString(date);
    console.log('Data normalizada:', dateStr);
    
    const horarios = datas?.[dateStr] || [];
    console.log('Horários existentes:', horarios);
    
    const showReplicacao = verificarReplicacao(dateStr);
    console.log('Mostrar replicação?', showReplicacao);

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
      
      if (!horariosNovos || horariosNovos.length === 0) {
        console.log('Removendo data:', modalConfig.dateKey);
        const novasDatas = { ...datas };
        delete novasDatas[modalConfig.dateKey];
        onChange(novasDatas);
        setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
        return;
      }

      const novasDatas = { ...datas };
      novasDatas[modalConfig.dateKey] = horariosNovos;

      if (replicar?.tipo === 'todos') {
        if (isWeekly) {
          console.log('Replicando horários no modo semanal');
          console.log('Dias já configurados:', Object.keys(datas));
          
          Object.keys(datas).forEach(data => {
            if (data !== modalConfig.dateKey && datas[data]?.length > 0) {
              console.log('Replicando para:', data);
              novasDatas[data] = horariosNovos;
            }
          });
        } else {
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
    if (!isWeekly) return;
    const dayOfWeek = date.getDay();
    setHoveredWeekday(dayOfWeek);
  };

  const handleDayMouseLeave = () => {
    if (!isWeekly) return;
    setHoveredWeekday(null);
  };

  // Converte as datas string para objetos Date para o calendário
  const selectedDates = Object.keys(datas || {}).map(dateStr => 
    normalizeDate(dateStr)
  );

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
          minDate={normalizeDate(new Date())}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white",
          }}
          onDayMouseEnter={handleDayMouseEnter}
          onDayMouseLeave={handleDayMouseLeave}
        />
      </div>

      {/* Lista de Datas */}
      <div className="space-y-2">
        {Object.entries(datas || {}).map(([data, horarios]) => (
          <div key={data} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
            <div>
              <div className="text-gray-200">
                {format(normalizeDate(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <div className="text-sm text-gray-400">
                {horarios.map(formatHorario).join(', ')}
              </div>
            </div>
            <button
              onClick={() => handleDateClick(normalizeDate(data))}
              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Horários */}
      {modalConfig.isOpen && (
        <HorarioModal
          isOpen={modalConfig.isOpen}
          onClose={handleModalClose}
          onConfirm={handleHorarioConfirm}
          data={normalizeDate(modalConfig.dateKey)}
          selectedHorarios={modalConfig.horarios}
          showReplicacao={modalConfig.showReplicacao}
        />
      )}
    </div>
  );
} 