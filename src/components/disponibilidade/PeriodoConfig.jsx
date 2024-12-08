import { useState } from 'react';
import HorarioModal from './HorarioModal';
import Calendar from '../Calendar';
import { format, isAfter, startOfDay, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function PeriodoConfig({ horarios, onChange, datasDisponiveis = [] }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    periodo: null,
    horarios: []
  });

  // Verifica se uma data está disponível para configuração
  const isDataDisponivel = (date) => {
    if (!datasDisponiveis.length) return true;
    
    return datasDisponiveis.some(dataDisp => {
      const dataDispDate = new Date(dataDisp);
      return date.getDate() === dataDispDate.getDate() &&
             date.getMonth() === dataDispDate.getMonth() &&
             date.getFullYear() === dataDispDate.getFullYear();
    });
  };

  const handleCalendarSelect = (dates) => {
    console.log('\n=== handleCalendarSelect ===');
    console.log('Datas selecionadas:', dates);
    
    if (!dates?.from) return;
    
    const { from, to } = dates;
    if (!isDataDisponivel(from)) {
      console.log('Data inicial não disponível:', from.toISOString().split('T')[0]);
      return;
    }

    if (to && !isDataDisponivel(to)) {
      console.log('Data final não disponível:', to.toISOString().split('T')[0]);
      return;
    }

    handleOpenModal(dates);
  };

  const handleHorarioConfirm = (horarioData) => {
    console.log('\n=== handleHorarioConfirm ===');
    console.log('Dados recebidos:', horarioData);
    console.log('Estado atual:', modalConfig);
    
    if (modalConfig.periodo) {
      const { horarios: horariosNovos } = horarioData;
      const { from, to } = modalConfig.periodo;
      
      // Se está removendo horários
      if (horariosNovos.length === 0) {
        onChange({});
      } else {
        // Cria um objeto com os horários para o período
        const novoHorarios = {
          from,
          to: to || from,
          horarios: horariosNovos
        };

        onChange(novoHorarios);
      }
    }
    console.log('===================\n');
    setModalConfig({ isOpen: false, periodo: null, horarios: [] });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, periodo: null, horarios: [] });
  };

  const handleOpenModal = (periodo) => {
    setModalConfig({
      isOpen: true,
      periodo,
      horarios: horarios.horarios || [],
      showReplicacao: false // Não precisa de replicação no modo período
    });
  };

  return (
    <div className="space-y-8">
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="range"
          selected={horarios.from ? { from: horarios.from, to: horarios.to || horarios.from } : null}
          onChange={handleCalendarSelect}
          minDate={startOfDay(new Date())}
          disabledDates={datasDisponiveis.length > 0 ? 
            (date) => !isDataDisponivel(date) 
            : undefined
          }
        />
      </div>

      {/* Período selecionado */}
      {horarios.from && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <div className="text-gray-200 text-lg font-medium">
                {format(horarios.from, "dd/MM/yyyy", { locale: ptBR })}
                {horarios.to && horarios.to !== horarios.from && (
                  <> até {format(horarios.to, "dd/MM/yyyy", { locale: ptBR })}</>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <button
                type="button"
                onClick={() => handleOpenModal({ from: horarios.from, to: horarios.to })}
                className="w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-left text-gray-200"
              >
                {horarios.horarios?.join(' - ')}
              </button>
            </div>
            <button
              type="button"
              onClick={() => onChange({})}
              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de horários */}
      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        horarios={modalConfig.horarios}
        showReplicacao={modalConfig.showReplicacao}
      />
    </div>
  );
} 