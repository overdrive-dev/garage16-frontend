'use client'

import { useState } from 'react';
import Calendar from 'react-calendar';

export default function Agendar({ params }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [veiculo] = useState({
    id: params.id,
    modelo: 'Honda Civic',
    disponibilidade: {
      diasDisponiveis: {
        'Segunda-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        'Terça-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        'Quarta-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        'Quinta-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        'Sexta-feira': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      }
    }
  });

  const getDiaSemana = (date) => {
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return dias[date.getDay()];
  };

  const isDateAvailable = (date) => {
    const diaSemana = getDiaSemana(date);
    return veiculo.disponibilidade.diasDisponiveis[diaSemana]?.length > 0;
  };

  const formatSelectedDate = (date) => {
    if (!date) return '';
    const formatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('pt-BR', formatOptions);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">
          Agendar visita - {veiculo.modelo}
        </h1>

        <div className="space-y-6">
          {/* Calendário */}
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-100">Selecione uma data disponível</h2>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileDisabled={({date}) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today || !isDateAvailable(date);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-100 [&_.react-calendar__navigation]:text-gray-100 [&_.react-calendar__navigation_button]:min-w-[44px] [&_.react-calendar__navigation_button]:bg-transparent [&_.react-calendar__navigation_button]:hover:bg-gray-700 [&_.react-calendar__navigation_button]:rounded-md [&_.react-calendar__month-view__weekdays]:text-gray-400 [&_.react-calendar__month-view__weekdays]:font-bold [&_.react-calendar__month-view__days__day]:rounded-md [&_.react-calendar__tile]:p-4"
              tileClassName={({ date }) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const isSelected = selectedDate && 
                  date.toDateString() === selectedDate.toDateString();

                return `bg-transparent transition-colors relative
                  ${date < today ? 'text-gray-600 cursor-not-allowed' : 'text-gray-100 hover:bg-gray-700'}
                  ${isSelected ? 'bg-orange-500 text-white' : ''}
                  ${date.toDateString() === today.toDateString() ? 'font-bold' : ''}
                  ${!isDateAvailable(date) ? 'text-gray-600 cursor-not-allowed' : ''}`
              }}
              showDoubleView={true}
              calendarType="gregory"
              locale="pt-BR"
              formatDay={(locale, date) => date.getDate()}
              formatMonthYear={(locale, date) => 
                date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
              }
              formatShortWeekday={(locale, date) => 
                ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()]
              }
            />
          </div>

          {/* Data selecionada */}
          {selectedDate && (
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg">
              <p className="text-orange-200 font-medium">
                {formatSelectedDate(selectedDate)}
              </p>
            </div>
          )}

          {/* Horários */}
          {selectedDate && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-100">Selecione um horário</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {veiculo.disponibilidade.diasDisponiveis[getDiaSemana(selectedDate)]?.map((horario) => (
                  <button
                    key={horario}
                    type="button"
                    onClick={() => setSelectedTime(horario)}
                    className={`relative p-3 rounded-md text-sm font-medium transition-all
                      ${selectedTime === horario
                        ? 'bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-800'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105'}
                      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                  >
                    {horario}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botão de confirmação */}
          {selectedDate && selectedTime && (
            <div className="mt-6">
              <button
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-md font-semibold 
                  hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 
                  focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Confirmar Agendamento
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 