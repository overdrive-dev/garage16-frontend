import { useState } from 'react';
import Calendar from '@/components/Calendar';
import HorarioModal from './HorarioModal';

export default function ConfiguracaoPersonalizada({ config, onChange }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    diaId: null,
    horarios: []
  });

  const diasSemana = [
    { id: 'dom', nome: 'Domingo' },
    { id: 'seg', nome: 'Segunda' },
    { id: 'ter', nome: 'Terça' },
    { id: 'qua', nome: 'Quarta' },
    { id: 'qui', nome: 'Quinta' },
    { id: 'sex', nome: 'Sexta' },
    { id: 'sab', nome: 'Sábado' }
  ];

  const toggleDia = (dia) => {
    onChange({
      ...config,
      horarios: {
        ...config.horarios,
        [dia]: {
          ...config.horarios[dia],
          ativo: !config.horarios[dia].ativo,
          horarios: !config.horarios[dia].ativo ? ['09:00'] : []
        }
      }
    });
  };

  const handleOpenModal = (diaId) => {
    setModalConfig({
      isOpen: true,
      diaId,
      horarios: config.horarios[diaId].horarios || []
    });
  };

  const handleHorarioConfirm = (horariosNovos) => {
    if (modalConfig.diaId) {
      onChange({
        ...config,
        horarios: {
          ...config.horarios,
          [modalConfig.diaId]: {
            ...config.horarios[modalConfig.diaId],
            ativo: horariosNovos.length > 0,
            horarios: horariosNovos
          }
        }
      });
    }
    setModalConfig({ isOpen: false, diaId: null, horarios: [] });
  };

  const getHorariosForDate = (date) => {
    const diaSemana = diasSemana.find(d => 
      d.id === date.toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase().replace('.', '')
    );

    if (diaSemana && config.horarios[diaSemana.id].ativo) {
      return config.horarios[diaSemana.id].horarios.join(' - ');
    }

    return 'Indisponível';
  };

  // Calcula a data final com base no número de semanas
  const getDataFinal = () => {
    const dataFinal = new Date();
    dataFinal.setDate(dataFinal.getDate() + (config.numeroSemanas * 7));
    return dataFinal;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna de Configurações */}
      <div className="space-y-6">
        {/* Seleção do número de semanas */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Por quantas semanas você quer repetir este padrão?
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="1"
              max="52"
              value={config.numeroSemanas}
              onChange={(e) => onChange({
                ...config,
                numeroSemanas: parseInt(e.target.value) || 1
              })}
              className="w-24 bg-gray-700 border-gray-600 text-gray-200 rounded-md px-3 py-2"
            />
            <span className="text-gray-400">semanas</span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Este padrão será repetido por {config.numeroSemanas} {config.numeroSemanas === 1 ? 'semana' : 'semanas'}
          </p>
        </div>

        {/* Seleção dos dias e horários */}
        <div>
          <h4 className="text-sm font-medium text-gray-200 mb-4">
            Selecione os dias e horários
          </h4>
          <div className="space-y-4">
            {diasSemana.map(({ id, nome }) => (
              <div key={id} className="flex items-center space-x-4">
                <div className="w-32">
                  <span className="text-gray-200">{nome}</span>
                </div>
                
                {config.horarios[id].ativo ? (
                  <>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(id)}
                        className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 text-left hover:bg-gray-600 transition-colors"
                      >
                        {config.horarios[id].horarios.length > 0 
                          ? config.horarios[id].horarios.join(' - ')
                          : 'Clique para adicionar horários'
                        }
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDia(id)}
                      className="p-2 text-gray-400 hover:text-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleDia(id)}
                    className="text-orange-500 hover:text-orange-400 text-sm"
                  >
                    Adicionar horário
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna do Calendário */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-200 mb-4">
          Visualização da disponibilidade
        </h4>
        <Calendar
          selectedDate={null}
          onChange={() => {}}
          getHorariosForDate={getHorariosForDate}
          disabledDates={[
            // Datas passadas
            ...Array.from({ length: 365 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - i - 1);
              return date;
            }),
            // Datas após o período selecionado
            ...Array.from({ length: 365 }, (_, i) => {
              const date = getDataFinal();
              date.setDate(date.getDate() + i + 1);
              return date;
            })
          ]}
          tileClassName={({ date }) => {
            const diaSemana = diasSemana.find(d => 
              d.id === date.toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase().replace('.', '')
            );
            const isWithinRange = date >= new Date() && date <= getDataFinal();
            const isDisponivel = diaSemana && config.horarios[diaSemana.id].ativo;
            const isPast = date < new Date().setHours(0, 0, 0, 0);
            
            return `
              flex items-center justify-center
              ${isDisponivel && isWithinRange && !isPast ? 'bg-emerald-500/10 hover:bg-emerald-500/20' : ''}
            `;
          }}
        />
      </div>

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, diaId: null, horarios: [] })}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.diaId ? new Date() : null}
      />
    </div>
  );
} 