import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { normalizeDate, isValidDate } from '@/utils/dateUtils';

export default function HorarioModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  selectedHorarios = [],
  data,
  showReplicacao = false,
  tipoConfiguracao
}) {
  const [tempHorarios, setTempHorarios] = useState(selectedHorarios);
  const [replicarHorario, setReplicarHorario] = useState(false);
  const [tipoReplicacao, setTipoReplicacao] = useState('todos');
  const [diasSelecionados, setDiasSelecionados] = useState([]);
  
  // Estado derivado para controlar a visibilidade da replicação
  const deveExibirReplicacao = showReplicacao && tempHorarios.length > 0;

  useEffect(() => {
    if (isOpen) {
      setTempHorarios(selectedHorarios);
      setReplicarHorario(false);
      setTipoReplicacao('todos');
      setDiasSelecionados([]);
    }
  }, [isOpen, selectedHorarios]);

  const horarios = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00'
  ];

  const diasSemana = [
    { nome: 'Domingo', formato: 'domingo' },
    { nome: 'Segunda', formato: 'segunda' },
    { nome: 'Terça', formato: 'terça' },
    { nome: 'Quarta', formato: 'quarta' },
    { nome: 'Quinta', formato: 'quinta' },
    { nome: 'Sexta', formato: 'sexta' },
    { nome: 'Sábado', formato: 'sábado' }
  ];

  const toggleHorario = (horario) => {
    const horarios = Array.isArray(tempHorarios) ? tempHorarios : tempHorarios?.horarios || [];
    setTempHorarios(
      horarios.includes(horario)
        ? horarios.filter(h => h !== horario)
        : [...horarios, horario].sort()
    );
  };

  const handleConfirm = () => {
    const horariosFinal = Array.isArray(tempHorarios) ? tempHorarios : tempHorarios?.horarios || [];
    
    onConfirm({
      horarios: horariosFinal,
      replicar: replicarHorario ? {
        tipo: 'todos',
        dias: []
      } : null
    });
    onClose();
  };

  const handleOnClose = () => {
    setTempHorarios(selectedHorarios);
    onClose();
  };

  const handleDesmarcar = () => {
    onConfirm({ horarios: [], replicar: null }); // Envia array vazio para remover a data
    onClose();
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (tipoConfiguracao === 'semanal') return date;
    if (!isValidDate(date)) return 'Data inválida';
    const normalizedDate = normalizeDate(date);
    return format(normalizedDate, "dd/MM/yyyy", { locale: ptBR });
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
                    {formatDate(data)}
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

                {deveExibirReplicacao && (
                  <div className="mt-6 space-y-4 border-t border-gray-700 pt-4">
                    {tipoConfiguracao === 'faixaHorario' ? (
                      <>
                        <div 
                          className="flex items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                          onClick={() => setReplicarHorario(!replicarHorario)}
                        >
                          <input
                            type="checkbox"
                            id="replicarHorario"
                            checked={replicarHorario}
                            onChange={(e) => setReplicarHorario(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                          />
                          <label htmlFor="replicarHorario" className="ml-2 text-sm text-gray-200 cursor-pointer select-none">
                            Replicar este horário para outros dias
                          </label>
                        </div>

                        {replicarHorario && (
                          <div className="ml-2 space-y-4 animate-fadeIn">
                            <div className="bg-gray-700/30 p-4 rounded-lg space-y-3">
                              <div className="flex items-center space-x-6">
                                <div 
                                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${tipoReplicacao === 'todos' ? 'bg-gray-600/50' : 'hover:bg-gray-700/50'}`}
                                  onClick={() => setTipoReplicacao('todos')}
                                >
                                  <input
                                    type="radio"
                                    id="todosDias"
                                    name="tipoReplicacao"
                                    value="todos"
                                    checked={tipoReplicacao === 'todos'}
                                    onChange={(e) => setTipoReplicacao(e.target.value)}
                                    className="h-4 w-4 border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                                  />
                                  <label htmlFor="todosDias" className="ml-2 text-sm text-gray-200 cursor-pointer select-none">
                                    Todos os dias
                                  </label>
                                </div>
                                <div 
                                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${tipoReplicacao === 'especificos' ? 'bg-gray-600/50' : 'hover:bg-gray-700/50'}`}
                                  onClick={() => setTipoReplicacao('especificos')}
                                >
                                  <input
                                    type="radio"
                                    id="diasEspecificos"
                                    name="tipoReplicacao"
                                    value="especificos"
                                    checked={tipoReplicacao === 'especificos'}
                                    onChange={(e) => setTipoReplicacao(e.target.value)}
                                    className="h-4 w-4 border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                                  />
                                  <label htmlFor="diasEspecificos" className="ml-2 text-sm text-gray-200 cursor-pointer select-none">
                                    Dias específicos
                                  </label>
                                </div>
                              </div>

                              {tipoReplicacao === 'especificos' && (
                                <div className="grid grid-cols-2 gap-3 pt-2 animate-fadeIn">
                                  {diasSemana.map(({ nome }) => (
                                    <div 
                                      key={nome}
                                      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${diasSelecionados.includes(nome) ? 'bg-gray-600/50' : 'hover:bg-gray-700/50'}`}
                                      onClick={() => {
                                        if (diasSelecionados.includes(nome)) {
                                          setDiasSelecionados(diasSelecionados.filter(d => d !== nome));
                                        } else {
                                          setDiasSelecionados([...diasSelecionados, nome]);
                                        }
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        id={`dia-${nome}`}
                                        checked={diasSelecionados.includes(nome)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setDiasSelecionados([...diasSelecionados, nome]);
                                          } else {
                                            setDiasSelecionados(diasSelecionados.filter(d => d !== nome));
                                          }
                                        }}
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                                      />
                                      <label htmlFor={`dia-${nome}`} className="ml-2 text-sm text-gray-200 cursor-pointer select-none">
                                        {nome}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div 
                        className="flex items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                        onClick={() => {
                          const novoValor = !replicarHorario;
                          setReplicarHorario(novoValor);
                          if (novoValor) {
                            setTipoReplicacao('todos');
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          id="replicarHorario"
                          checked={replicarHorario}
                          onChange={() => {
                            const novoValor = !replicarHorario;
                            setReplicarHorario(novoValor);
                            if (novoValor) {
                              setTipoReplicacao('todos');
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                        />
                        <label 
                          htmlFor="replicarHorario"
                          className="ml-2 text-sm text-gray-200 cursor-pointer select-none flex-1"
                          onClick={(e) => e.preventDefault()}
                        >
                          Replicar este horário para todos os dias selecionados
                        </label>
                      </div>
                    )}
                  </div>
                )}

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