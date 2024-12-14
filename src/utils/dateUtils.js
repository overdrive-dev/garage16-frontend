import { startOfDay, format, parseISO } from 'date-fns';

// Normaliza uma data para o início do dia no fuso horário local
export const normalizeDate = (date) => {
  if (!date) return null;
  
  let normalizedDate;

  // Se já é uma data, clona para não modificar a original
  if (date instanceof Date) {
    normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  } else {
    // Se é string, primeiro tenta parsear como YYYY-MM-DD
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number);
      normalizedDate = new Date(year, month - 1, day);
    } else {
      // Se não for no formato YYYY-MM-DD, usa o construtor padrão
      const tempDate = new Date(date);
      normalizedDate = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate()
      );
    }
  }

  // Garante que a data está no início do dia no fuso horário local
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
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

// Obtém o dia da semana no formato correto (0 = domingo, 6 = sábado)
export const getDayOfWeek = (date) => {
  if (!date) return null;
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) return null;
  return normalizedDate.getDay();
};

// Converte o índice do dia da semana para a string correta
export const getDayString = (dayIndex) => {
  const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  return days[dayIndex];
};

// Converte uma string de dia para o índice correto
export const getDayIndex = (dayString) => {
  const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  return days.indexOf(dayString);
}; 