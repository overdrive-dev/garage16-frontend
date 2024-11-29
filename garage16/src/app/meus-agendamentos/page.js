'use client';

import { useState, useEffect } from 'react';

const STATUS_COLORS = {
  'aguardando': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'confirmado': 'bg-green-500/10 text-green-500 border-green-500/20',
  'em_andamento': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'realizado': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  'cancelado': 'bg-red-500/10 text-red-500 border-red-500/20',
};

const STATUS_LABELS = {
  'aguardando': 'Aguardando Confirmação',
  'confirmado': 'Confirmado',
  'em_andamento': 'Em Andamento',
  'realizado': 'Realizado',
  'cancelado': 'Cancelado',
};

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      moto: {
        titulo: 'Honda CB 1000R',
        imagem: '/motos/cb1000r-1.jpg',
      },
      data: '2024-03-20',
      horario: '14:00',
      status: 'aguardando',
    },
    // Adicione mais agendamentos mockados aqui
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Meus Agendamentos</h1>

      <div className="space-y-4">
        {agendamentos.map((agendamento) => (
          <div
            key={agendamento.id}
            className="bg-gray-800 rounded-lg p-4 flex items-center gap-4"
          >
            <div className="relative w-24 h-24 flex-shrink-0">
              <img
                src={agendamento.moto.imagem}
                alt={agendamento.moto.titulo}
                className="object-cover rounded-lg w-full h-full"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold mb-1">{agendamento.moto.titulo}</h3>
              <p className="text-sm text-gray-400">
                Data: {new Date(agendamento.data).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-400">
                Horário: {agendamento.horario}
              </p>
            </div>

            <div className="flex-shrink-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${
                  STATUS_COLORS[agendamento.status]
                }`}
              >
                {STATUS_LABELS[agendamento.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 