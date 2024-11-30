import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';

export default function DataUnicaConfig({ datas, onChange }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    dateKey: null,
    horarios: []
  });

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
    setModalConfig({ isOpen: false, dateKey: null, horarios: [] });
  };

  return (
    <div className="space-y-4">
      {/* Lista de Datas Selecionadas */}
      {Object.entries(datas).length === 0 ? (
        <p className="text-gray-400 text-sm">
          Nenhuma data selecionada. Clique em uma data para adicionar horários.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(datas)
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
            ))}
        </div>
      )}

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