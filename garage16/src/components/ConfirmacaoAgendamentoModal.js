'use client';

import Link from 'next/link';

export default function ConfirmacaoAgendamentoModal({ isOpen, onClose, agendamento }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-[#FD4308]/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#FD4308]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Agendamento Realizado!</h3>
          <p className="text-gray-400 mb-6">
            Seu agendamento está aguardando confirmação do proprietário da moto. 
            Você receberá uma notificação assim que houver uma resposta.
          </p>

          <div className="space-y-3">
            <Link
              href="/meus-agendamentos"
              className="block w-full bg-[#FD4308] hover:bg-[#e63d07] text-white font-bold py-3 px-6 rounded transition-colors"
            >
              Ver Meus Agendamentos
            </Link>
            <button
              onClick={onClose}
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 