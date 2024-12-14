import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';
import Calendar from '@/components/Calendar';
import { TrashIcon } from '@heroicons/react/24/outline';
import { normalizeDate, normalizeDateString } from '@/utils/dateUtils';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';

export default function DataUnicaConfig({ datas = {}, onChange, ultimoHorario = [] }) {
  const { availableSlots } = useDisponibilidade();
  
  // Garantir que estamos trabalhando com o objeto correto de horários
  const horariosConfig = datas?.horarios || {};

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: [],
    showReplicacao: false
  });

  // Memoriza as datas disponíveis para evitar recálculos
  const availableDates = useMemo(() => {
    if (!availableSlots) return [];
    return Object.keys(availableSlots).map(dateStr => normalizeDate(dateStr));
  }, [availableSlots]);

  // Memoriza a função de verificação de disponibilidade
  const isDateDisabled = useMemo(() => {
    return (date) => {
      if (!date || !availableSlots) return true;
      
      // Normaliza a data para o formato YYYY-MM-DD
      const dateStr = normalizeDateString(date);
      
      // Verifica se a data está nos slots disponíveis
      return !availableSlots[dateStr];
    };
  }, [availableSlots]);

  // Log inicial dos slots disponíveis
  useEffect(() => {
    console.log('Slots disponíveis carregados:', availableSlots);
  }, [availableSlots]);

  console.log('Datas disponíveis:', availableDates);

  // Pega os horários disponíveis para uma data
  const getHorariosDisponiveis = (dateStr) => {
    return availableSlots?.[dateStr]?.slots || [];
  };

  const verificarReplicacao = (dataAtual) => {
    const datasConfiguradas = Object.entries(horariosConfig)
      .filter(([data, horarios]) => data !== dataAtual && horarios && horarios.length > 0)
      .map(([data]) => data);

    return datasConfiguradas.length > 0;
  };

  const handleListClick = (dateStr) => {
    const horarios = horariosConfig?.[dateStr] || [];
    const showReplicacao = verificarReplicacao(dateStr);

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios,
      showReplicacao
    });
  };

  const handleCalendarSelect = (dates) => {
    if (!dates) return;

    const datesArray = Array.isArray(dates) ? dates : [dates];
    if (datesArray.length === 0) return;

    const lastDate = datesArray[datesArray.length - 1];
    const dateStr = normalizeDateString(lastDate);

    console.log('[DEBUG] handleCalendarSelect - Datas:', {
      lastDate,
      dateStr,
      lastDateISO: lastDate.toISOString()
    });

    // Verifica se a data está disponível
    if (!availableSlots?.[dateStr]) {
      console.log('Data não disponível:', dateStr);
      return;
    }

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: horariosConfig[dateStr] || ultimoHorario,
      showReplicacao: verificarReplicacao(dateStr)
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    console.log('[DEBUG] handleHorarioConfirm:', {
      modalConfig,
      horarioData
    });

    if (modalConfig.dateKey) {
      const { horarios: horariosNovos, replicar } = horarioData;
      const novasHorarios = { ...horariosConfig };

      // Verifica se os horários selecionados estão disponíveis
      const horariosDisponiveis = getHorariosDisponiveis(modalConfig.dateKey);
      const horariosValidos = horariosNovos.filter(h => horariosDisponiveis.includes(h));

      // Se não tiver horários válidos, remove a data
      if (!horariosValidos.length) {
        delete novasHorarios[modalConfig.dateKey];
      } else {
        // Garante que a data está no formato correto (YYYY-MM-DD)
        const dateKey = modalConfig.dateKey;
        if (dateKey) {
          // Adiciona os horários válidos
          novasHorarios[dateKey] = horariosValidos;
        }
      }

      // Se tem replicação habilitada
      if (replicar) {
        Object.keys(horariosConfig).forEach(data => {
          try {
            const dateStr = normalizeDateString(new Date(data));
            if (dateStr && dateStr !== modalConfig.dateKey) {
              const horariosDisponiveisData = getHorariosDisponiveis(dateStr);
              const horariosValidosData = horariosNovos.filter(h => horariosDisponiveisData.includes(h));
              if (horariosValidosData.length > 0) {
                novasHorarios[dateStr] = horariosValidosData;
              }
            }
          } catch (error) {
            console.error('[DEBUG] Erro ao processar data para replicação:', { data, error });
          }
        });
      }

      console.log('[DEBUG] Nova configuração de horários:', novasHorarios);
      onChange(novasHorarios);
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [], showReplicacao: false });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const selectedDates = Object.keys(horariosConfig).map(dateStr => 
    normalizeDate(dateStr)
  );

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="single"
          selected={selectedDates}
          onChange={handleCalendarSelect}
          minDate={normalizeDate(new Date())}
          disabledDates={isDateDisabled}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white",
          }}
        />
      </div>

      <div className="space-y-2">
        {Object.entries(horariosConfig).map(([data, horarios]) => {
          try {
            // Tenta criar uma data válida
            const dataObj = new Date(data);
            
            // Verifica se a data é válida
            if (isNaN(dataObj.getTime())) {
              console.log('[DEBUG] Data inválida:', data);
              return null;
            }

            return (
              <div 
                key={data} 
                className="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handleListClick(data)}
              >
                <div>
                  <div className="text-gray-200">
                    {format(dataObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <div className="text-sm text-gray-400">
                    {horarios.join(', ')}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleListClick(data);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            );
          } catch (error) {
            console.error('[DEBUG] Erro ao processar data:', { data, error });
            return null;
          }
        })}
      </div>

      {modalConfig.isOpen && (
        <HorarioModal
          isOpen={modalConfig.isOpen}
          onClose={handleModalClose}
          onConfirm={handleHorarioConfirm}
          data={modalConfig.dateKey ? new Date(modalConfig.dateKey) : null}
          selectedHorarios={modalConfig.horarios}
          showReplicacao={modalConfig.showReplicacao}
          tipoConfiguracao="dataUnica"
          horariosDisponiveis={getHorariosDisponiveis(modalConfig.dateKey)}
          diaSemana={modalConfig.dateKey ? ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][new Date(modalConfig.dateKey).getDay()] : null}
          isNewRange={false}
          periodo={null}
        />
      )}
    </div>
  );
} 