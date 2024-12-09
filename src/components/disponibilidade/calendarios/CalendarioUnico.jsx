import { useState } from 'react';
import { format, startOfDay, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function CalendarioUnico({ 
  selected = [], 
  onChange,
  isWeekly = false,
  minDate = new Date()
}) {
  const [hoveredWeekday, setHoveredWeekday] = useState(null);

  const handleDayMouseEnter = (date) => {
    if (!isWeekly) return;
    const dayOfWeek = date.getDay();
    setHoveredWeekday(dayOfWeek);
  };

  const handleDayMouseLeave = () => {
    if (!isWeekly) return;
    setHoveredWeekday(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <Calendar
        mode="multiple"
        selected={selected}
        onChange={onChange}
        minDate={startOfDay(minDate)}
        classNames={{
          day_selected: "bg-orange-500 text-white hover:bg-orange-600",
          day_today: "bg-gray-700 text-white",
          day_matches_hovered: isWeekly ? (date) => {
            return hoveredWeekday !== null && 
                   date.getDay() === hoveredWeekday && 
                   isAfter(date, new Date());
          } : null
        }}
        hoveredWeekday={isWeekly ? hoveredWeekday : null}
        onDayMouseEnter={handleDayMouseEnter}
        onDayMouseLeave={handleDayMouseLeave}
      />
    </div>
  );
} 