import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarioPeriodo from './calendarios/CalendarioPeriodo';
import HorarioModal from './HorarioModal';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function PeriodoConfig({ periodo, onChange }) {
  const { storeSettings } = useDisponibilidade();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    horarios: []
  });

  console.log('[PeriodoConfig] Props recebidas:', {
    periodo,
    periodoTipo: typeof periodo,
    dataInicio: periodo?.dataInicio,
    dataFim: periodo?.dataFim,
    horarios: periodo?.horarios
  });

  const handlePeriodoChange = (range) => {
    console.log('[PeriodoConfig] Mudança no período:', range);
    onChange({
      ...periodo,
      dataInicio: range.inicio,
      dataFim: range.fim,
      horarios: periodo?.horarios || {}
    });
  };

  const handleHorarioConfirm = (horarioData) => {
    console.log('[PeriodoConfig] Confirmação de horários:', horarioData);
    onChange({
      ...periodo,
      horarios: {
        ...periodo.horarios,
        [modalConfig.data]: horarioData.horarios
      }
    });
    setModalConfig({ isOpen: false, horarios: [] });
  };

  // Função para formatar os horários de forma padronizada
  const formatHorarios = (horarios) => {
    if (!Array.isArray(horarios)) return null;
    return horarios
      .sort()
      .map((h, idx) => (
        <span key={h} className="inline-block">
          <span className="text-gray-300">{h}</span>
          {idx < horarios.length - 1 && <span className="text-gray-500 mx-1">•</span>}
        </span>
      ));
  };

  // Função para ordenar as datas
  const getDatasOrdenadas = () => {
    if (!periodo?.horarios) return [];
    return Object.entries(periodo.horarios)
      .map(([data, horarios]) => ({
        data,
        horarios
      }))
      .sort((a, b) => new Date(a.data) - new Date(b.data));
  };

  return (
    <div className="space-y-6">
      <CalendarioPeriodo
        selected={{
          inicio: periodo?.dataInicio || null,
          fim: periodo?.dataFim || null
        }}
        onChange={handlePeriodoChange}
      />

      {/* Lista de datas configuradas */}
      <div className="space-y-2">
        {getDatasOrdenadas().map(({ data, horarios }) => (
          <div
            key={data}
            className="bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-200 font-medium">
                    {format(new Date(data), "EEEE, dd 'de' MMMM", { locale: ptBR })}
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
                onClick={() => {
                  const novosHorarios = { ...periodo.horarios };
                  delete novosHorarios[data];
                  onChange({
                    ...periodo,
                    horarios: novosHorarios
                  });
                }}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <HorarioModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, horarios: [] })}
        onConfirm={handleHorarioConfirm}
        selectedHorarios={modalConfig.horarios}
        data={modalConfig.data}
        tipoConfiguracao="periodo"
        horariosDisponiveis={modalConfig.horariosDisponiveis}
        isNewRange={true}
        periodo={{
          from: periodo?.dataInicio ? new Date(periodo.dataInicio) : null,
          to: periodo?.dataFim ? new Date(periodo.dataFim) : null
        }}
      />
    </div>
  );
} 