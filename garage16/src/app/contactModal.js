'use client';

import { useState } from 'react';

export default function ContactModal({ moto, onClose }) {
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Agendar Visita</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Resumo do veículo */}
        <div className="bg-gray-900 rounded p-4 mb-6">
          <h3 className="font-semibold mb-2">{moto.titulo}</h3>
          <p className="text-[#FD4308] font-bold">{moto.preco}</p>
        </div>

        {/* Formulário de agendamento */}
        <form className="space-y-6">
          <div>
            <label className="block mb-2">Data da visita</label>
            <input
              type="date"
              className="w-full bg-gray-900 rounded p-2"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2">Horário</label>
            <select
              className="w-full bg-gray-900 rounded p-2"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            >
              <option value="">Selecione um horário</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              {/* Adicionar mais horários */}
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
          >
            Confirmar Agendamento
          </button>
        </form>
      </div>
    </div>
  );
} 