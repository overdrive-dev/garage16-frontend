import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HorarioModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  selectedHorarios = [],
  data,
}) {
  const [tempHorarios, setTempHorarios] = useState(selectedHorarios);
  
  useEffect(() => {
    if (isOpen) {
      setTempHorarios(selectedHorarios);
    }
  }, [isOpen, selectedHorarios]);

  const horarios = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00'
  ];

  const toggleHorario = (horario) => {
    setTempHorarios(prev => 
      prev.includes(horario)
        ? prev.filter(h => h !== horario)
        : [...prev, horario].sort()
    );
  };

  const handleConfirm = () => {
    onConfirm(tempHorarios);
    onClose();
  };

  const handleOnClose = () => {
    setTempHorarios(selectedHorarios);
    onClose();
  };

  const handleDesmarcar = () => {
    onConfirm([]); // Envia array vazio para remover a data
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleOnClose}>
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
                <Dialog.Title className="text-lg font-medium text-gray-100 mb-2">
                  Selecione os horários disponíveis
                </Dialog.Title>
                {data && (
                  <p className="text-gray-400 text-sm mb-4">
                    {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {horarios.map((horario) => (
                    <button
                      key={horario}
                      type="button"
                      onClick={() => toggleHorario(horario)}
                      className={`
                        p-2 rounded-md text-sm font-medium transition-colors
                        ${tempHorarios.includes(horario)
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
                      `}
                    >
                      {horario}
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  {/* Lado esquerdo - Botão de desmarcar */}
                  {selectedHorarios.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDesmarcar}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Desmarcar data
                    </button>
                  )}
                  
                  {/* Lado direito - Botões de ação */}
                  <div className="flex space-x-3 ml-auto">
                    <button
                      type="button"
                      onClick={handleOnClose}
                      className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                      Salvar
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