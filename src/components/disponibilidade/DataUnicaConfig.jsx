import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import { format, addDays, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';

export default function DataUnicaConfig({ datas, onChange }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: []
  });

  // Encontra o próximo dia útil
  const getProximoDiaUtil = () => {
    let data = new Date();
    data.setHours(0, 0, 0, 0);
    
    // Avança até encontrar um dia útil
    while (isWeekend(data)) {
      data = addDays(data, 1);
    }
    
    return data;
  };

  // Seleciona o próximo dia útil ao montar o componente
  useEffect(() => {
    if (Object.keys(datas).length === 0) {
      const proximoDiaUtil = getProximoDiaUtil();
      const dateKey = format(proximoDiaUtil, 'yyyy-MM-dd');
      
      onChange({
        [dateKey]: {
          horarios: ['09:00']
        }
      });
    }
  }, []);

  const handleDateSelect = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    
    // Se a data já existe, abre o modal com os horários dela
    if (datas[dateKey]) {
      setModalConfig({
        isOpen: true,
        dateKey,
        horarios: datas[dateKey].horarios
      });
    } 
    // Se não existe, abre o modal para selecionar horários
    else {
      setModalConfig({
        isOpen: true,
        dateKey,
        horarios: ['09:00'] // Começa com um horário padrão selecionado
      });
    }
  };

  const handleOpenModal = (dateKey) => {
    setModalConfig({
      isOpen: true,
      dateKey,
      horarios: datas[dateKey].horarios
    });
  };

  const handleHorarioConfirm = (horarios) => {
    if (modalConfig.dateKey) {
      if (horarios.length === 0) {
        // Se não há horários, remove a data completamente
        const { [modalConfig.dateKey]: removed, ...rest } = datas;
        onChange(rest);
      } else {
        // Se há horários, atualiza normalmente
        onChange({
          ...datas,
          [modalConfig.dateKey]: {
            horarios: horarios
          }
        });
      }
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const handleModalClose = () => {
    // Se estava adicionando uma nova data (não existia antes), não faz nada
    if (modalConfig.dateKey && !datas[modalConfig.dateKey]) {
      // Não adiciona a data se cancelar
    }
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  const getHorariosForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    if (datas[dateKey]) {
      return datas[dateKey].horarios.join(' - ');
    }
    return 'Clique para adicionar horários';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna das Datas Selecionadas */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-200">
          Datas selecionadas
        </h4>

        {Object.entries(datas).length === 0 ? (
          <p className="text-gray-400 text-sm">
            Selecione uma data no calendário para adicionar horários
          </p>
        ) : (
          Object.entries(datas)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([dateKey, { horarios }]) => (
              <div 
                key={dateKey} 
                className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-200">
                    {format(new Date(dateKey), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      const { [dateKey]: removed, ...rest } = datas;
                      onChange(rest);
                    }}
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleOpenModal(dateKey)}
                    className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 text-left hover:bg-gray-600 transition-colors"
                  >
                    {horarios.length > 0 
                      ? horarios.join(' - ')
                      : 'Clique para adicionar horários'
                    }
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Coluna do Calendário */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-200 mb-4">
          Selecione as datas
        </h4>
        <Calendar
          selectedDate={null}
          onChange={handleDateSelect}
          getHorariosForDate={getHorariosForDate}
          disabledDates={[
            ...Array.from({ length: 365 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - i - 1);
              return date;
            })
          ]}
          tileClassName={({ date }) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const isSelected = datas[dateKey];
            const isPast = date < new Date().setHours(0, 0, 0, 0);
            
            return `
              flex items-center justify-center
              ${isSelected && !isPast ? 'bg-emerald-500/10 hover:bg-emerald-500/20' : ''}
            `;
          }}
        />
      </div>

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