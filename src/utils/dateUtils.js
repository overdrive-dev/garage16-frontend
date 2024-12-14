import { startOfDay, format, parseISO } from 'date-fns';

// Normaliza uma data para o início do dia no fuso horário local
export const normalizeDate = (date) => {
  if (!date) return null;
  
  let normalizedDate;

  // Se já é uma data, usa ela diretamente
  if (date instanceof Date) {
    normalizedDate = date;
  } else {
    // Se é string, primeiro tenta parsear como YYYY-MM-DD
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number);
      normalizedDate = new Date(year, month - 1, day);
    } else {
      // Se não for no formato YYYY-MM-DD, usa o construtor padrão
      normalizedDate = new Date(date);
    }
  }

  // Ajusta para meia-noite no fuso horário local usando UTC
  return new Date(
    normalizedDate.getFullYear(),
    normalizedDate.getMonth(),
    normalizedDate.getDate(),
    0, 0, 0, 0
  );
};

// Converte uma data para string no formato YYYY-MM-DD
export const normalizeDateString = (date) => {
  if (!date) return null;
  
  // Normaliza a data para meia-noite no fuso horário local
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) return null;

  // Formata como YYYY-MM-DD usando os componentes locais da data
  const year = normalizedDate.getFullYear();
  const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
  const day = String(normalizedDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Verifica se uma data é válida
export const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}; 