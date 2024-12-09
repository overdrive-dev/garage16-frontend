import { useState, useMemo } from 'react';
import Calendar from '@/components/Calendar';
import { format, isBefore, eachDayOfInterval, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import HorarioModal from './HorarioModal';

export default function PeriodoConfig({ selecao = { inicio: null, fim: null }, setSelecao, horarios = {}, setHorarios }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    data: null,
    horarios: []
  });

  // Normaliza as datas da seleção
  const selecaoNormalizada = useMemo(() => ({
    inicio: selecao.inicio,
    fim: selecao.fim
  }), [selecao.inicio, selecao.fim]);

  // Função para lidar com a seleção de datas
  const handleDateSelect = (range) => {
    if (!range) {
      setSelecao({ inicio: null, fim: null });
      return;
    }

    // Se temos apenas início
    if (range.from && !range.to) {
      setSelecao({ inicio: range.from, fim: null });
      return;
    }

    // Se temos início e fim
    if (range.from && range.to) {
      // Garante que início é sempre a data mais antiga
      if (isBefore(range.to, range.from)) {
        setSelecao({ inicio: range.to, fim: range.from });
      } else {
        setSelecao({ inicio: range.from, fim: range.to });
      }
    }
  };

  // Função para gerar a lista de datas entre início e fim
  const getDatasIntervalo = () => {
    if (!selecaoNormalizada.inicio || !selecaoNormalizada.fim) return [];
    return eachDayOfInterval({
      start: selecaoNormalizada.inicio,
      end: selecaoNormalizada.fim
    });
  };

  const handleOpenModal = (data) => {
    setModalConfig({
      isOpen: true,
      data: new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
      ),
      horarios: horarios[format(data, 'yyyy-MM-dd')] || []
    });
  };

  const handleCloseModal = () => {
    setModalConfig({
      isOpen: false,
      data: null,
      horarios: []
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    if (modalConfig.data) {
      const dataStr = format(modalConfig.data, 'yyyy-MM-dd');
      setHorarios(prev => ({
        ...prev,
        [dataStr]: horarioData.horarios
      }));
    }
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
          minDate={new Date(new Date().setHours(0, 0, 0, 0))}
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
      {selecaoNormalizada.inicio && selecaoNormalizada.fim && (
        <div className="space-y-4">
          {getDatasIntervalo().map((data) => {
            const dataStr = format(data, 'yyyy-MM-dd');
            const horariosData = horarios[dataStr] || [];

            return (
              <div key={dataStr} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenModal(data)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    {horariosData.length > 0 ? 'Editar Horários' : 'Adicionar Horários'}
                  </button>
                </div>

                {/* Lista de horários */}
                {horariosData.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {horariosData.map((horario, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-400"
                      >
                        {format(new Date(`2000-01-01T${horario.inicio}`), 'HH:mm')}
                        {' - '}
                        {format(new Date(`2000-01-01T${horario.fim}`), 'HH:mm')}
                      </div>
                    ))}
                  </div>
                )}
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