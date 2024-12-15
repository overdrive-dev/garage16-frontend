import React from 'react';

export default function ResetPeriodoModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  shouldClearHorarios, 
  onClearHorariosChange 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 space-y-4">
        <h3 className="text-lg font-medium text-gray-200">
          Deseja resetar o período selecionado?
        </h3>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="clearHorarios"
            checked={shouldClearHorarios}
            onChange={(e) => onClearHorariosChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
          />
          <label htmlFor="clearHorarios" className="text-gray-300 text-sm">
            Limpar também os horários configurados
          </label>
        </div>

        <p className="text-sm text-gray-400">
          Nota: Esta ação permitirá selecionar um novo período.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
} 