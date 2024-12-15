import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDateDisplay, normalizeDate, isValidDate } from '@/utils/dateUtils';
import { eachDayOfInterval } from 'date-fns';

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
  const [tipoReplicacao, setTipoReplicacao] = useState('nenhuma');
  const [diasSemana, setDiasSemana] = useState([]);
  const [periodoAnterior, setPeriodoAnterior] = useState(null);

  // Atualiza horários selecionados quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setHorariosSelecionados(selectedHorarios);
    }
  }, [selectedHorarios, isOpen]);

  // Reseta seleções apenas quando o período muda
  useEffect(() => {
    if (periodo && periodoAnterior && 
        (periodo.from !== periodoAnterior.from || periodo.to !== periodoAnterior.to)) {
      console.log('🔍 Novo período detectado, resetando seleções');
      setDiasSemana([]);
      setTipoReplicacao('nenhuma');
      setReplicar(false);
    }
    setPeriodoAnterior(periodo);
  }, [periodo]);

  const handleHorarioClick = (horario) => {
    setHorariosSelecionados(prev => {
      if (prev.includes(horario)) {
        return prev.filter(h => h !== horario);
      } else {
        return [...prev, horario].sort();
      }
    });
  };

  const handleModalClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm({
      horarios: horariosSelecionados,
      replicar,
      tipoReplicacao,
      diasSemana: tipoReplicacao === 'diasSemana' ? diasSemana : null
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
    // Se não estiver em modo de replicação por dias da semana, ativa
    if (tipoReplicacao !== 'diasSemana') {
      setTipoReplicacao('diasSemana');
      setReplicar(true);
    }
  };

  const handleTipoReplicacaoChange = (novoTipo) => {
    setTipoReplicacao(novoTipo);
    setReplicar(novoTipo !== 'nenhuma');
  };

  // Função para obter os dias da semana disponíveis no período
  const getDiasSemanaPeriodo = () => {
    console.log('🔍 Período recebido:', {
      from: periodo?.from ? formatDateDisplay(periodo.from) : null,
      to: periodo?.to ? formatDateDisplay(periodo.to) : null
    });

    if (!periodo?.from || !periodo?.to) return [];

    try {
      // Garante que as datas estão normalizadas antes de usar
      const start = normalizeDate(periodo.from);
      const end = normalizeDate(periodo.to);

      if (!start || !end) {
        console.error('❌ Datas inválidas após normalização');
        return [];
      }

      // Obtém todos os dias no intervalo
      const diasDisponiveis = eachDayOfInterval({
        start,
        end
      });

      console.log('🔍 Dias disponíveis:', diasDisponiveis.map(d => formatDateDisplay(d)));

      // Cria um Set para evitar duplicatas e mantém a ordem dos dias da semana
      const diasSemanaUnicos = new Set();
      const diasOrdenados = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado'
      ];
      
      // Primeiro adiciona os dias na ordem que aparecem no período
      diasDisponiveis.forEach(date => {
        const diaSemana = format(date, 'EEEE', { locale: ptBR }).toLowerCase();
        diasSemanaUnicos.add(diaSemana);
      });

      // Converte para array mantendo a ordem correta dos dias da semana
      const diasArray = diasOrdenados.filter(dia => diasSemanaUnicos.has(dia));
      console.log('🔍 Dias únicos encontrados:', diasArray);
      return diasArray;
    } catch (error) {
      console.error('❌ Erro ao obter dias da semana do período:', error);
      return [];
    }
  };

  // Lista de dias da semana filtrada
  const diasDaSemanaPeriodo = getDiasSemanaPeriodo();

  // Lista de dias da semana filtrada para mostrar apenas os dias que existem no range
  const diasDaSemana = [
    { nome: 'Domingo', valor: 'domingo' },
    { nome: 'Segunda', valor: 'segunda-feira' },
    { nome: 'Terça', valor: 'terça-feira' },
    { nome: 'Quarta', valor: 'quarta-feira' },
    { nome: 'Quinta', valor: 'quinta-feira' },
    { nome: 'Sexta', valor: 'sexta-feira' },
    { nome: 'Sábado', valor: 'sábado' }
  ].filter(dia => diasDaSemanaPeriodo.includes(dia.valor));

  // Renderiza as opções de replicação para período
  const renderPeriodoReplicacao = () => (
    <div className="mt-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="radio"
              checked={tipoReplicacao === 'nenhuma'}
              onChange={() => handleTipoReplicacaoChange('nenhuma')}
              className="text-orange-500 focus:ring-orange-500 border-gray-600 bg-gray-700"
            />
            Aplicar apenas neste dia
          </label>

          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="radio"
              checked={tipoReplicacao === 'todos'}
              onChange={() => handleTipoReplicacaoChange('todos')}
              className="text-orange-500 focus:ring-orange-500 border-gray-600 bg-gray-700"
            />
            Replicar para todos os dias do período
          </label>

          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="radio"
              checked={tipoReplicacao === 'diasSemana'}
              onChange={() => handleTipoReplicacaoChange('diasSemana')}
              className="text-orange-500 focus:ring-orange-500 border-gray-600 bg-gray-700"
            />
            Replicar para dias específicos da semana
          </label>
        </div>

        {tipoReplicacao === 'diasSemana' && (
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
                  <div className="flex justify-between items-center">
                    <span>{nome}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Nota: Os horários serão aplicados apenas nos dias disponíveis dentro do período selecionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Renderiza a opção de replicação para data única e semanal
  const renderDefaultReplicacao = () => (
    <div className="mt-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="replicar"
          checked={replicar}
          onChange={(e) => {
            setReplicar(e.target.checked);
            setTipoReplicacao(e.target.checked ? 'todos' : 'nenhuma');
          }}
          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-600 rounded bg-gray-700"
        />
        <label htmlFor="replicar" className="ml-2 text-gray-300">
          {tipoConfiguracao === 'semanal' 
            ? "Replicar este horário para todos os dias selecionados"
            : "Replicar este horário para outros dias"}
        </label>
      </div>
    </div>
  );

  // Função para formatar a data do título
  const formatarDataTitulo = () => {
    if (!data || !isValidDate(data)) {
      return 'Selecione os horários disponíveis';
    }
    try {
      return `Horários para ${format(data, "dd 'de' MMMM", { locale: ptBR })}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Selecione os horários disponíveis';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleModalClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-200">
                      {isNewRange ? 'Selecione os horários disponíveis' : formatarDataTitulo()}
                    </h3>
                    <button
                      onClick={() => setHorariosSelecionados([])}
                      className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      Desmarcar todos
                    </button>
                  </div>

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

                    {showReplicacao && horariosSelecionados.length > 0 && (
                      tipoConfiguracao === 'periodo' ? renderPeriodoReplicacao() : renderDefaultReplicacao()
                    )}

                    {isNewRange && periodo && horariosSelecionados.length > 0 && (
                      <p className="text-sm text-gray-400 mt-6 bg-gray-700/50 p-3 rounded-lg">
                        Este horário será aplicado para todas as datas do período (
                        {formatDateDisplay(periodo.from, "dd/MM")} a{' '}
                        {formatDateDisplay(periodo.to, "dd/MM")})
                      </p>
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
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 