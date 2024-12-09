import { useState } from 'react';
import { format, startOfDay, isAfter, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Calendar from '@/components/Calendar';

const diasDaSemana = [
  { key: 'dom', label: 'Domingo' },
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' }
];

export default function CalendarioSemanal({ 
  diasAtivos = [],
  onChange,
  minDate = new Date(),
  datasDisponiveis = []
}) {
  const [hoveredWeekday, setHoveredWeekday] = useState(null);

  const isDataDisponivel = (date) => {
    if (!datasDisponiveis.length) return true;
    
    return datasDisponiveis.some(dataDisp => {
      const dataDispDate = new Date(dataDisp);
      return date.getDate() === dataDispDate.getDate() &&
             date.getMonth() === dataDispDate.getMonth() &&
             date.getFullYear() === dataDispDate.getFullYear();
    });
  };

  const handleDayMouseEnter = (date) => {
    if (!isDataDisponivel(date)) return;
    const dayOfWeek = date.getDay();
    setHoveredWeekday(dayOfWeek);
  };

  const handleDayMouseLeave = () => {
    setHoveredWeekday(null);
  };

  const handleCalendarSelect = (dates) => {
    if (!dates || !dates.length) return;
    
    const date = dates[0];
    if (!isDataDisponivel(date)) return;

    const diaSemana = diasDaSemana[date.getDay()].key;
    onChange(diaSemana);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <Calendar
        mode="multiple"
        selected={diasAtivos}
        onChange={handleCalendarSelect}
        weekView={true}
        minDate={startOfDay(minDate)}
        disabledDates={datasDisponiveis.length > 0 ? 
          (date) => !isDataDisponivel(date) 
          : undefined
        }
        onDayMouseEnter={handleDayMouseEnter}
        onDayMouseLeave={handleDayMouseLeave}
        hoveredWeekday={hoveredWeekday}
        classNames={{
          day_selected: "bg-orange-500 text-white hover:bg-orange-600",
          day_today: "bg-gray-700 text-white"
        }}
        locale={ptBR}
      />
    </div>
  );
} 