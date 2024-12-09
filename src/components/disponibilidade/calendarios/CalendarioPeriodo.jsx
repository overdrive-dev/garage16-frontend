import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function CalendarioPeriodo({ 
  selected = { inicio: null, fim: null },
  onChange,
  minDate = new Date()
}) {
  const handleDateSelect = (range) => {
    if (!range) {
      onChange({ inicio: null, fim: null });
      return;
    }

    onChange({
      inicio: range.from,
      fim: range.to || range.from
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <Calendar
        mode="range"
        selected={{
          from: selected.inicio,
          to: selected.fim
        }}
        onChange={handleDateSelect}
        minDate={startOfDay(minDate)}
        classNames={{
          day_selected: "bg-orange-500 text-white hover:bg-orange-600 font-semibold",
          day_today: "bg-gray-700 text-white",
          day_range_middle: "bg-orange-500/20 hover:bg-orange-500/30",
          day_range_start: "bg-orange-500 text-white rounded-l-full font-semibold",
          day_range_end: "bg-orange-500 text-white rounded-r-full font-semibold"
        }}
        locale={ptBR}
      />
    </div>
  );
} 