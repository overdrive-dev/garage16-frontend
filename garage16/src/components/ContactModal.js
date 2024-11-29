'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

export default function ContactModal({ moto, isOpen, onClose }) {
  const [selectedDate, setSelectedDate] = useState();
  const [horario, setHorario] = useState('');

  if (!isOpen) return null;

  const css = `
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: #FD4308;
      --rdp-background-color: #FD4308;
      margin: 0;
    }
    .rdp-day_selected:not([disabled]) { 
      background-color: #FD4308;
    }
    .rdp-day_selected:hover:not([disabled]) { 
      background-color: #e63d07;
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: rgba(253, 67, 8, 0.2);
    }
  `;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <style>{css}</style>
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Agendar Visita</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Resumo do veículo */}
        <div className="bg-gray-900 rounded p-4 mb-6">
          <div className="flex gap-4">
            <div className="relative w-24 h-24">
              <Image
                src={moto.imagens[0]}
                alt={moto.titulo}
                fill
                className="object-cover rounded"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">{moto.titulo}</h3>
              <p className="text-[#FD4308] font-bold">{moto.preco}</p>
            </div>
          </div>
        </div>

        {/* Formulário de agendamento */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block mb-2 font-semibold">Selecione a data da visita</label>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                fromDate={new Date()}
                modifiers={{
                  disabled: [
                    { dayOfWeek: [0] }, // Desabilita domingos
                  ],
                }}
                modifiersStyles={{
                  disabled: { fontSize: '75%', color: '#666' },
                }}
                styles={{
                  caption: { color: 'white' },
                  head_cell: { color: 'white' },
                  day: { color: 'white' },
                }}
              />
            </div>
            <input
              type="text"
              className="w-full bg-gray-900 rounded p-2 text-white"
              value={selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : ''}
              readOnly
              placeholder="Data selecionada aparecerá aqui"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Horário</label>
            <select
              className="w-full bg-gray-900 rounded p-2 text-white"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            >
              <option value="">Selecione um horário</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
            </select>
          </div>

          {/* Informações da loja */}
          <div className="bg-gray-900 rounded p-4">
            <h4 className="font-semibold mb-2">Localização da loja</h4>
            <p className="text-gray-400">
              Rua das Motos, 123
              <br />
              São Paulo - SP
              <br />
              Tel: (11) 99999-9999
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FD4308] hover:bg-[#e63d07] text-white font-bold py-3 px-6 rounded transition-colors"
            disabled={!selectedDate || !horario}
          >
            Confirmar Agendamento
          </button>
        </form>
      </div>
    </div>
  );
} 