'use client'

import { useState, useEffect } from 'react';
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
  isBefore,
  isAfter,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { normalizeDate, normalizeDateString } from '@/utils/dateUtils';

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
  showPreview = true,
  onDayMouseEnter,
  onDayMouseLeave
}) {
  const [currentMonth, setCurrentMonth] = useState(normalizeDate(defaultMonth));
  const [hoveredDay, setHoveredDay] = useState(null);
  const firstDayCurrentMonth = startOfMonth(currentMonth);

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { locale: ptBR, weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { locale: ptBR, weekStartsOn: 1 }),
  }).map(day => normalizeDate(day));

  // Identifica os dias relacionados baseado no modo
  const getRelatedDays = (day) => {
    if (!hoveredDay) return false;

    // Se a data está desabilitada, não mostra hover
    if (isDateDisabled(day)) return false;

    if (weekView) {
      return getDay(day) === getDay(hoveredDay) && !isBefore(day, startOfToday());
    }

    switch (mode) {
      case 'range': {
        if (!showPreview) return false;
        
        if (!selected?.from) return isSameDay(day, hoveredDay);
        
        // Se já temos um período selecionado, não mostra preview
        if (selected.from && selected.to) return false;
        
        const start = selected.from;
        const end = hoveredDay;
        
        // Se a data está no intervalo e não está desabilitada, mostra hover
        return !isDateDisabled(day) && isWithinInterval(day, {
          start: isBefore(start, end) ? start : end,
          end: isBefore(start, end) ? end : start
        });
      }
      case 'single':
      case 'multiple':
      default:
        return isSameDay(day, hoveredDay);
    }
  };

  const handleDateClick = (date) => {
    console.log('Calendar handleDateClick - date:', date);
    console.log('Calendar handleDateClick - selected:', selected);
    console.log('Calendar handleDateClick - mode:', mode);

    if (weekView) {
      if (!isDateDisabled(date)) {
        onChange([date]);
      }
      return;
    }

    switch (mode) {
      case 'range': {
        if (!selected?.from || (selected.from && selected.to)) {
          // Para iniciar um novo range, não precisa mais verificar se a data está disponível
          console.log('Calendar handleDateClick - iniciando nova seleção');
          onChange({ 
            from: date, 
            to: null 
          });
        } else {
          console.log('Calendar handleDateClick - completando range');
          // Para completar o range, permite qualquer data final
          onChange({ 
            from: selected.from,
            to: date
          });
        }
        break;
      }
      case 'multiple': {
        if (!isDateDisabled(date)) {
          const currentSelected = Array.isArray(selected) ? selected : [];
          const dateExists = currentSelected.some(d => isSameDay(d, date));
          onChange(date);
        }
        break;
      }
      case 'single':
        if (!isDateDisabled(date)) {
          onChange(date);
        }
        break;
      default:
        if (!isDateDisabled(date)) {
          onChange([date]);
        }
        break;
    }
  };

  const isDateSelected = (date) => {
    if (!selected) return false;
    
    const normalizedDate = normalizeDate(date);
    const today = startOfToday();
    
    if (weekView) {
      return Array.isArray(selected) && selected.some(selectedDate => {
        const normalizedSelected = normalizeDate(selectedDate);
        return getDay(normalizedSelected) === getDay(normalizedDate) && 
               !isBefore(normalizedDate, today);
      });
    }

    switch (mode) {
      case 'range': {
        if (!selected.from) return false;
        
        const normalizedStart = normalizeDate(selected.from);
        const normalizedEnd = normalizeDate(selected.to);
        
        if (!normalizedDate || !normalizedStart) return false;
        if (!normalizedEnd) return isSameDay(normalizedDate, normalizedStart);
        
        // Se a data está desabilitada, não mostra como selecionada
        if (isDateDisabled(date)) return false;
        
        return isWithinInterval(normalizedDate, { 
          start: normalizedStart, 
          end: normalizedEnd 
        });
      }

      case 'single':
      case 'multiple':
      default:
        return Array.isArray(selected) 
          ? selected.some(d => isSameDay(normalizeDate(d), normalizedDate))
          : isSameDay(normalizedDate, normalizeDate(selected));
    }
  };

  const isDateDisabled = (date) => {
    const normalizedDate = normalizeDate(date);
    
    // Verifica data mínima
    if (minDate && isBefore(normalizedDate, normalizeDate(minDate))) return true;
    
    // Verifica data máxima
    if (maxDate && isAfter(normalizedDate, normalizeDate(maxDate))) return true;
    
    // Verifica função de desabilitação personalizada
    if (typeof disabledDates === 'function') {
      return disabledDates(normalizedDate);
    }
    
    // Verifica array de datas desabilitadas
    if (Array.isArray(disabledDates)) {
      return disabledDates.some(disabledDate => 
        isSameDay(normalizedDate, normalizeDate(disabledDate))
      );
    }

    return false;
  };

  const handleDayMouseEnter = (date) => {
    if (isDateDisabled(date)) return;
    setHoveredDay(date);
    onDayMouseEnter?.(date);
  };

  const handleDayMouseLeave = (date) => {
    setHoveredDay(null);
    onDayMouseLeave?.(date);
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
            onClick={() => setCurrentMonth(add(firstDayCurrentMonth, { months: -1 }))}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(add(firstDayCurrentMonth, { months: 1 }))}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs leading-6 text-gray-400 mb-2">
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sáb</div>
        <div>Dom</div>
      </div>

      <div className="grid grid-cols-7 text-sm gap-px bg-gray-700/50 rounded-lg overflow-hidden">
        {days.map((day, dayIdx) => {
          const isSelected = isDateSelected(day);
          const isDisabled = isDateDisabled(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isRelated = getRelatedDays(day);
          const isTodayDate = isToday(day);
          
          return (
            <div
              key={day.toString()}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(day)],
                'relative py-3',
                !isCurrentMonth && 'text-gray-400',
                isDisabled && 'cursor-not-allowed opacity-50',
                !isDisabled && 'cursor-pointer transition-colors',
                isRelated && 'bg-gray-700',
                !isRelated && 'bg-gray-800 hover:bg-gray-700'
              )}
              onClick={() => !isDisabled && handleDateClick(day)}
              onMouseEnter={() => handleDayMouseEnter(day)}
              onMouseLeave={() => handleDayMouseLeave(day)}
            >
              <time
                dateTime={format(day, 'yyyy-MM-dd')}
                className={classNames(
                  'mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                  isSelected && (customClassNames.day_selected || 'bg-orange-500 text-white'),
                  !isSelected && isTodayDate && !isRelated && (customClassNames.day_today || 'bg-gray-700 text-white'),
                  !isSelected && !isTodayDate && isCurrentMonth && 'text-gray-200',
                  !isSelected && !isTodayDate && !isCurrentMonth && 'text-gray-400',
                  isRelated && !isSelected && 'bg-gray-700 text-white',
                  isDisabled && 'opacity-50 cursor-not-allowed'
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
  'col-start-7',
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
]; 