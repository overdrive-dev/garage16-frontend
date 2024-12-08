'use client'

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  isWithinInterval,
  startOfDay,
  isBefore,
  isAfter
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Calendar({ 
  mode = 'single',
  selected = null,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  classNames: customClassNames = {},
  defaultMonth = new Date(),
  weekView = false,
  onDayMouseEnter,
  onDayMouseLeave
}) {
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);
  const firstDayCurrentMonth = startOfMonth(currentMonth);

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { locale: ptBR }),
    end: endOfWeek(endOfMonth(currentMonth), { locale: ptBR }),
  });

  const previousMonth = () => {
    setCurrentMonth(add(firstDayCurrentMonth, { months: -1 }));
  };

  const nextMonth = () => {
    setCurrentMonth(add(firstDayCurrentMonth, { months: 1 }));
  };

  const isDateSelected = (date) => {
    if (!selected) return false;
    
    if (mode === 'single') {
      return isSameDay(date, selected);
    }
    
    if (mode === 'multiple') {
      if (weekView) {
        // No modo semanal, verifica se existe uma data selecionada para este dia da semana
        // E se a data é futura
        return selected.some(selectedDate => {
          const normalizedDate = startOfDay(selectedDate);
          const normalizedCurrent = startOfDay(date);
          const isSameWeekday = getDay(normalizedDate) === getDay(normalizedCurrent);
          const isFutureDate = isAfter(normalizedCurrent, startOfDay(new Date()));
          return isSameWeekday && isFutureDate;
        });
      }
      return selected.some(selectedDate => isSameDay(date, selectedDate));
    }
    
    if (mode === 'range' && selected.from && selected.to) {
      return isWithinInterval(date, { 
        start: startOfDay(selected.from), 
        end: startOfDay(selected.to) 
      });
    }

    if (mode === 'range' && selected.from) {
      return isSameDay(date, selected.from);
    }
    
    return false;
  };

  const isDateDisabled = (date) => {
    // Verifica data mínima
    if (minDate && isBefore(date, startOfDay(minDate))) {
      return true;
    }

    // Verifica data máxima
    if (maxDate && isAfter(date, startOfDay(maxDate))) {
      return true;
    }

    // Verifica datas desabilitadas específicas
    return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (mode === 'single') {
      onChange(date);
    } else if (mode === 'multiple') {
      const currentSelected = selected || [];
      
      if (weekView) {
        // No modo semanal, sempre passa a data clicada
        onChange([date]);
      } else {
        // Em vez de remover a data quando clicada novamente, sempre chama onChange
        onChange([date]);
      }
    } else if (mode === 'range') {
      if (!selected?.from || (selected.from && selected.to)) {
        onChange({ from: date, to: null });
      } else {
        const { from } = selected;
        if (isBefore(date, from)) {
          onChange({ from: date, to: from });
        } else {
          onChange({ from, to: date });
        }
      }
    }
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-200">
          {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={previousMonth}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs leading-6 text-gray-400 mb-2">
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sáb</div>
      </div>

      <div className="grid grid-cols-7 text-sm gap-px bg-gray-700/50 rounded-lg overflow-hidden">
        {days.map((day, dayIdx) => {
          const isSelected = isDateSelected(day);
          const isDisabled = isDateDisabled(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isRangeStart = mode === 'range' && selected?.from && isSameDay(day, selected.from);
          const isRangeEnd = mode === 'range' && selected?.to && isSameDay(day, selected.to);
          const isInRange = mode === 'range' && selected?.from && selected?.to && 
            isWithinInterval(day, { start: selected.from, end: selected.to });
          const matchesHovered = customClassNames.day_matches_hovered ? customClassNames.day_matches_hovered(day) : false;
          
          return (
            <div
              key={day.toString()}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(day)],
                'relative py-3',
                !isCurrentMonth && '',
                isDisabled && 'cursor-not-allowed opacity-50',
                !isDisabled && 'cursor-pointer transition-colors',
                isInRange && !isRangeStart && !isRangeEnd && 'bg-orange-500/20',
                matchesHovered ? 'bg-gray-700' : 'bg-gray-800',
                'hover:!bg-gray-700'
              )}
              onClick={() => !isDisabled && handleDateClick(day)}
              onMouseEnter={() => !isDisabled && onDayMouseEnter?.(day)}
              onMouseLeave={onDayMouseLeave}
            >
              <time
                dateTime={format(day, 'yyyy-MM-dd')}
                className={classNames(
                  'mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                  isSelected && (customClassNames.day_selected || 'bg-orange-500 text-white'),
                  !isSelected && isToday(day) && (customClassNames.day_today || 'bg-gray-700 text-white'),
                  !isSelected && !isToday(day) && isCurrentMonth && 'text-gray-200',
                  !isSelected && !isToday(day) && !isCurrentMonth && 'text-gray-400',
                  isRangeStart && 'bg-orange-500 text-white',
                  isRangeEnd && 'bg-orange-500 text-white'
                )}
              >
                {format(day, 'd')}
              </time>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
]; 