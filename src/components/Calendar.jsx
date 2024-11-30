'use client'

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover } from '@headlessui/react';

export default function Calendar({ selectedDate, onChange, disabledDates = [], getHorariosForDate, tileClassName }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const nextMonth = (e) => {
    e.preventDefault();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = (e) => {
    e.preventDefault();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg">
      {/* Cabeçalho do Calendário */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-100 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grade do Calendário */}
      <div className="grid grid-cols-7 text-center gap-1">
        {/* Dias da Semana */}
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-xs text-gray-400 font-medium py-2">
            {day}
          </div>
        ))}

        {/* Dias do Mês */}
        {days.map((day, dayIdx) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDisabled = disabledDates.some(disabledDate => 
            isSameDay(new Date(disabledDate), day)
          );
          const isDayToday = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          // Classes base para o botão
          const baseClasses = `
            w-full h-10 focus:outline-none relative
            ${!isCurrentMonth ? 'text-gray-600' : 'text-gray-100'}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
          `;

          // Obtenha as classes customizadas
          const customClasses = tileClassName ? tileClassName({ date: day, view: 'month' }) : '';

          return (
            <Popover key={dayIdx} className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    disabled={isDisabled}
                    className={`${baseClasses} group`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isDisabled) {
                        onChange(day);
                      }
                    }}
                  >
                    <div className={`
                      absolute inset-1 rounded-full transition-colors
                      ${customClasses}
                      group-hover:bg-gray-800
                    `} />
                    <time
                      dateTime={format(day, 'yyyy-MM-dd')}
                      className={`
                        relative z-10
                        mx-auto flex h-8 w-8 items-center justify-center
                        ${isDayToday ? 'font-bold text-blue-400' : ''}
                        ${isSelected ? 'font-bold' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </time>
                  </Popover.Button>

                  {/* Só mostra o Popover se houver horários para mostrar */}
                  {getHorariosForDate && (
                    <Popover.Panel
                      className={`
                        absolute z-50 -top-2 left-1/2 -translate-y-full -translate-x-1/2
                        bg-gray-800 text-gray-100 px-4 py-2 rounded-lg shadow-lg text-sm
                        min-w-[200px]
                      `}
                    >
                      <div className="font-medium">
                        {format(day, "dd 'de' MMMM", { locale: ptBR })}
                      </div>
                      <div className="text-gray-300 mt-1">
                        {getHorariosForDate(day)}
                      </div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="border-8 border-transparent border-t-gray-800" />
                      </div>
                    </Popover.Panel>
                  )}
                </>
              )}
            </Popover>
          );
        })}
      </div>
    </div>
  );
} 