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
import { normalizeDate, normalizeDateString, getDayOfWeek } from '@/utils/dateUtils';

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
  onDayMouseLeave,
  hasConfiguredSlots,
  getHorariosData,
  onDateClick
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
      // No modo semanal, destaca todos os dias da mesma semana
      const hoveredDayIndex = getDayOfWeek(hoveredDay);
      const currentDayIndex = getDayOfWeek(day);
      return hoveredDayIndex === currentDayIndex;
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
    if (isDateDisabled(date)) return;

    // Se tiver função de clique personalizada, usa ela
    if (onDateClick) {
      onDateClick(date);
      return;
    }

    // Cria uma nova data usando os componentes da data original
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (mode === 'single') {
      onChange(normalizedDate);
    } else if (mode === 'multiple') {
      const currentSelected = Array.isArray(selected) ? selected : [];
      
      if (weekView) {
        // No modo semanal, mantém apenas a última seleção
        onChange([normalizedDate]);
      } else {
        // Verifica se a data já está selecionada
        const isAlreadySelected = currentSelected.some(d => 
          isSameDay(normalizeDate(d), normalizedDate)
        );

        if (isAlreadySelected) {
          // Se já estiver selecionada, remove
          onChange(currentSelected.filter(d => 
            !isSameDay(normalizeDate(d), normalizedDate)
          ));
        } else {
          // Se não estiver selecionada, adiciona
          onChange([...currentSelected, normalizedDate]);
        }
      }
    } else if (mode === 'range') {
      if (!selected?.from || (selected.from && selected.to)) {
        onChange({ from: normalizedDate, to: null });
      } else {
        const { from } = selected;
        // Normaliza a data inicial também
        const normalizedFrom = new Date(
          from.getFullYear(),
          from.getMonth(),
          from.getDate()
        );
        
        // Garante que a data final é sempre maior que a inicial
        if (isBefore(normalizedDate, normalizedFrom)) {
          onChange({ from: normalizedDate, to: normalizedFrom });
        } else {
          onChange({ from: normalizedFrom, to: normalizedDate });
        }
      }
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
        const normalizedEnd = selected.to ? normalizeDate(selected.to) : null;
        
        if (!normalizedDate || !normalizedStart) return false;
        
        // Se não tiver data final, mostra apenas a inicial
        if (!normalizedEnd) return isSameDay(normalizedDate, normalizedStart);
        
        // Se a data está desabilitada, não mostra como selecionada
        if (isDateDisabled(date)) return false;
        
        // Verifica se a data está no intervalo
        return isWithinInterval(normalizedDate, { 
          start: isBefore(normalizedStart, normalizedEnd) ? normalizedStart : normalizedEnd,
          end: isBefore(normalizedStart, normalizedEnd) ? normalizedEnd : normalizedStart
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

  // Função para verificar se uma data tem horários configurados
  const hasSlots = (date) => {
    if (!hasConfiguredSlots) return false;
    return hasConfiguredSlots(date);
  };

  // Função para obter os horários de uma data
  const getSlots = (date) => {
    if (!getHorariosData) return [];
    return getHorariosData(date);
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

      <div className="grid grid-cols-7 gap-px bg-gray-700/50 rounded-lg overflow-hidden">
        {days.map((day, dayIdx) => {
          const isSelected = isDateSelected(day);
          const isDisabled = isDateDisabled(day);
          const isToday = isSameDay(day, startOfToday());
          const isRelated = getRelatedDays(day);
          const hasConfigured = hasSlots(day);
          const slots = getSlots(day);

          // Debug logs
          if (mode === 'range' && isSelected) {
            console.log('📅 [Calendar] Selected day:', {
              day,
              isSelected,
              selected,
              normalizedDay: normalizeDate(day)
            });
          }

          // Combina as classes do dia
          const dayClasses = classNames(
            "relative min-h-[2.5rem] p-2 bg-gray-800 hover:bg-gray-700/50 transition-colors flex items-center justify-center",
            !isSameMonth(day, firstDayCurrentMonth) && "text-gray-500",
            isDisabled && "text-gray-500 cursor-not-allowed opacity-50 hover:bg-gray-800",
            !isDisabled && "cursor-pointer",
            isToday && (customClassNames.day_today || "bg-gray-700"),
            isRelated && !isSelected && "bg-gray-700/50",
            hasConfigured && "border-b-2 border-orange-500",
            slots.length > 0 && "after:content-['•'] after:absolute after:bottom-1 after:right-1 after:text-orange-500"
          );

          return (
            <div
              key={day.toString()}
              className={dayClasses}
              onClick={() => !isDisabled && handleDateClick(day)}
              onMouseEnter={() => handleDayMouseEnter(day)}
              onMouseLeave={() => handleDayMouseLeave(day)}
            >
              <time 
                dateTime={format(day, 'yyyy-MM-dd')}
                className={classNames(
                  "flex items-center justify-center rounded-full w-7 h-7 transition-colors",
                  isSelected && "bg-orange-500 text-white",
                  isToday && !isSelected && "bg-gray-700 text-white"
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

export function CalendarSkeleton() {
  return (
    <div className="select-none animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-700 rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gray-700 rounded"></div>
          <div className="h-8 w-8 bg-gray-700 rounded"></div>
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
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="relative py-3 bg-gray-800">
            <div className="mx-auto h-7 w-7 rounded-full bg-gray-700"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 