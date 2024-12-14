import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDateDisplay } from '@/utils/dateUtils';

export default function HorarioModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedHorarios = [], 
  data,
  showReplicacao = false,
  tipoConfiguracao = 'semanal',
  isNewRange = false,
  periodo = null,
  horariosDisponiveis = [],
  diaSemana = null
}) {
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [replicar, setReplicar] = useState(false);
  const [diasSemana, setDiasSemana] = useState([]);

  useEffect(() => {
    setHorariosSelecionados(selectedHorarios);
    setReplicar(false);
    setDiasSemana([]);
  }, [selectedHorarios, isOpen]);

  const handleHorarioClick = (horario) => {
    setHorariosSelecionados(prev => {
      if (prev.includes(horario)) {
        return prev.filter(h => h !== horario);
      } else {
        return [...prev, horario].sort();
      }
    });
  };

  const handleConfirm = () => {
    onConfirm({
      horarios: horariosSelecionados,
      replicar,
      diasSemana: replicar ? diasSemana : null
    });
  };

  const handleDiaSemanaClick = (dia) => {
    setDiasSemana(prev => {
      if (prev.includes(dia)) {
        return prev.filter(d => d !== dia);
      } else {
        return [...prev, dia];
      }
    });
  };

  const diasDaSemana = [
    { nome: 'Domingo', valor: 'domingo' },
    { nome: 'Segunda', valor: 'segunda-feira' },
    { nome: 'Terça', valor: 'terça-feira' },
    { nome: 'Quarta', valor: 'quarta-feira' },
    { nome: 'Quinta', valor: 'quinta-feira' },
    { nome: 'Sexta', valor: 'sexta-feira' },
    { nome: 'Sábado', valor: 'sábado' }
  ];

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-200"
                >
                  {data ? (
                    <>
                      Horários para {formatDateDisplay(data, "EEEE, dd 'de' MMMM")}
                    </>
                  ) : (
                    'Selecione os horários'
                  )}
                </Dialog.Title>

                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {horariosDisponiveis.map((horario) => (
                      <button
                        key={horario}
                        onClick={() => handleHorarioClick(horario)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${horariosSelecionados.includes(horario)
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                        `}
                      >
                        {horario}
                      </button>
                    ))}
                  </div>

                  {showReplicacao && periodo && (
                    <div className="mt-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="replicar"
                          checked={replicar}
                          onChange={(e) => setReplicar(e.target.checked)}
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-gray-700"
                        />
                        <label htmlFor="replicar" className="ml-2 text-gray-300">
                          Replicar para outros dias
                        </label>
                      </div>

                      {replicar && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 mb-2">
                            Selecione os dias da semana para replicar:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {diasDaSemana.map(({ nome, valor }) => (
                              <button
                                key={valor}
                                onClick={() => handleDiaSemanaClick(valor)}
                                className={`
                                  px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                                  ${diasSemana.includes(valor)
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                                `}
                              >
                                {nome}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none"
                    onClick={handleConfirm}
                  >
                    Confirmar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 