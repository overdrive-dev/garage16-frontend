import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export const toast = {
  success: (message) => useToastStore.getState().addToast(message, 'success'),
  error: (message) => useToastStore.getState().addToast(message, 'error'),
  warning: (message) => useToastStore.getState().addToast(message, 'warning'),
  info: (message) => useToastStore.getState().addToast(message, 'info'),
};

export const useToast = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  return { toasts, removeToast };
}; 