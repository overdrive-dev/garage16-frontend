export const STATUS_AGENDAMENTO = {
  AGENDADO: 'agendado',
  AGUARDANDO_DISPONIBILIDADE: 'aguardando_disponibilidade',
  AGUARDANDO_CHECKIN: 'aguardando_checkin',
  CONFIRMADO: 'confirmado',
  ACONTECENDO: 'acontecendo',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado'
};

// Função auxiliar para criar datas
const createDate = (daysFromNow, time) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${time}:00Z`;
};

// Usuário mockado para testes - usando ID real do Firebase
const CURRENT_USER = 'Ki0nY4yfm2apORlsm5WaMcWcNce2';

export const agendamentos = [
  // Agendamentos como comprador
  {
    id: 'agd-1',
    veiculoId: '1', // Kawasaki Z900
    vendedorId: 'user123',
    compradorId: CURRENT_USER, // Você como comprador
    data: createDate(2, '10:00'),
    horario: '10:00',
    status: STATUS_AGENDAMENTO.AGENDADO,
    createdAt: createDate(-1, '10:00'),
    updatedAt: createDate(-1, '10:00'),
    observacoes: 'Aguardando confirmação do vendedor'
  },
  {
    id: 'agd-2',
    veiculoId: '2', // BMW S1000RR
    vendedorId: CURRENT_USER, // Você como vendedor
    compradorId: 'user789',
    data: createDate(1, '14:00'),
    horario: '14:00',
    status: STATUS_AGENDAMENTO.AGUARDANDO_DISPONIBILIDADE,
    createdAt: createDate(-2, '11:00'),
    updatedAt: createDate(-2, '11:00'),
    observacoes: 'Vendedor precisa confirmar disponibilidade'
  },
  {
    id: 'agd-3',
    veiculoId: '5', // Ducati Panigale V4
    vendedorId: CURRENT_USER,
    compradorId: 'user456',
    data: createDate(0, '15:00'), // Hoje
    horario: '15:00',
    status: STATUS_AGENDAMENTO.AGUARDANDO_CHECKIN,
    createdAt: createDate(-3, '12:00'),
    updatedAt: createDate(-1, '12:00'),
    observacoes: 'Check-in disponível 4 horas antes'
  },
  // Agendamentos como vendedor
  {
    id: 'agd-4',
    veiculoId: '7', // Kawasaki Ninja ZX-10R
    vendedorId: CURRENT_USER,
    compradorId: 'user789',
    data: createDate(0, '11:00'), // Hoje
    horario: '11:00',
    status: STATUS_AGENDAMENTO.CONFIRMADO,
    createdAt: createDate(-4, '13:00'),
    updatedAt: createDate(-1, '13:00'),
    observacoes: 'Cliente confirmou presença'
  },
  {
    id: 'agd-5',
    veiculoId: '8', // Triumph Speed Triple
    vendedorId: CURRENT_USER,
    compradorId: 'user456',
    data: createDate(0, '16:00'), // Hoje
    horario: '16:00',
    status: STATUS_AGENDAMENTO.ACONTECENDO,
    createdAt: createDate(-5, '14:00'),
    updatedAt: createDate(0, '16:00'),
    observacoes: 'Visita em andamento'
  },
  {
    id: 'agd-6',
    veiculoId: '9', // Harley-Davidson Fat Bob
    vendedorId: 'user456',
    compradorId: CURRENT_USER,
    data: createDate(-1, '09:00'), // Ontem
    horario: '09:00',
    status: STATUS_AGENDAMENTO.CONCLUIDO,
    createdAt: createDate(-6, '15:00'),
    updatedAt: createDate(-1, '11:00'),
    observacoes: 'Visita realizada com sucesso'
  },
  {
    id: 'agd-7',
    veiculoId: '10', // Honda CBR 1000RR-R
    vendedorId: CURRENT_USER,
    compradorId: 'user789',
    data: createDate(-2, '13:00'),
    horario: '13:00',
    status: STATUS_AGENDAMENTO.CANCELADO,
    createdAt: createDate(-7, '16:00'),
    updatedAt: createDate(-3, '10:00'),
    observacoes: 'Cancelado pelo comprador'
  },
  // Mais exemplos com diferentes status
  {
    id: 'agd-8',
    veiculoId: '11', // Indian Scout Bobber
    vendedorId: CURRENT_USER,
    compradorId: 'user456',
    data: createDate(3, '10:00'),
    horario: '10:00',
    status: STATUS_AGENDAMENTO.AGUARDANDO_DISPONIBILIDADE,
    createdAt: createDate(-1, '09:00'),
    updatedAt: createDate(-1, '09:00'),
    observacoes: 'Aguardando confirmação do vendedor'
  },
  {
    id: 'agd-9',
    veiculoId: '12', // Triumph Street Triple RS
    vendedorId: CURRENT_USER,
    compradorId: 'user789',
    data: createDate(0, '14:00'), // Hoje
    horario: '14:00',
    status: STATUS_AGENDAMENTO.CANCELADO,
    createdAt: createDate(-2, '15:00'),
    updatedAt: createDate(-1, '16:00'),
    observacoes: 'Cancelado pelo vendedor - Indisponível na data'
  },
  {
    id: 'agd-10',
    veiculoId: '13', // Suzuki GSX-R1000R
    vendedorId: CURRENT_USER,
    compradorId: 'user456',
    data: createDate(-3, '11:00'),
    horario: '11:00',
    status: STATUS_AGENDAMENTO.CONCLUIDO,
    createdAt: createDate(-5, '10:00'),
    updatedAt: createDate(-3, '13:00'),
    observacoes: 'Visita realizada e avaliada positivamente'
  },
  {
    id: 'agd-checkin-1',
    veiculoId: '1',
    vendedorId: 'user123',
    compradorId: CURRENT_USER,
    data: (() => {
      // Cria uma data 2 horas no futuro
      const data = new Date();
      data.setHours(data.getHours() + 2);
      return data.toISOString();
    })(),
    horario: '14:00',
    status: STATUS_AGENDAMENTO.AGUARDANDO_CHECKIN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    observacoes: 'Check-in disponível'
  }
]; 