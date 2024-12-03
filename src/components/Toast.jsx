import { useState, useEffect, Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const TOAST_TYPES = {
  success: {
    bg: 'bg-green-600',
    duration: 3000,
    icon: CheckCircleIcon
  },
  error: {
    bg: 'bg-red-600',
    duration: 5000,
    icon: ExclamationCircleIcon
  },
  warning: {
    bg: 'bg-yellow-600',
    duration: 4000,
    icon: ExclamationTriangleIcon
  },
  info: {
    bg: 'bg-blue-600',
    duration: 4000,
    icon: InformationCircleIcon
  }
};

export default function Toast({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const duration = TOAST_TYPES[type].duration;
  const updateInterval = 10;
  const Icon = TOAST_TYPES[type].icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (updateInterval / duration * 100);
        return newProgress > 0 ? newProgress : 0;
      });
    }, updateInterval);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [duration, onClose]);

  return (
    <Transition
      show={isVisible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div 
        className={`${TOAST_TYPES[type].bg} text-white px-4 py-3 rounded-lg shadow-lg z-50 min-w-[300px] overflow-hidden`}
        role="alert"
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{message}</span>
          <button 
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div 
            className="h-full bg-white/30 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Transition>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
} 