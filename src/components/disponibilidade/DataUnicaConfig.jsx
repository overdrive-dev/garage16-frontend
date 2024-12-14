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
      
      // Debug para sábados
      if (date.getDay() === 6) { // 6 = Sábado
        console.log('Debug Sábado:', {
          data: date,
          dateStr,
          disponivel: !!availableSlots[dateStr],
          slots: availableSlots[dateStr]?.slots,
          todosSlots: availableSlots
        });
      }
      
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
    const datasConfiguradas = Object.entries(datas || {})
      .filter(([data, horarios]) => data !== dataAtual && horarios && horarios.length > 0)
      .map(([data]) => data);

    return datasConfiguradas.length > 0;
  };

  const handleListClick = (dateStr) => {
    const horarios = datas?.[dateStr] || [];
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

    // Verifica se a data está disponível
    if (!availableSlots?.[dateStr]) {
      console.log('Data não disponível:', dateStr);
      return;
    }

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: datas[dateStr] || ultimoHorario,
      showReplicacao: verificarReplicacao(dateStr)
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    if (modalConfig.dateKey) {
      const { horarios: horariosNovos, replicar } = horarioData;
      const novasDatas = { ...datas };

      // Verifica se os horários selecionados estão disponíveis
      const horariosDisponiveis = getHorariosDisponiveis(modalConfig.dateKey);
      const horariosValidos = horariosNovos.filter(h => horariosDisponiveis.includes(h));

      if (!horariosValidos.length) {
        // Se não tiver horários válidos, remove a data
        delete novasDatas[modalConfig.dateKey];
      } else {
        // Adiciona os horários válidos
        novasDatas[modalConfig.dateKey] = horariosValidos;
      }

      onChange(novasDatas);
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const selectedDates = Object.keys(datas || {}).map(dateStr => 
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
        {Object.entries(datas || {}).map(([data, horarios]) => (
          <div 
            key={data} 
            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
            onClick={() => handleListClick(data)}
          >
            <div>
              <div className="text-gray-200">
                {format(normalizeDate(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
        ))}
      </div>

      {modalConfig.isOpen && (
        <HorarioModal
          isOpen={modalConfig.isOpen}
          onClose={handleModalClose}
          onConfirm={handleHorarioConfirm}
          data={new Date(modalConfig.dateKey)}
          selectedHorarios={modalConfig.horarios}
          showReplicacao={modalConfig.showReplicacao}
          tipoConfiguracao="unica"
          horariosDisponiveis={getHorariosDisponiveis(modalConfig.dateKey)}
        />
      )}
    </div>
  );
} 