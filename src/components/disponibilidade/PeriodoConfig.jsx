import { useState } from 'react';
import Calendar from '@/components/Calendar';
import { ptBR } from 'date-fns/locale';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import HorarioModal from './HorarioModal';

export default function PeriodoConfig({ 
  selecao,
  setSelecao,
  horarios,
  setHorarios
}) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    data: null,
    horarios: []
  });

  const handleDateSelect = (range) => {
    if (!range) {
      setSelecao({ inicio: null, fim: null });
      return;
    }

    setSelecao({
      inicio: range.from,
      fim: range.to || range.from
    });
  };

  const getDatasIntervalo = () => {
    if (!selecao.inicio || !selecao.fim) return [];
    return eachDayOfInterval({
      start: selecao.inicio,
      end: selecao.fim
    });
  };

  const handleOpenModal = (data) => {
    const dataStr = format(data, 'yyyy-MM-dd');
    setModalConfig({
      isOpen: true,
      data: data,
      horarios: horarios[dataStr] || []
    });
  };

  const handleCloseModal = () => {
    setModalConfig({
      isOpen: false,
      data: null,
      horarios: []
    });
  };

  const handleHorarioConfirm = (horariosConfirmados) => {
    if (!modalConfig.data) return;

    const dataStr = format(modalConfig.data, 'yyyy-MM-dd');
    const novosHorarios = {
      ...horarios,
      [dataStr]: horariosConfirmados
    };
    
    setHorarios(novosHorarios);
    handleCloseModal();
  };

  return (
    <div className="space-y-8">
      {/* Calendário */}
      <div className="bg-gray-800 rounded-lg p-4">
        <Calendar
          mode="range"
          selected={{
            from: selecao.inicio,
            to: selecao.fim
          }}
          onChange={handleDateSelect}
          minDate={startOfDay(new Date())}
          classNames={{
            day_selected: "bg-orange-500 text-white hover:bg-orange-600 font-semibold",
            day_today: "bg-gray-700 text-white",
            day_range_middle: "bg-orange-500/20 hover:bg-orange-500/30",
            day_range_start: "bg-orange-500 text-white rounded-l-full font-semibold",
            day_range_end: "bg-orange-500 text-white rounded-r-full font-semibold"
          }}
          locale={ptBR}
        />
      </div>

      {/* Lista de datas */}
      {selecao.inicio && selecao.fim && (
        <div className="space-y-4">
          {getDatasIntervalo().map((data) => {
            const dataStr = format(data, 'yyyy-MM-dd');
            const horariosData = horarios[dataStr] || [];

            return (
              <div key={dataStr} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-48">
                    <div className="text-gray-200 text-lg font-medium">
                      {format(data, "EEEE", { locale: ptBR })}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {format(data, "dd 'de' MMMM", { locale: ptBR })}
                    </div>
                  </div>
                  
                  {horariosData.length > 0 ? (
                    <>
                      <div className="flex-1">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(data)}
                          className="w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-left text-gray-200"
                        >
                          {horariosData.map((horario, index) => (
                            <span key={index}>
                              {format(new Date(`2000-01-01T${horario.inicio}`), 'HH:mm')}
                              {' - '}
                              {format(new Date(`2000-01-01T${horario.fim}`), 'HH:mm')}
                              {index < horariosData.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const novosHorarios = { ...horarios };
                          delete novosHorarios[dataStr];
                          setHorarios(novosHorarios);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-300 transition-colors ml-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(data)}
                        className="w-full bg-gray-700/50 rounded p-4 hover:bg-gray-700/70 text-center text-gray-400"
                      >
                        Clique para adicionar horários
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.data}
        showReplicacao={false}
        tipoConfiguracao="periodo"
      />
    </div>
  );
} 