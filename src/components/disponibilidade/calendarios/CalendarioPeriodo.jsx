import { format, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Calendar from '@/components/Calendar';
import { useEffect } from 'react';

// Função auxiliar para normalizar a data
function normalizeDate(date) {
  if (!date) return null;
  
  try {
    // Se for string, tenta converter para Date
    if (typeof date === 'string') {
      return startOfDay(parseISO(date));
    }
    // Se já for Date, apenas normaliza
    if (date instanceof Date) {
      return startOfDay(date);
    }
    console.log('[CalendarioPeriodo] Data inválida:', date);
    return null;
  } catch (error) {
    console.error('[CalendarioPeriodo] Erro ao normalizar data:', error);
    return null;
  }
}

export default function CalendarioPeriodo({ 
  selected = { inicio: null, fim: null },
  onChange,
  minDate = new Date()
}) {
  console.log('[CalendarioPeriodo] Props recebidas:', { selected, minDate });

  // Efeito para garantir que as datas sejam carregadas inicialmente
  useEffect(() => {
    if (selected.inicio || selected.fim) {
      console.log('[CalendarioPeriodo] Datas selecionadas detectadas:', selected);
      const normalizedRange = {
        inicio: selected.inicio ? format(normalizeDate(selected.inicio), 'yyyy-MM-dd') : null,
        fim: selected.fim ? format(normalizeDate(selected.fim), 'yyyy-MM-dd') : null
      };
      console.log('[CalendarioPeriodo] Carregando datas iniciais:', normalizedRange);
    }
  }, [selected]);

  const handleDateSelect = (range) => {
    console.log('[CalendarioPeriodo] Range selecionado:', range);

    if (!range) {
      onChange({ inicio: null, fim: null });
      return;
    }

    // Normaliza as datas antes de passar para o onChange
    const normalizedRange = {
      inicio: range.from ? format(normalizeDate(range.from), 'yyyy-MM-dd') : null,
      fim: range.to ? format(normalizeDate(range.to), 'yyyy-MM-dd') : 
           range.from ? format(normalizeDate(range.from), 'yyyy-MM-dd') : null
    };

    console.log('[CalendarioPeriodo] Range normalizado:', normalizedRange);
    onChange(normalizedRange);
  };

  // Normaliza as datas recebidas antes de passar para o Calendar
  const normalizedSelected = {
    from: normalizeDate(selected.inicio),
    to: normalizeDate(selected.fim)
  };

  console.log('[CalendarioPeriodo] Selected normalizado para Calendar:', normalizedSelected);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <Calendar
        mode="range"
        selected={normalizedSelected}
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