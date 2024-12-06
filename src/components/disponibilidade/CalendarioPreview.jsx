import { useState } from 'react';
import Calendar from '@/components/Calendar';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CalendarioPreview({ config, onChange, tipoConfiguracao }) {
  if (!config) return null;

  const renderPreview = () => {
    switch (tipoConfiguracao) {
      case 'unica':
        return (
          <Calendar
            mode="multiple"
            selected={Object.keys(config.dataUnica?.horarios || {}).map(date => new Date(date))}
            minDate={new Date()}
            classNames={{
              day_selected: "bg-orange-500 text-white hover:bg-orange-600",
              day_today: "bg-gray-700 text-white",
            }}
          />
        );

      case 'semanal':
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

        return (
          <Calendar
            mode="multiple"
            selected={Object.entries(config.semanal || {})
              .filter(([_, config]) => config?.ativo)
              .map(([dia]) => {
                const date = new Date();
                date.setDate(date.getDate() + (getDayIndex(dia) - date.getDay()));
                return date;
              })}
            classNames={{
              day_selected: "bg-orange-500 text-white hover:bg-orange-600",
              day_today: "bg-gray-700 text-white",
            }}
          />
        );

      case 'faixaHorario':
        return (
          <Calendar
            mode="range"
            selected={{
              from: config.faixaHorario?.dataInicio ? new Date(config.faixaHorario.dataInicio) : null,
              to: config.faixaHorario?.dataFim ? new Date(config.faixaHorario.dataFim) : null
            }}
            minDate={new Date()}
            classNames={{
              day_selected: "bg-orange-500 text-white hover:bg-orange-600",
              day_today: "bg-gray-700 text-white",
              day_range_middle: "bg-orange-500/20",
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-200">
          Visualização da disponibilidade
        </h4>
      </div>
      {renderPreview()}
    </div>
  );
} 