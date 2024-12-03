export const STATUS_AGENDAMENTO = {
  AGENDADO: 'agendado',
  CONFIRMADO: 'confirmado',
  CHECKIN: 'checkin',
  VISITA_CONFIRMADA: 'visita_confirmada',
  ANDAMENTO: 'andamento',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado'
};

// Função auxiliar para criar datas
const createDate = (daysFromNow, time) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${time}:00Z`;
};

// Usuário mockado para testes
const CURRENT_USER = 'Ki0nY4yfm2apORlsm5WaMcWcNce2';

export const agendamentos = [
  // Agendado (aguardando vendedor)
  {
    id: 'agd-1',
    veiculoId: '1', // Kawasaki Z900
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(2, '10:00'),
    horario: '10:00',
    status: STATUS_AGENDAMENTO.AGENDADO,
    checkInComprador: false,
    checkInVendedor: false,
    resultado: null,
    createdAt: createDate(-1, '10:00'),
    updatedAt: createDate(-1, '10:00'),
    observacoes: 'Aguardando confirmação do vendedor'
  },

  // Confirmado (aguardando janela de check-in)
  {
    id: 'agd-2',
    veiculoId: '2', // BMW S1000RR
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(1, '14:00'),
    horario: '14:00',
    status: STATUS_AGENDAMENTO.CONFIRMADO,
    checkInComprador: false,
    checkInVendedor: false,
    resultado: null,
    createdAt: createDate(-2, '11:00'),
    updatedAt: createDate(-2, '11:00'),
    observacoes: 'Vendedor confirmou disponibilidade'
  },

  // Em Check-in (dentro da janela)
  {
    id: 'agd-3',
    veiculoId: '3',
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(0, '15:00'), // Hoje
    horario: '15:00',
    status: STATUS_AGENDAMENTO.CHECKIN,
    checkInComprador: false,
    checkInVendedor: false,
    resultado: null,
    createdAt: createDate(-3, '12:00'),
    updatedAt: createDate(-1, '12:00'),
    observacoes: 'Check-in disponível'
  },

  // Em Check-in (comprador já fez)
  {
    id: 'agd-4',
    veiculoId: '4',
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(0, '16:00'), // Hoje
    horario: '16:00',
    status: STATUS_AGENDAMENTO.CHECKIN,
    checkInComprador: true,
    checkInVendedor: false,
    resultado: null,
    createdAt: createDate(-1, '09:00'),
    updatedAt: createDate(-1, '09:00'),
    observacoes: 'Comprador realizou check-in'
  },

  // Visita Confirmada (ambos fizeram check-in)
  {
    id: 'agd-5',
    veiculoId: '5',
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(0, '17:00'), // Hoje
    horario: '17:00',
    status: STATUS_AGENDAMENTO.VISITA_CONFIRMADA,
    checkInComprador: true,
    checkInVendedor: true,
    resultado: null,
    createdAt: createDate(-2, '15:00'),
    updatedAt: createDate(-1, '16:00'),
    observacoes: 'Visita confirmada por ambas as partes'
  },

  // Em Andamento
  {
    id: 'agd-6',
    veiculoId: '6',
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(0, '11:00'), // Hoje, mais cedo
    horario: '11:00',
    status: STATUS_AGENDAMENTO.ANDAMENTO,
    checkInComprador: true,
    checkInVendedor: true,
    resultado: null,
    createdAt: createDate(-1, '11:00'),
    updatedAt: createDate(0, '11:00'),
    observacoes: 'Visita em andamento'
  },

  // Concluído com sucesso
  {
    id: 'agd-7',
    veiculoId: '7',
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(-1, '14:00'),
    horario: '14:00',
    status: STATUS_AGENDAMENTO.CONCLUIDO,
    checkInComprador: true,
    checkInVendedor: true,
    resultado: 'realizado',
    createdAt: createDate(-2, '10:00'),
    updatedAt: createDate(-1, '16:00'),
    observacoes: 'Visita realizada com sucesso'
  },

  // Cancelado pelo comprador
  {
    id: 'agd-8',
    veiculoId: '8',
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(1, '09:00'),
    horario: '09:00',
    status: STATUS_AGENDAMENTO.CANCELADO,
    checkInComprador: false,
    checkInVendedor: false,
    resultado: 'cancelado',
    motivoCancelamento: 'Surgiu um imprevisto e não poderei comparecer',
    createdAt: createDate(-1, '15:00'),
    updatedAt: createDate(-1, '15:00'),
    observacoes: 'Desmarcado pelo comprador: Surgiu um imprevisto e não poderei comparecer'
  },

  // Cancelado pelo vendedor
  {
    id: 'agd-9',
    veiculoId: '9',
    vendedorId: CURRENT_USER,
    compradorId: CURRENT_USER,
    data: createDate(2, '15:00'),
    horario: '15:00',
    status: STATUS_AGENDAMENTO.CANCELADO,
    checkInComprador: false,
    checkInVendedor: false,
    resultado: 'cancelado',
    motivoCancelamento: 'Veículo já foi vendido',
    createdAt: createDate(-3, '10:00'),
    updatedAt: createDate(-2, '14:00'),
    observacoes: 'Desmarcado pelo vendedor: Veículo já foi vendido'
  }
]; 