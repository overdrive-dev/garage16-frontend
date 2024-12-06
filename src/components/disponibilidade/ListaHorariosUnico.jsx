import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ListaHorariosUnico({ datas, onEdit, onRemove }) {
  if (!datas || Object.keys(datas).length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        Nenhuma data selecionada. Clique em uma data no calendário para adicionar horários.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(datas)
        .sort(([a], [b]) => parseISO(a) - parseISO(b))
        .map(([dateKey, config]) => {
          const horarios = Array.isArray(config?.horarios) ? config.horarios : [];
          
          return (
            <div 
              key={dateKey} 
              className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-200">
                  {format(parseISO(dateKey), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h5>
                <button
                  type="button"
                  onClick={() => onRemove(dateKey)}
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
                  onClick={() => onEdit(dateKey)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 text-left hover:bg-gray-600 transition-colors"
                >
                  {horarios.join(' - ')}
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
} 