'use client'

import { Dialog } from '@headlessui/react'

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmButtonText = 'Confirmar',
  confirmButtonClass = 'bg-orange-500 hover:bg-orange-600'
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-gray-100 mb-4">
            {title}
          </Dialog.Title>

          <p className="text-gray-300 mb-6">
            {message}
          </p>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-md transition-colors ${confirmButtonClass}`}
            >
              {confirmButtonText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 