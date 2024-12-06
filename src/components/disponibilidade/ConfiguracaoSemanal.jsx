import { useState } from 'react';
import { format, parse, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Calendar from '@/components/Calendar';
import HorarioModal from './HorarioModal';

const diasSemana = {
  dom: 'Domingo',
  seg: 'Segunda-feira',
  ter: 'Terça-feira',
  qua: 'Quarta-feira',
  qui: 'Quinta-feira',
  sex: 'Sexta-feira',
  sab: 'Sábado'
};

const getDayIndex = (dia) => {
  const indices = {
    dom: 0,
    seg: 1,
    ter: 2,
    qua: 3,
    qui: 4,
    sex: 5,
    sab: 6
  };
  return indices[dia];
};

export default function ConfiguracaoSemanal({ horarios = {}, onChange }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dia: null,
    horarios: []
  });

  const handleDiaClick = (dia) => {
    setModalConfig({
      isOpen: true,
      dia,
      horarios: horarios[dia]?.horarios || []
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    if (modalConfig.dia) {
      const { horarios: horariosNovos } = horarioData;
      
      onChange({
        ...horarios,
        [modalConfig.dia]: {
          horarios: horariosNovos,
          ativo: horariosNovos.length > 0
        }
      });
    }
    setModalConfig({ isOpen: false, dia: null, horarios: [] });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dia: null, horarios: [] });
  };

  const handleCalendarSelect = (dates) => {
    const newHorarios = { ...horarios };
    
    // Primeiro, garante que todos os dias existem
    Object.keys(diasSemana).forEach(dia => {
      if (!newHorarios[dia]) {
        newHorarios[dia] = {
          horarios: [],
          ativo: false
        };
      }
    });

    // Depois, abre o modal para o dia selecionado
    const dayIndex = dates[dates.length - 1].getDay();
    const dia = Object.keys(diasSemana)[dayIndex];
    handleDiaClick(dia);
  };

  // Prepara as datas selecionadas para o calendário
  const selectedDates = Object.entries(horarios)
    .filter(([_, config]) => config.horarios?.length > 0)
    .map(([dia]) => {
      const date = new Date();
      const dayIndex = getDayIndex(dia);
      const currentDayIndex = date.getDay();
      const daysToAdd = (dayIndex - currentDayIndex + 7) % 7;
      return startOfDay(addDays(date, daysToAdd));
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
          weekView={true}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600",
            day_today: "bg-gray-700 text-white",
          }}
        />
      </div>

      {/* Lista de dias */}
      <div className="space-y-4">
        {Object.entries(horarios).map(([dia, config = { horarios: [] }]) => (
          <div key={dia} className={`bg-gray-800 rounded-lg p-4 ${!config.horarios?.length && 'opacity-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-100">
                  {diasSemana[dia]}
                </h3>
                <p className="text-sm text-gray-400">
                  {config.horarios?.length || 0} horário{(config.horarios?.length || 0) !== 1 ? 's' : ''} configurado{(config.horarios?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button 
              className="w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-left"
              onClick={() => handleDiaClick(dia)}
            >
              {config.horarios?.length > 0 ? (
                <div className="text-gray-200">
                  {config.horarios.map((horario, index) => (
                    <span key={index}>
                      {formatHorario(horario)}
                      {index < config.horarios.length - 1 && ', '}
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
        data={modalConfig.dia ? new Date() : null}
        showReplicacao={false}
        tipoConfiguracao="semanal"
      />
    </div>
  );
} 