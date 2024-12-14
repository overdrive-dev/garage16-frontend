import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';
import Calendar from '@/components/Calendar';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { normalizeDate, normalizeDateString } from '@/utils/dateUtils';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';

export default function DataUnicaConfig({ datas = {}, onChange, ultimoHorario = [] }) {
  const { availableSlots, storeSettings } = useDisponibilidade();
  
  // Log inicial dos props recebidos
  console.log('[DataUnicaConfig] Props iniciais:', {
    datasRecebidas: datas,
    ultimoHorarioRecebido: ultimoHorario,
    availableSlots: availableSlots?.slots ? Object.keys(availableSlots.slots).length : 0,
    storeSettingsPresente: !!storeSettings
  });
  
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
    if (!availableSlots?.slots) return [];
    return Object.keys(availableSlots.slots).map(dateStr => normalizeDate(dateStr));
  }, [availableSlots]);

  // Memoriza a função de verificação de disponibilidade
  const isDateDisabled = useMemo(() => {
    return (date) => {
      if (!date) return true;
      
      // Verifica se a data tem slots disponíveis na loja
      const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
      const slotsLoja = storeSettings?.weekDays?.[diaSemana]?.slots || [];
      
      // Verifica se a data tem slots específicos
      const dateStr = normalizeDateString(date);
      const slotsData = availableSlots?.slots?.[dateStr] || [];
      
      // A data está habilitada se tiver slots da loja OU slots específicos
      return slotsLoja.length === 0 && slotsData.length === 0;
    };
  }, [availableSlots, storeSettings]);

  // Pega os horários disponíveis para uma data
  const getHorariosDisponiveis = (dateStr) => {
    if (!dateStr) return [];
    const date = normalizeDate(dateStr);
    const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
    return storeSettings?.weekDays?.[diaSemana]?.slots || [];
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
    const date = normalizeDate(dateStr);
    const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
    
    // Pega os slots disponíveis da loja e da data específica
    const slotsLoja = storeSettings?.weekDays?.[diaSemana]?.slots || [];
    const slotsData = availableSlots?.slots?.[dateStr] || [];
    const horariosDisponiveis = Array.from(new Set([...slotsLoja, ...slotsData])).sort();

    console.log('[DataUnicaConfig] Clique na lista:', {
      dateStr,
      diaSemana,
      slotsLoja,
      slotsData,
      horariosDisponiveis,
      horariosSelecionados: horarios,
      showReplicacao,
      storeSettings: !!storeSettings
    });

    // Se não houver horários disponíveis, não abre o modal
    if (horariosDisponiveis.length === 0) {
      console.log('[DataUnicaConfig] Data sem horários disponíveis:', dateStr);
      return;
    }

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios,
      horariosDisponiveis,
      showReplicacao
    });
  };

  const handleCalendarSelect = (date) => {
    if (!date) {
      console.log('[DataUnicaConfig] Tentativa de seleção com data nula');
      return;
    }

    // Normaliza a data selecionada
    const normalizedDate = normalizeDate(date);
    const dateStr = normalizeDateString(normalizedDate);
    const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][normalizedDate.getDay()];

    // Pega os slots disponíveis da loja e da data específica
    const slotsLoja = storeSettings?.weekDays?.[diaSemana]?.slots || [];
    const slotsData = availableSlots?.slots?.[dateStr] || [];
    const horariosDisponiveis = Array.from(new Set([...slotsLoja, ...slotsData])).sort();

    console.log('[DataUnicaConfig] Seleção de data:', {
      dataOriginal: date.toLocaleString('pt-BR'),
      dataNormalizada: normalizedDate.toLocaleString('pt-BR'),
      dateStr,
      diaSemana,
      slotsLoja,
      slotsData,
      horariosDisponiveis,
      storeSettings: !!storeSettings
    });

    // Se não houver horários disponíveis, não abre o modal
    if (horariosDisponiveis.length === 0) {
      console.log('[DataUnicaConfig] Data sem horários disponíveis:', dateStr);
      return;
    }

    // Verifica se deve mostrar a opção de replicação
    const showReplicacao = verificarReplicacao(dateStr);

    console.log('[DataUnicaConfig] Abrindo modal:', {
      dateStr,
      horariosDisponiveis,
      horariosSelecionados: horariosConfig[dateStr] || ultimoHorario,
      showReplicacao
    });

    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios: horariosConfig[dateStr] || ultimoHorario,
      horariosDisponiveis,
      showReplicacao
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    console.log('[DataUnicaConfig] Confirmação de horários:', {
      dateKey: modalConfig.dateKey,
      horariosSelecionados: horarioData.horarios,
      replicar: horarioData.replicar
    });

    if (modalConfig.dateKey) {
      const { horarios: horariosNovos, replicar } = horarioData;
      const novasHorarios = { ...horariosConfig };

      // Verifica se os horários selecionados estão disponíveis
      const horariosDisponiveis = getHorariosDisponiveis(modalConfig.dateKey);
      const horariosValidos = horariosNovos.filter(h => horariosDisponiveis.includes(h));

      // Se não tiver horários válidos, remove a data
      if (!horariosValidos.length) {
        console.log('[DataUnicaConfig] Removendo data por não ter horários válidos:', modalConfig.dateKey);
        delete novasHorarios[modalConfig.dateKey];
      } else {
        // Adiciona os horários válidos
        novasHorarios[modalConfig.dateKey] = horariosValidos.sort();
      }

      // Se tem replicação habilitada
      if (replicar) {
        console.log('[DataUnicaConfig] Iniciando replicação de horários');
        
        // Pega todas as datas configuradas
        const datasConfiguradas = Object.keys(horariosConfig)
          .filter(data => data !== modalConfig.dateKey)
          .map(data => normalizeDate(data))
          .filter(Boolean);

        // Para cada data configurada
        datasConfiguradas.forEach(dataObj => {
          const dateStr = normalizeDateString(dataObj);
          const horariosDisponiveisData = getHorariosDisponiveis(dateStr);
          const horariosValidosData = horariosNovos.filter(h => horariosDisponiveisData.includes(h));

          if (horariosValidosData.length > 0) {
            novasHorarios[dateStr] = horariosValidosData.sort();
          }
        });
      }

      console.log('[DataUnicaConfig] Configuração final:', {
        antes: horariosConfig,
        depois: novasHorarios
      });

      onChange(novasHorarios);
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [], showReplicacao: false });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  // Memoriza as datas selecionadas
  const selectedDates = useMemo(() => {
    if (!datas?.horarios) return [];
    return Object.keys(datas.horarios)
      .map(dateStr => normalizeDate(dateStr))
      .filter(Boolean);
  }, [datas?.horarios]);

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

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="multiple"
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
        {Object.entries(horariosConfig)
          .sort(([dataA], [dataB]) => normalizeDate(dataA) - normalizeDate(dataB))
          .map(([data, horarios]) => {
            const dataObj = normalizeDate(data);
            if (!dataObj) return null;

            return (
              <div 
                key={data} 
                className="bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-700/50 cursor-pointer"
                onClick={() => handleListClick(data)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-200 font-medium">
                        {format(dataObj, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </span>
                      <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                        {horarios.length} horário{horarios.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm mt-1 truncate">
                      {formatHorarios(horarios)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const novasHorarios = { ...horariosConfig };
                      delete novasHorarios[data];
                      onChange(novasHorarios);
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {modalConfig.isOpen && (
        <HorarioModal
          isOpen={modalConfig.isOpen}
          onClose={handleModalClose}
          onConfirm={handleHorarioConfirm}
          data={modalConfig.dateKey ? normalizeDate(modalConfig.dateKey) : null}
          selectedHorarios={modalConfig.horarios}
          showReplicacao={modalConfig.showReplicacao}
          tipoConfiguracao="dataUnica"
          horariosDisponiveis={modalConfig.horariosDisponiveis}
          diaSemana={modalConfig.dateKey ? ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][normalizeDate(modalConfig.dateKey).getDay()] : null}
          isNewRange={false}
          periodo={null}
        />
      )}
    </div>
  );
} 