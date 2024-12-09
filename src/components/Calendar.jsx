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
  startOfDay,
  isBefore,
  isAfter,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Função auxiliar para normalizar a data para o início do dia no fuso horário local
function normalizeToLocalStartOfDay(date) {
  if (!date) return null;
  const localDate = new Date(date);
  return startOfDay(localDate);
}

// Função auxiliar para converter data para string no formato YYYY-MM-DD
function dateToString(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  showPreview = true
}) {
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);
  const [hoveredDay, setHoveredDay] = useState(null);
  const firstDayCurrentMonth = startOfMonth(currentMonth);

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, { locale: ptBR }),
    end: endOfWeek(endOfMonth(currentMonth), { locale: ptBR }),
  });

  // Identifica os dias relacionados baseado no modo
  const getRelatedDays = (day) => {
    if (!hoveredDay) return false;

    if (weekView) {
      return getDay(day) === getDay(hoveredDay) && isAfter(day, new Date());
    }

    switch (mode) {
      case 'period': {
        if (!showPreview) return false;
        
        if (!selected?.from) return isSameDay(day, hoveredDay);
        
        // Se já temos um período selecionado, não mostra preview
        if (selected.from && selected.to) return false;
        
        const start = selected.from;
        const end = hoveredDay;
        
        return isWithinInterval(day, {
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
    if (isDateDisabled(date)) return;

    if (weekView) {
      onChange([date]);
      return;
    }

    switch (mode) {
      case 'period': {
        const normalizedDate = normalizeToLocalStartOfDay(date);
        
        console.log('Calendar - handleDateClick:', {
          date: dateToString(normalizedDate),
          selected: {
            from: dateToString(selected?.from),
            to: dateToString(selected?.to)
          }
        });
        
        if (!selected?.from || (selected.from && selected.to)) {
          onChange({ 
            from: normalizedDate, 
            to: null 
          });
        } else {
          const normalizedFrom = normalizeToLocalStartOfDay(selected.from);
          const isAfterFrom = isAfter(normalizedDate, normalizedFrom) || isSameDay(normalizedDate, normalizedFrom);
          onChange({ 
            from: isAfterFrom ? normalizedFrom : normalizedDate,
            to: isAfterFrom ? normalizedDate : normalizedFrom
          });
        }
        break;
      }
      case 'multiple': {
        const currentSelected = Array.isArray(selected) ? selected : [];
        const dateExists = currentSelected.some(d => isSameDay(d, date));
        onChange(dateExists 
          ? currentSelected.filter(d => !isSameDay(d, date))
          : [...currentSelected, date]
        );
        break;
      }
      case 'single':
      default:
        onChange([date]);
        break;
    }
  };

  const isDateSelected = (date) => {
    if (!selected) return false;
    
    if (weekView) {
      return Array.isArray(selected) && selected.some(selectedDate => {
        const normalizedDate = normalizeToLocalStartOfDay(selectedDate);
        const normalizedCurrent = normalizeToLocalStartOfDay(date);
        return getDay(normalizedDate) === getDay(normalizedCurrent) && 
               isAfter(normalizedCurrent, startOfDay(new Date()));
      });
    }

    switch (mode) {
      case 'period': {
        if (!selected.from) return false;
        
        const normalizedDate = normalizeToLocalStartOfDay(date);
        const normalizedStart = normalizeToLocalStartOfDay(selected.from);
        const normalizedEnd = normalizeToLocalStartOfDay(selected.to);
        
        if (!normalizedDate || !normalizedStart) return false;
        if (!normalizedEnd) return isSameDay(normalizedDate, normalizedStart);
        
        return isWithinInterval(normalizedDate, { 
          start: normalizedStart, 
          end: normalizedEnd 
        });
      }

      case 'single':
      case 'multiple':
      default:
        return Array.isArray(selected) 
          ? selected.some(d => isSameDay(d, date))
          : isSameDay(date, selected);
    }
  };

  const isDateDisabled = (date) => {
    if (minDate && isBefore(date, normalizeToLocalStartOfDay(minDate))) return true;
    if (maxDate && isAfter(date, normalizeToLocalStartOfDay(maxDate))) return true;
    if (typeof disabledDates === 'function') {
      return disabledDates(date);
    }
    return Array.isArray(disabledDates) && disabledDates.some(disabledDate => isSameDay(date, disabledDate));
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
          const isRelated = getRelatedDays(day);
          
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
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <time
                dateTime={format(day, 'yyyy-MM-dd')}
                className={classNames(
                  'mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                  isSelected && (customClassNames.day_selected || 'bg-orange-500 text-white'),
                  !isSelected && isToday(day) && (customClassNames.day_today || 'bg-gray-700 text-white'),
                  !isSelected && !isToday(day) && isCurrentMonth && 'text-gray-200',
                  !isSelected && !isToday(day) && !isCurrentMonth && 'text-gray-400'
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