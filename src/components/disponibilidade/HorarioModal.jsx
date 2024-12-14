import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { normalizeDate, isValidDate } from '@/utils/dateUtils';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';

export default function HorarioModal({
  isOpen,
  onClose,
  onConfirm,
  selectedHorarios = [],
  data,
  showReplicacao,
  tipoConfiguracao,
  isNewRange,
  periodo,
  diaSemana,
  horariosDisponiveis = []
}) {
  const { storeSettings } = useDisponibilidade();
  const [horarios, setHorarios] = useState(selectedHorarios);
  const [replicarHorario, setReplicarHorario] = useState(false);
  const [tipoReplicacao, setTipoReplicacao] = useState('nenhuma');
  const [diasSemana, setDiasSemana] = useState({
    domingo: false,
    segunda: false,
    terca: false,
    quarta: false,
    quinta: false,
    sexta: false,
    sabado: false
  });

  // Reseta os horários quando o modal abre com uma nova data
  useEffect(() => {
    if (isOpen) {
      if (JSON.stringify(horarios) !== JSON.stringify(selectedHorarios)) {
        setHorarios(selectedHorarios);
      }
      setReplicarHorario(false);
      setTipoReplicacao('nenhuma');
      setDiasSemana({
        domingo: false,
        segunda: false,
        terca: false,
        quarta: false,
        quinta: false,
        sexta: false,
        sabado: false
      });
    }
  }, [isOpen, data]);

  // Verifica se um horário está disponível para o dia da semana
  const isHorarioDisponivel = (horario) => {
    if (!diaSemana) return true;
    return storeSettings?.weekDays?.[diaSemana]?.slots?.includes(horario);
  };

  // Pega os horários disponíveis para o dia atual
  const getHorariosDisponiveis = () => {
    if (!diaSemana || !storeSettings?.weekDays?.[diaSemana]?.slots) {
      return horariosDisponiveis;
    }
    return storeSettings.weekDays[diaSemana].slots;
  };

  const toggleHorario = (horario) => {
    // Verifica se o horário está disponível antes de permitir a seleção
    if (!isHorarioDisponivel(horario)) return;

    setHorarios(
      horarios.includes(horario)
        ? horarios.filter(h => h !== horario)
        : [...horarios, horario].sort()
    );
  };

  const handleConfirm = () => {
    // Filtra apenas os horários que estão disponíveis na loja
    const horariosPermitidos = horarios.filter(horario => isHorarioDisponivel(horario));

    // Se é configuração de período com edição individual
    if (tipoConfiguracao === 'periodo' && !isNewRange) {
      onConfirm({
        horarios: horariosPermitidos,
        replicar: tipoReplicacao !== 'nenhuma',
        diasSemana: tipoReplicacao === 'diasSemana' ? 
          Object.entries(diasSemana)
            .filter(([_, selected]) => selected)
            .map(([dia]) => dia) : 
          null
      });
    } else {
      // Para data única e semanal, mantém o comportamento original
      onConfirm({
        horarios: horariosPermitidos,
        replicar: replicarHorario
      });
    }
  };

  const handleDesmarcar = () => {
    onConfirm({ horarios: [], replicar: false });
  };

  // Renderiza as opções de replicação específicas para período
  const renderPeriodoReplicacao = () => (
    <div className="space-y-4 mb-6">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-gray-300">
          <input
            type="radio"
            checked={tipoReplicacao === 'nenhuma'}
            onChange={() => setTipoReplicacao('nenhuma')}
            className="text-orange-500 focus:ring-orange-500"
          />
          Aplicar apenas neste dia
        </label>

        <label className="flex items-center gap-2 text-gray-300">
          <input
            type="radio"
            checked={tipoReplicacao === 'todos'}
            onChange={() => setTipoReplicacao('todos')}
            className="text-orange-500 focus:ring-orange-500"
          />
          Replicar para todos os dias do período
        </label>

        <label className="flex items-center gap-2 text-gray-300">
          <input
            type="radio"
            checked={tipoReplicacao === 'diasSemana'}
            onChange={() => setTipoReplicacao('diasSemana')}
            className="text-orange-500 focus:ring-orange-500"
          />
          Replicar para dias específicos da semana
        </label>
      </div>

      {tipoReplicacao === 'diasSemana' && (
        <div className="pl-6 space-y-2">
          {Object.entries({
            domingo: 'Domingo',
            segunda: 'Segunda-feira',
            terca: 'Terça-feira',
            quarta: 'Quarta-feira',
            quinta: 'Quinta-feira',
            sexta: 'Sexta-feira',
            sabado: 'Sábado'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={diasSemana[key]}
                onChange={(e) => setDiasSemana({ ...diasSemana, [key]: e.target.checked })}
                className="text-orange-500 focus:ring-orange-500 rounded"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  // Renderiza a opção de replicação original para data única e semanal
  const renderDefaultReplicacao = () => (
    <div 
      className="flex items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer mb-6"
      onClick={() => setReplicarHorario(!replicarHorario)}
    >
      <input
        type="checkbox"
        checked={replicarHorario}
        onChange={(e) => setReplicarHorario(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
      />
      <label className="ml-2 text-sm text-gray-200 cursor-pointer select-none flex-1">
        {tipoConfiguracao === 'semanal' 
          ? "Replicar este horário para todos os dias selecionados"
          : "Replicar este horário para outros dias"}
      </label>
    </div>
  );

  const formatDataDisplay = () => {
    if (!data) return '';
    
    if (tipoConfiguracao === 'semanal') {
      return data; // No modo semanal, data já é o nome do dia
    }
    
    if (!isValidDate(data)) return '';
    return format(normalizeDate(data), "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

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
            {isNewRange ? 'Definir horários para o período' : 'Editar horários'}
          </Dialog.Title>

          {data && (
            <p className="text-gray-300 mb-4">
              {formatDataDisplay()}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 mb-4">
            {getHorariosDisponiveis().map((horario) => {
              const disponivel = isHorarioDisponivel(horario);
              return (
                <button
                  key={horario}
                  onClick={() => toggleHorario(horario)}
                  disabled={!disponivel}
                  className={`
                    p-2 rounded-md text-sm font-medium transition-colors
                    ${!disponivel ? 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-400' :
                      horarios.includes(horario)
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
                  `}
                >
                  {horario}
                </button>
              );
            })}
          </div>

          {isNewRange && periodo && horarios.length > 0 && (
            <p className="text-sm text-gray-400 mb-6 bg-gray-700/50 p-3 rounded-lg">
              Este horário será aplicado para todas as datas do período (
              {format(normalizeDate(periodo.from), "dd/MM", { locale: ptBR })} a{' '}
              {format(normalizeDate(periodo.to), "dd/MM", { locale: ptBR })})
            </p>
          )}

          {showReplicacao && !isNewRange && horarios.length > 0 && (
            tipoConfiguracao === 'periodo' ? renderPeriodoReplicacao() : renderDefaultReplicacao()
          )}

          <div className="flex items-center justify-between">
            {/* Lado esquerdo - Botão de desmarcar */}
            {!isNewRange && selectedHorarios.length > 0 && (
              <button
                onClick={handleDesmarcar}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Desmarcar data
              </button>
            )}

            {/* Lado direito - Botões de ação */}
            <div className={`flex gap-3 ${!isNewRange && selectedHorarios.length > 0 ? '' : 'ml-auto'}`}>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 