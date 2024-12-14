import { startOfDay, format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Constantes
export const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

// Converte uma data para o formato do Firebase (YYYY-MM-DD)
export const toFirebaseDate = (date) => {
  if (!date) return null;
  
  try {
    // Se já está no formato correto, retorna
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // Converte para Date e normaliza
    const dateObj = startOfDay(typeof date === 'string' ? parseISO(date) : date);
    if (!isValid(dateObj)) return null;

    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Erro ao converter para formato Firebase:', error);
    return null;
  }
};

// Converte uma data do Firebase para objeto Date
export const fromFirebaseDate = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    // Valida o formato
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;

    const date = startOfDay(parseISO(dateStr));
    if (!isValid(date)) return null;

    return date;
  } catch (error) {
    console.error('Erro ao converter do formato Firebase:', error);
    return null;
  }
};

// Normaliza uma data para o início do dia
export const normalizeDate = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = startOfDay(typeof date === 'string' ? parseISO(date) : date);
    if (!isValid(dateObj)) return null;
    return dateObj;
  } catch (error) {
    console.error('Erro ao normalizar data:', error);
    return null;
  }
};

// Converte uma data para string no formato YYYY-MM-DD
export const normalizeDateString = (date) => {
  return toFirebaseDate(date);
};

// Verifica se uma data é válida
export const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch {
    return false;
  }
};

// Obtém o dia da semana (0 = domingo, 6 = sábado)
export const getDayOfWeek = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = normalizeDate(date);
    if (!dateObj) return null;
    return dateObj.getDay();
  } catch (error) {
    console.error('Erro ao obter dia da semana:', error);
    return null;
  }
};

// Converte o índice do dia para a string correta
export const getDayString = (dayIndex) => {
  if (dayIndex === null || dayIndex === undefined || dayIndex < 0 || dayIndex > 6) return null;
  return DIAS_SEMANA[dayIndex];
};

// Converte uma string de dia para o índice correto
export const getDayIndex = (dayString) => {
  return DIAS_SEMANA.indexOf(dayString);
};

// Formata uma data para exibição
export const formatDateDisplay = (date, formatStr = "dd/MM/yyyy") => {
  if (!date) return '';
  
  try {
    const dateObj = normalizeDate(date);
    if (!dateObj) return '';
    return format(dateObj, formatStr, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}; 