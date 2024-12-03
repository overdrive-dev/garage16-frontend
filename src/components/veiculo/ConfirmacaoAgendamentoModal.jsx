'use client'

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const REDIRECT_TIME = 15; // segundos

export default function ConfirmacaoAgendamentoModal({ isOpen, onClose, agendamento }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(REDIRECT_TIME);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(REDIRECT_TIME); // Reset timer quando modal abre
      
      const redirectTimer = setTimeout(() => {
        router.push('/meus-agendamentos');
      }, REDIRECT_TIME * 1000);

      const countdownInterval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => {
        clearTimeout(redirectTimer);
        clearInterval(countdownInterval);
      };
    }
  }, [isOpen, router]);

  if (!agendamento) return null;

  const progressWidth = `${(timeLeft / REDIRECT_TIME) * 100}%`;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-gray-800 p-6 shadow-xl transition-all">
                <div className="text-center">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                  <Dialog.Title className="text-lg font-medium text-white mt-4">
                    Agendamento Confirmado!
                  </Dialog.Title>

                  <div className="mt-4">
                    <p className="text-sm text-gray-300">
                      Seu agendamento para {agendamento.data} às {agendamento.horario} foi confirmado com sucesso.
                    </p>
                  </div>

                  <div className="mt-6 bg-gray-700/50 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        Você será redirecionado para seus agendamentos em {timeLeft} segundos...
                      </p>
                      {/* Barra de Progresso */}
                      <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-1000 ease-linear rounded-full"
                          style={{ width: progressWidth }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                    >
                      Permanecer no Anúncio
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/meus-agendamentos')}
                      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                    >
                      Ver Meus Agendamentos
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 