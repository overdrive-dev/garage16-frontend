import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ModalEditarHorario({ isOpen, onClose, onSave, horario, data }) {
  const [horaInicio, setHoraInicio] = useState(horario?.horaInicio || '');
  const [horaFim, setHoraFim] = useState(horario?.horaFim || '');
  const [replicarHorario, setReplicarHorario] = useState(false);
  const [tipoReplicacao, setTipoReplicacao] = useState('todos');
  const [diasSelecionados, setDiasSelecionados] = useState([]);

  const handleSave = () => {
    onSave({
      horaInicio,
      horaFim,
      replicar: replicarHorario ? {
        tipo: tipoReplicacao,
        dias: tipoReplicacao === 'todos' ? [] : diasSelecionados
      } : null
    });
    onClose();
  };

  const dataFormatada = format(new Date(data), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl w-full">
          <Dialog.Title className="text-lg font-medium text-gray-100 mb-4">
            Editar Horário - {dataFormatada}
          </Dialog.Title>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Hora de início
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Hora de fim
                </label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-700 pt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="replicarHorario"
                  checked={replicarHorario}
                  onChange={(e) => setReplicarHorario(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="replicarHorario" className="ml-2 text-sm text-gray-200">
                  Replicar este horário para outros dias
                </label>
              </div>

              {replicarHorario && (
                <div className="ml-6 space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="todosDias"
                        name="tipoReplicacao"
                        value="todos"
                        checked={tipoReplicacao === 'todos'}
                        onChange={(e) => setTipoReplicacao(e.target.value)}
                        className="h-4 w-4 border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="todosDias" className="ml-2 text-sm text-gray-200">
                        Todos os dias
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="diasEspecificos"
                        name="tipoReplicacao"
                        value="especificos"
                        checked={tipoReplicacao === 'especificos'}
                        onChange={(e) => setTipoReplicacao(e.target.value)}
                        className="h-4 w-4 border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="diasEspecificos" className="ml-2 text-sm text-gray-200">
                        Dias específicos
                      </label>
                    </div>
                  </div>

                  {tipoReplicacao === 'especificos' && (
                    <div className="grid grid-cols-2 gap-2">
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => (
                        <div key={dia} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`dia-${dia}`}
                            checked={diasSelecionados.includes(dia)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDiasSelecionados([...diasSelecionados, dia]);
                              } else {
                                setDiasSelecionados(diasSelecionados.filter(d => d !== dia));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                          />
                          <label htmlFor={`dia-${dia}`} className="ml-2 text-sm text-gray-200">
                            {dia}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Salvar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 