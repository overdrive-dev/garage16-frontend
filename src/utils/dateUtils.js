import { startOfDay, format, addDays } from 'date-fns';

// Normaliza uma data para o início do dia no fuso horário local
export const normalizeDate = (date) => {
  if (!date) return null;
  const localDate = new Date(date);
  return startOfDay(localDate);
};

// Converte uma data para string no formato YYYY-MM-DD
export const normalizeDateString = (date) => {
  const normalized = normalizeDate(date);
  // Adiciona um dia para compensar o fuso horário na string
  return normalized ? format(addDays(normalized, 1), 'yyyy-MM-dd') : null;
};

// Verifica se uma data é válida
export const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}; 