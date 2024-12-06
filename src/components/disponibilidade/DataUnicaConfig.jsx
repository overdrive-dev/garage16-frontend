import { useState } from 'react';
import { format, parse, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';
import Calendar from '@/components/Calendar';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function DataUnicaConfig({ datas = {}, onChange }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: []
  });

  const handleDateClick = (date) => {
    // Ajusta para o fuso horário local
    const localDate = addDays(startOfDay(date), 1);
    const dateStr = localDate.toISOString().split('T')[0];
    const horarios = datas?.[dateStr] || [];
    setModalConfig({
      isOpen: true,
      dateKey: dateStr,
      horarios
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    if (modalConfig.dateKey) {
      const { horarios: horariosNovos, replicar } = horarioData;
      
      if (!horariosNovos || horariosNovos.length === 0) {
        const { [modalConfig.dateKey]: removed, ...rest } = datas || {};
        onChange(rest);
      } else {
        // Cria um novo objeto para armazenar todas as datas
        const novasDatas = { ...datas };

        // Adiciona os horários à data atual
        novasDatas[modalConfig.dateKey] = horariosNovos;

        // Se houver replicação e mais de um dia ativo, replica para os outros dias
        if (replicar?.tipo === 'todos') {
          Object.keys(datas || {}).forEach(data => {
            if (data !== modalConfig.dateKey) {
              novasDatas[data] = horariosNovos;
            }
          });
        }

        onChange(novasDatas);
      }
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleCalendarSelect = (dates) => {
    // Converte as datas para o formato correto e mantém os horários existentes
    const newDatas = {};
    
    // Primeiro, copia todas as datas existentes que ainda estão selecionadas
    Object.entries(datas || {}).forEach(([data, horarios]) => {
      const selectedDate = dates.some(date => {
        const localDate = addDays(startOfDay(date), 1);
        return localDate.toISOString().split('T')[0] === data;
      });
      if (selectedDate) {
        newDatas[data] = horarios;
      }
    });

    // Depois, adiciona as novas datas selecionadas
    dates.forEach(date => {
      const localDate = addDays(startOfDay(date), 1);
      const dateStr = localDate.toISOString().split('T')[0];
      if (!newDatas[dateStr]) {
        newDatas[dateStr] = [];
      }
    });

    onChange(newDatas);

    // Se selecionou uma nova data única, abre o modal
    const novasDatas = dates.filter(date => {
      const localDate = addDays(startOfDay(date), 1);
      const dateStr = localDate.toISOString().split('T')[0];
      return !datas[dateStr];
    });

    if (novasDatas.length === 1) {
      handleDateClick(novasDatas[0]);
    }
  };

  // Converte as datas string para objetos Date para o calendário
  const selectedDates = Object.keys(datas || {}).map(dateStr => {
    const date = new Date(dateStr);
    return startOfDay(date);
  });

  const formatHorario = (horario) => {
    if (typeof horario === 'string') {
      return horario;
    }
    return horario?.inicio && horario?.fim ? `${horario.inicio} às ${horario.fim}` : '';
  };

  return (
    <div className="space-y-6">
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onChange={handleCalendarSelect}
          minDate={startOfDay(new Date())}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white",
          }}
        />
      </div>

      {/* Lista de datas */}
      <div className="space-y-4">
        {Object.entries(datas || {}).sort().map(([data, horarios = []]) => (
          <div key={data} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-100">
                  {format(new Date(data), "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-sm text-gray-400">
                  {horarios.length} horário{horarios.length !== 1 ? 's' : ''} configurado{horarios.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  const { [data]: _, ...rest } = datas || {};
                  onChange(rest);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            <button 
              className="w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-left"
              onClick={() => handleDateClick(new Date(data))}
            >
              {horarios.length > 0 ? (
                <div className="text-gray-200">
                  {horarios.map((horario, index) => (
                    <span key={index}>
                      {formatHorario(horario)}
                      {index < horarios.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  Clique para adicionar horários
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.dateKey ? new Date(modalConfig.dateKey) : null}
        showReplicacao={Object.keys(datas || {}).length > 1}
        tipoConfiguracao="unica"
      />
    </div>
  );
} 