import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';
import Calendar from '@/components/Calendar';
import { TrashIcon } from '@heroicons/react/24/outline';
import { normalizeDate, normalizeDateString } from '@/utils/dateUtils';

export default function DataUnicaConfig({ datas = {}, onChange, ultimoHorario = [] }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: [],
    showReplicacao: false
  });
  const [hoveredWeekday, setHoveredWeekday] = useState(null);

  const verificarReplicacao = (dataAtual) => {
    const datasConfiguradas = Object.entries(datas || {})
      .filter(([data, horarios]) => data !== dataAtual && horarios && horarios.length > 0)
      .map(([data]) => data);

    return datasConfiguradas.length > 0;
  };

  const handleListClick = (dateStr) => {
    const horarios = datas?.[dateStr] || [];
    
    const showReplicacao = verificarReplicacao(dateStr);

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios,
      showReplicacao
    });
  };

  const handleDateClick = (dates) => {
    if (!dates || !dates.length) return;
    
    const dateStr = normalizeDateString(dates[0]);
    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: datas[dateStr] || ultimoHorario,
      showReplicacao: false
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    if (modalConfig.dateKey) {
      const { horarios: horariosNovos, replicar } = horarioData;
      const novasDatas = { ...datas };

      if (!horariosNovos || horariosNovos.length === 0) {
        // Se não tiver horários, remove a data
        delete novasDatas[modalConfig.dateKey];
      } else {
        // Adiciona os novos horários
        novasDatas[modalConfig.dateKey] = horariosNovos;
      }

      onChange(novasDatas);
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleCalendarSelect = (dates) => {
    console.log('DataUnicaConfig handleCalendarSelect:', dates);
    
    // Se não houver data selecionada
    if (!dates) return;

    // Converte para array se for uma única data
    const datesArray = Array.isArray(dates) ? dates : [dates];
    
    // Se o array estiver vazio, não faz nada
    if (datesArray.length === 0) return;

    // Pega a última data selecionada
    const lastDate = datesArray[datesArray.length - 1];
    const dateStr = normalizeDateString(lastDate);

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: datas[dateStr] || ultimoHorario,
      showReplicacao: verificarReplicacao(dateStr)
    });
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

  const selectedDates = Object.keys(datas || {}).map(dateStr => 
    normalizeDate(dateStr)
  );

  const formatHorario = (horario) => {
    if (typeof horario === 'string') {
      return horario;
    }
    return horario?.inicio && horario?.fim ? `${horario.inicio} às ${horario.fim}` : '';
  };

  const handleHorariosSave = (horarios) => {
    const newDatas = {
      ...datas,
      [selectedDate]: horarios
    };
    console.log('DataUnicaConfig handleHorariosSave:', { selectedDate, horarios, newDatas });
    onChange(newDatas);
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="single"
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

      <div className="space-y-2">
        {Object.entries(datas || {}).map(([data, horarios]) => (
          <div 
            key={data} 
            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
            onClick={() => handleListClick(data)}
          >
            <div>
              <div className="text-gray-200">
                {format(normalizeDate(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <div className="text-sm text-gray-400">
                {horarios.map(formatHorario).join(', ')}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleListClick(data);
              }}
              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {modalConfig.isOpen && (
        <HorarioModal
          isOpen={modalConfig.isOpen}
          onClose={handleModalClose}
          onConfirm={handleHorarioConfirm}
          data={new Date(modalConfig.dateKey)}
          selectedHorarios={modalConfig.horarios}
          showReplicacao={modalConfig.showReplicacao}
          tipoConfiguracao="unica"
        />
      )}
    </div>
  );
} 