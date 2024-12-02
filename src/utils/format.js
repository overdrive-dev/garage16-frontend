export function formatCurrency(value) {
  if (!value) return '';
  
  // Converte para número e formata
  const number = parseInt(value.toString().replace(/\D/g, '')) / 100;
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function parseCurrency(value) {
  return value ? value.toString().replace(/\D/g, '') : '';
} 