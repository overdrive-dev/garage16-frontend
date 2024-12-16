import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function HorarioCard({ 
  data, 
  horarios = [], 
  onEdit, 
  onDelete,
  showDelete = true,
  label,
  isActive
}) {
  return (
    <div 
      onClick={onEdit}
      className="group relative p-4 bg-gray-800 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer w-full"
    >
      <div className="flex items-center justify-between">
        {/* Título e Status */}
        <div>
          {label ? (
            <div className="flex flex-col">
              <h4 className="text-gray-200 font-medium">{label}</h4>
              {isActive !== undefined && (
                <span className={`text-sm ${isActive ? 'text-green-500' : 'text-gray-400'}`}>
                  {isActive ? 'Ativo' : 'Inativo'}
                </span>
              )}
            </div>
          ) : (
            <h4 className="text-gray-200 font-medium">
              {format(data, "dd 'de' MMMM", { locale: ptBR })}
            </h4>
          )}
        </div>

        {/* Horários e Botão */}
        <div className="flex items-center gap-4">
          <div className="flex flex-wrap gap-2 justify-end">
            {horarios.length > 0 ? (
              horarios.map(horario => (
                <span
                  key={horario}
                  className="px-2 py-1 text-sm bg-gray-700 text-gray-300 rounded"
                >
                  {horario}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">
                Nenhum horário configurado
              </span>
            )}
          </div>

          {/* Botão de excluir */}
          {showDelete && horarios.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-gray-400 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 