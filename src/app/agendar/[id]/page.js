'use client'

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function Agendar({ params }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [veiculo] = useState({
    id: params.id,
    modelo: 'Honda Civic',
    disponibilidade: {
      diasSemana: ['Quarta-feira'],
      horarios: ['09:00', '10:00', '11:00', '12:00', '13:00']
    }
  });

  const isDateAvailable = (date) => {
    return veiculo.disponibilidade.diasSemana.includes(
      date.toLocaleDateString('pt-BR', { weekday: 'long' })
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">
          Agendar visita - {veiculo.modelo}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-100">Selecione uma data</h2>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileDisabled={({date}) => !isDateAvailable(date)}
              className="rounded-lg border border-gray-700 bg-gray-800 text-gray-100"
            />
          </div>

          {selectedDate && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-100">Selecione um horário</h2>
              <div className="space-y-2">
                {veiculo.disponibilidade.horarios.map((horario) => (
                  <label
                    key={horario}
                    className="flex items-center space-x-2 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="radio"
                      name="horario"
                      value={horario}
                      checked={selectedTime === horario}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="text-orange-500 focus:ring-orange-500 bg-gray-700 border-gray-600"
                    />
                    <span className="text-gray-100">{horario}</span>
                  </label>
                ))}
              </div>

              <button
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-md font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!selectedTime}
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