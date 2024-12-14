import { startOfDay, format, parseISO } from 'date-fns';

// Normaliza uma data para o início do dia no fuso horário local
export const normalizeDate = (date) => {
  if (!date) return null;
  
  // Se já é uma data, retorna uma nova instância com o mesmo dia local
  if (date instanceof Date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }
  
  // Se é string, converte para data local
  const parsedDate = new Date(date);
  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate()
  );
};

// Converte uma data para string no formato YYYY-MM-DD
export const normalizeDateString = (date) => {
  if (!date) return null;
  
  // Normaliza a data para meia-noite no fuso horário local
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) return null;

  // Formata como YYYY-MM-DD
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