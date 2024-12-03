'use client'

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { disponibilidades, DIAS_SEMANA } from '@/mocks/disponibilidades';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmacaoAgendamentoModal from './ConfirmacaoAgendamentoModal';

export default function AgendamentoModal({ isOpen, onClose, veiculo }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(null);
  const disponibilidade = disponibilidades[veiculo.userId];

  if (!disponibilidade) return null;

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      // Aqui vai a lógica de salvar o agendamento
      const novoAgendamento = {
        data: DIAS_SEMANA[selectedDate],
        horario: selectedTime,
        veiculoId: veiculo.id,
        vendedorId: veiculo.userId,
        compradorId: user.uid
      };

      console.log('Agendamento confirmado:', novoAgendamento);
      
      setAgendamentoConfirmado(novoAgendamento);
      onClose(); // Fecha o modal de agendamento
      setShowConfirmacao(true); // Abre o modal de confirmação
    } catch (error) {
      console.error('Erro ao agendar:', error);
      // Feedback de erro
    }
  };

  return (
    <>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-white mb-4">
                    Agendar Visita - {veiculo.modelo}
                  </Dialog.Title>

                  <div className="space-y-6">
                    {/* Horários de Disponibilidade */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-200">
                        Horários Disponíveis
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(disponibilidade.horarios).map(([dia, config]) => {
                          if (!config.ativo) return null;
                          
                          return (
                            <div 
                              key={dia}
                              className="bg-gray-700/50 rounded-lg p-4"
                            >
                              <h4 className="text-sm font-medium text-gray-200 mb-2">
                                {DIAS_SEMANA[dia]}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {config.horarios.map(horario => (
                                  <button
                                    key={horario}
                                    onClick={() => {
                                      setSelectedDate(dia);
                                      setSelectedTime(horario);
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                                      ${selectedDate === dia && selectedTime === horario
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      }`}
                                  >
                                    {horario}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Seleção atual */}
                    {selectedDate && selectedTime && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                        <p className="text-orange-200">
                          Agendamento selecionado: {DIAS_SEMANA[selectedDate]} às {selectedTime}
                        </p>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!selectedDate || !selectedTime}
                        className={`px-4 py-2 rounded transition-colors
                          ${selectedDate && selectedTime
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        Confirmar Agendamento
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ConfirmacaoAgendamentoModal 
        isOpen={showConfirmacao}
        onClose={() => setShowConfirmacao(false)}
        agendamento={agendamentoConfirmado}
      />
    </>
  );
} 