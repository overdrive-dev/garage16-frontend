import { useState, useMemo, useEffect } from 'react';
import HorarioModal from './HorarioModal';
import Calendar from '../Calendar';
import { format, isAfter, startOfDay, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon, ExclamationTriangleIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import { normalizeDate, normalizeDateString, getDayOfWeek, getDayString } from '@/utils/dateUtils';
import HorarioCard from './HorarioCard';

const diasDaSemana = [
  { key: 'dom', label: 'Domingo' },
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' }
];

export default function SemanalConfig({ horarios, onChange }) {
  const { storeSettings, hasConfiguredSlots, getHorariosData } = useDisponibilidade();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    diaSemana: null,
    horarios: [],
    showReplicacao: false
  });
  const [hoveredWeekday, setHoveredWeekday] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);

  // Verifica se um dia está disponível nas configurações da loja
  const isDiaDisponivelNaLoja = (diaSemana) => {
    const diaConfig = storeSettings?.weekDays?.[diaSemana];
    return diaConfig?.active !== false && diaConfig?.slots?.length > 0;
  };

  // Verifica se uma data está disponível para configuração
  const isDataDisponivel = (date) => {
    if (!date) return false;
    
    // Primeiro verifica se o dia da semana está disponível na loja
    const diaSemana = diasDaSemana[date.getDay()].key;
    if (!isDiaDisponivelNaLoja(diaSemana)) return false;
    
    // Se não houver lista de datas disponíveis, considera todas disponíveis
    if (!datasDisponiveis.length) return true;
    
    // Normaliza a data para comparação
    const dateStr = normalizeDateString(date);
    
    // Verifica se a data está na lista de datas disponíveis
    return datasDisponiveis.some(dataDisp => normalizeDateString(dataDisp) === dateStr);
  };

  // Verifica se um dia da semana está ativo
  const isDiaSemanaAtivo = (diaSemana) => {
    const diaConfig = horarios[diaSemana];
    return isDiaDisponivelNaLoja(diaSemana) && diaConfig?.ativo && Array.isArray(diaConfig?.horarios) && diaConfig.horarios.length > 0;
  };

  // Converte os dias ativos em datas para o calendário
  const getDiasAtivos = () => {
    if (!horarios) return [];

    const hoje = normalizeDate(new Date());
    const todasDatasDoMes = eachDayOfInterval({
      start: hoje,
      end: endOfMonth(hoje)
    });

    return todasDatasDoMes.filter(data => {
      const diaSemana = diasDaSemana[data.getDay()].key;
      const diaAtivo = isDiaSemanaAtivo(diaSemana);
      const isFutureDate = isAfter(normalizeDate(data), hoje);
      return diaAtivo && isFutureDate && isDataDisponivel(data);
    });
  };

  const diasAtivos = useMemo(() => getDiasAtivos(), [horarios, storeSettings]);

  // Função para lidar com o hover do dia da semana
  const handleDayMouseEnter = (date) => {
    if (!date) return;
    const dayIndex = getDayOfWeek(date);
    const diaSemana = getDayString(dayIndex);
    if (!diaSemana) return;
    setHoveredWeekday(diaSemana);
  };

  const handleDayMouseLeave = () => {
    setHoveredWeekday(null);
  };

  // Função para lidar com a seleção no calendário
  const handleCalendarSelect = (dates) => {
    // Se não receber datas, retorna
    if (!dates || !Array.isArray(dates) || dates.length === 0) return;
    
    // Pega a última data selecionada
    const date = dates[dates.length - 1];
    if (!date) return;

    const dayIndex = getDayOfWeek(date);
    const diaSemana = getDayString(dayIndex);
    if (!diaSemana) return;

    handleDiaClick(diaSemana);
  };

  // Função para lidar com o clique no dia da semana
  const handleDiaClick = (diaSemana) => {
    if (!isDiaDisponivelNaLoja(diaSemana)) {
      setError('Este dia não está disponível para agendamento.');
      return;
    }

    setModalConfig({
      isOpen: true,
      diaSemana,
      horarios: horarios[diaSemana]?.horarios || [],
      showReplicacao: false
    });
  };

  // Função para confirmar horários
  const handleHorarioConfirm = ({ horarios: novosHorarios }) => {
    const { diaSemana } = modalConfig;
    if (!diaSemana) return;

    updateCurrentConfig(prev => ({
      ...prev,
      tipo: 'semanal',
      semanal: {
        ...prev.semanal,
        [diaSemana]: {
          ativo: novosHorarios.length > 0,
          horarios: [...novosHorarios]
        }
      }
    }));

    handleModalClose();
  };

  // Função para atualizar a configuração
  const updateCurrentConfig = (updater) => {
    if (typeof onChange === 'function') {
      const newConfig = updater({ semanal: horarios });
      onChange(newConfig.semanal);
    }
  };

  // Memoiza os dias configurados para evitar recálculos
  const diasConfigurados = useMemo(() => {
    return Object.entries(horarios)
      .reduce((acc, [dia, config]) => {
        if (isDiaDisponivelNaLoja(dia) && config.ativo && config.horarios.length > 0) {
          acc.push(dia);
        }
        return acc;
      }, []);
  }, [horarios, storeSettings]);

  // Verifica se deve mostrar replicação
  const verificarReplicacao = (diaSemana) => {
    // Filtra o dia atual dos dias configurados
    return diasConfigurados.length > 1 || 
           (diasConfigurados.length === 1 && diasConfigurados[0] !== diaSemana);
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, diaSemana: null, horarios: [] });
  };

  const handleOpenModal = (diaSemana) => {
    // Verifica se o dia está disponível na loja
    if (!isDiaDisponivelNaLoja(diaSemana)) {
      setError('Este dia não está disponível para agendamento.');
      return;
    }

    setModalConfig({
      isOpen: true,
      diaSemana,
      horarios: horarios[diaSemana]?.horarios || [],
      showReplicacao: verificarReplicacao(diaSemana)
    });
  };

  const isDateActive = (date) => {
    const diaSemana = diasDaSemana[date.getDay()].key;
    const isAtivo = isDiaSemanaAtivo(diaSemana);
    const isFutureDate = isAfter(normalizeDate(date), normalizeDate(new Date()));
    return isAtivo && isFutureDate;
  };

  // Função para verificar se uma data está desabilitada
  const isDateDisabled = (date) => {
    if (!date || !storeSettings) return true;
    
    const dayIndex = getDayOfWeek(date);
    const diaSemana = getDayString(dayIndex);
    if (!diaSemana) return true;

    // Verifica se o dia está disponível na loja
    const diaConfig = storeSettings?.weekDays?.[diaSemana];
    const diaDisponivel = diaConfig?.active !== false && Array.isArray(diaConfig?.slots) && diaConfig.slots.length > 0;

    // Se o dia estiver com hover, não desabilita
    if (hoveredWeekday === diaSemana) return false;

    return !diaDisponivel;
  };

  // Função para formatar os horários de forma padronizada
  const formatHorarios = (horarios) => {
    return horarios
      .sort()
      .map((h, idx) => (
        <span key={h} className="inline-block">
          <span className="text-gray-300">{h}</span>
          {idx < horarios.length - 1 && <span className="text-gray-500 mx-1">•</span>}
        </span>
      ));
  };

  const renderDiaSemana = (dia) => {
    const config = horarios[dia.key];
    const diaConfig = storeSettings?.weekDays?.[dia.key];
    const isDisabled = !diaConfig?.active || !diaConfig?.slots?.length;

    if (isDisabled) return null;

    return (
      <div key={dia.key} className="relative">
        <HorarioCard
          data={new Date()} // A data aqui é apenas para exibição do dia da semana
          horarios={config?.horarios || []}
          onEdit={() => handleDiaClick(dia.key)}
          onDelete={() => {
            updateCurrentConfig(prev => ({
              ...prev,
              semanal: {
                ...prev.semanal,
                [dia.key]: {
                  ativo: false,
                  horarios: []
                }
              }
            }));
          }}
          showDelete={config?.ativo}
          label={dia.label}
          isActive={config?.ativo}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mensagens de Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg animate-fade-in">
          <p className="text-red-200 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="multiple"
          selected={diasAtivos}
          onChange={handleCalendarSelect}
          weekView={true}
          minDate={normalizeDate(new Date())}
          disabledDates={isDateDisabled}
          onDayMouseEnter={handleDayMouseEnter}
          onDayMouseLeave={handleDayMouseLeave}
          hasConfiguredSlots={hasConfiguredSlots}
          getHorariosData={getHorariosData}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white",
          }}
        />
      </div>

      {/* Lista de dias da semana */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-200">
          Dias da semana
        </h3>
        <div className="space-y-2">
          {diasDaSemana.map(dia => renderDiaSemana(dia))}
        </div>
      </div>

      {/* Modal de Horários */}
      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={null}
        diaSemana={modalConfig.diaSemana}
        showReplicacao={false}
        tipoConfiguracao="semanal"
        horariosDisponiveis={modalConfig.diaSemana ? 
          storeSettings?.weekDays?.[modalConfig.diaSemana]?.slots || [] 
          : []
        }
      />
    </div>
  );
}