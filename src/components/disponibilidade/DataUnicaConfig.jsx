import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';
import Calendar from '@/components/Calendar';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { normalizeDate, normalizeDateString, getDayOfWeek, getDayString, fromFirebaseDate } from '@/utils/dateUtils';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import HorarioCard from './HorarioCard';

export default function DataUnicaConfig() {
  const { 
    currentConfig, 
    updateCurrentConfig, 
    storeSettings,
    hasConfiguredSlots,
    getHorariosData
  } = useDisponibilidade();

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    data: null,
    horarios: [],
    showReplicacao: false
  });

  // Função para verificar se uma data está desabilitada
  const isDateDisabled = (date) => {
    if (!date || !storeSettings) return true;
    
    const dayIndex = getDayOfWeek(date);
    const diaSemana = getDayString(dayIndex);
    if (!diaSemana) return true;

    // Verifica se o dia está disponível na loja
    const diaConfig = storeSettings.weekDays?.[diaSemana];
    return !(diaConfig?.active !== false && Array.isArray(diaConfig?.slots) && diaConfig.slots.length > 0);
  };

  // Função para obter as datas configuradas
  const getDatasConfiguradas = () => {
    if (!currentConfig?.dataUnica?.horarios) return [];
    return Object.keys(currentConfig.dataUnica.horarios)
      .map(dateStr => fromFirebaseDate(dateStr))
      .filter(Boolean);
  };

  // Função para selecionar uma data
  const handleCalendarSelect = (dates) => {
    // Se não receber datas, retorna
    if (!dates || !Array.isArray(dates)) return;

    // Pega a última data selecionada/desselecionada
    const lastDate = dates[dates.length - 1];
    if (!lastDate) return;

    const normalizedDate = normalizeDate(lastDate);
    const diaSemana = getDayString(getDayOfWeek(normalizedDate));
    if (!diaSemana) return;

    // Obtém os horários disponíveis para o dia da semana
    const horariosDisponiveis = storeSettings?.weekDays?.[diaSemana]?.slots || [];
    
    // Obtém os horários já configurados para a data
    const dateStr = normalizeDateString(normalizedDate);
    const horariosConfigurados = currentConfig?.dataUnica?.horarios?.[dateStr] || [];

    setModalConfig({
      isOpen: true,
      data: normalizedDate,
      horarios: horariosConfigurados,
      showReplicacao: false
    });
  };

  // Função para fechar o modal
  const handleModalClose = () => {
    setModalConfig(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Função para confirmar horários
  const handleHorarioConfirm = ({ horarios }) => {
    if (!modalConfig.data) return;

    const dateStr = normalizeDateString(modalConfig.data);
    
    updateCurrentConfig(prev => ({
      ...prev,
      tipo: 'dataUnica',
      dataUnica: {
        ...prev.dataUnica,
        horarios: {
          ...prev.dataUnica?.horarios,
          [dateStr]: horarios
        }
      }
    }));

    handleModalClose();
  };

  return (
    <div className="space-y-6">
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="multiple"
          selected={getDatasConfiguradas()}
          onChange={handleCalendarSelect}
          minDate={normalizeDate(new Date())}
          disabledDates={isDateDisabled}
          hasConfiguredSlots={hasConfiguredSlots}
          getHorariosData={getHorariosData}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white",
          }}
        />
      </div>

      {/* Lista de datas configuradas */}
      <div className="space-y-4">
        <div className="space-y-2">
          {Object.entries(currentConfig?.dataUnica?.horarios || {}).map(([dateStr, horarios]) => {
            const data = fromFirebaseDate(dateStr);
            if (!data || !Array.isArray(horarios)) return null;

            return (
              <HorarioCard
                key={dateStr}
                data={data}
                horarios={horarios}
                onEdit={() => handleCalendarSelect(data)}
                onDelete={() => {
                  updateCurrentConfig(prev => ({
                    ...prev,
                    dataUnica: {
                      ...prev.dataUnica,
                      horarios: Object.fromEntries(
                        Object.entries(prev.dataUnica?.horarios || {})
                          .filter(([key]) => key !== dateStr)
                      )
                    }
                  }));
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Modal de Horários */}
      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.data}
        showReplicacao={modalConfig.showReplicacao}
        tipoConfiguracao="dataUnica"
        horariosDisponiveis={modalConfig.data ? 
          storeSettings?.weekDays?.[getDayString(getDayOfWeek(modalConfig.data))]?.slots || [] 
          : []
        }
      />
    </div>
  );
} 