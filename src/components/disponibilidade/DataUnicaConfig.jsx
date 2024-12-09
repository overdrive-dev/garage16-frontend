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

  const handleDateClick = (date) => {
    if (!date) return;
    
    const dateStr = normalizeDateString(date);
    const horarios = datas?.[dateStr] || [];
    const showReplicacao = verificarReplicacao(dateStr);

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
          Object.keys(datas).forEach(data => {
            if (data !== modalConfig.dateKey && datas[data]?.length > 0) {
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
    if (dates && !Array.isArray(dates)) {
      handleDateClick(dates);
      return;
    }

    if (Array.isArray(dates) && dates.length > 0) {
      handleDateClick(dates[0]);
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
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onChange={handleDateClick}
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