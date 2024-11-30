import { useState } from 'react';
import Calendar from '@/components/Calendar';
import { format, addDays } from 'date-fns';
import HorarioModal from './HorarioModal';

export default function CalendarioPreview({ config, onChange }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: []
  });

  const getDiaSemana = (date) => {
    const map = {
      'sun': 'dom',
      'mon': 'seg',
      'tue': 'ter',
      'wed': 'qua',
      'thu': 'qui',
      'fri': 'sex',
      'sat': 'sab'
    };
    return map[format(date, 'EEE').toLowerCase()];
  };

  const handleDateClick = (date) => {
    // Só abre o modal se for configuração de data única
    if (config.tipo === 'unica') {
      const dateKey = format(date, 'yyyy-MM-dd');
      setModalConfig({
        isOpen: true,
        dateKey,
        horarios: config.dataUnica[dateKey]?.horarios || []
      });
    }
  };

  const handleHorarioConfirm = (horarios) => {
    if (modalConfig.dateKey) {
      if (horarios.length === 0) {
        // Remove a data se não houver horários
        const { [modalConfig.dateKey]: removed, ...rest } = config.dataUnica;
        onChange({
          ...config,
          dataUnica: rest
        });
      } else {
        // Atualiza os horários da data
        onChange({
          ...config,
          dataUnica: {
            ...config.dataUnica,
            [modalConfig.dateKey]: {
              horarios: horarios
            }
          }
        });
      }
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleModalClose = () => {
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const getHorariosForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const diaSemana = getDiaSemana(date);
    
    switch (config.tipo) {
      case 'unica':
        if (config.dataUnica[dateStr]) {
          return (
            <div>
              <div className="font-medium text-orange-400">
                Clique para editar
              </div>
              <div className="text-gray-300">
                {config.dataUnica[dateStr].horarios.join(' - ')}
              </div>
            </div>
          );
        }
        return 'Clique para adicionar horários';

      case 'semanal':
        if (config.semanal[diaSemana]?.ativo && 
            config.semanal[diaSemana].horarios.length > 0) {
          return config.semanal[diaSemana].horarios.join(' - ');
        }
        break;

      case 'personalizada':
        const dataInicio = new Date();
        dataInicio.setHours(0, 0, 0, 0);
        const dataFim = addDays(dataInicio, config.personalizada.numeroSemanas * 7);
        const isWithinRange = date >= dataInicio && date <= dataFim;

        if (isWithinRange && 
            config.personalizada.horarios[diaSemana]?.ativo &&
            config.personalizada.horarios[diaSemana].horarios.length > 0) {
          return config.personalizada.horarios[diaSemana].horarios.join(' - ');
        }
        break;
    }

    return 'Indisponível';
  };

  const getTileClassName = ({ date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const diaSemana = getDiaSemana(date);
    const isPast = date < new Date().setHours(0, 0, 0, 0);
    let isDisponivel = false;

    switch (config.tipo) {
      case 'unica':
        isDisponivel = !!config.dataUnica[dateStr];
        break;

      case 'semanal':
        isDisponivel = config.semanal[diaSemana]?.ativo && 
                      config.semanal[diaSemana].horarios.length > 0;
        break;

      case 'personalizada':
        const dataInicio = new Date();
        dataInicio.setHours(0, 0, 0, 0);
        const dataFim = addDays(dataInicio, config.personalizada.numeroSemanas * 7);
        const isWithinRange = date >= dataInicio && date <= dataFim;
        
        isDisponivel = isWithinRange && 
                      config.personalizada.horarios[diaSemana]?.ativo &&
                      config.personalizada.horarios[diaSemana].horarios.length > 0;
        break;
    }

    return `
      relative w-full h-full
      ${isDisponivel && !isPast 
        ? 'after:absolute after:inset-1 after:bg-emerald-500/20 after:rounded-full hover:after:bg-emerald-500/30' 
        : ''}
    `;
  };

  const getDisabledDates = () => {
    const disabledDates = [];
    
    for (let i = 1; i <= 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      disabledDates.push(date);
    }

    if (config.tipo === 'personalizada') {
      const dataFim = addDays(new Date(), config.personalizada.numeroSemanas * 7);
      for (let i = 1; i <= 365; i++) {
        const date = new Date(dataFim);
        date.setDate(date.getDate() + i);
        disabledDates.push(date);
      }
    }

    return disabledDates;
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-200">
          Visualização da disponibilidade
        </h4>
        <span className="text-sm text-gray-400">
          {config.tipo === 'unica' && 'Clique nas datas para configurar'}
          {config.tipo === 'semanal' && 'Repete toda semana'}
          {config.tipo === 'personalizada' && `${config.personalizada.numeroSemanas} semana(s)`}
        </span>
      </div>
      
      <Calendar
        selectedDate={null}
        onChange={handleDateClick}
        getHorariosForDate={getHorariosForDate}
        disabledDates={getDisabledDates()}
        tileClassName={getTileClassName}
      />

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.dateKey ? new Date(modalConfig.dateKey) : null}
      />
    </div>
  );
} 