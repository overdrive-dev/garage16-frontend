// Primeiro definir os status possíveis
export const STATUS_AGENDAMENTO = {
  AGENDADO: 'agendado',
  CONFIRMADO: 'confirmado',
  CHECKIN: 'checkin',
  VISITA_CONFIRMADA: 'visita_confirmada',
  ANDAMENTO: 'andamento',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado'
};

// Usuários mockados para testes
const CURRENT_USER = 'Ki0nY4yfm2apORlsm5WaMcWcNce2';
const BUYER_USER = '2zxE5yZP1eON5Zckn04E84T4Ii22';

export const historicoAgendamentos = {
  '1': [
    {
      id: 'agend-1',
      data: '2024-03-15T14:00:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Visita realizada com sucesso. Cliente gostou da moto.'
    },
    {
      id: 'agend-2',
      data: '2024-03-14T10:00:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CANCELADO,
      observacoes: 'Comprador desmarcou: Surgiu um imprevisto'
    },
    {
      id: 'agend-3',
      data: '2024-03-18T16:00:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.AGENDADO,
      observacoes: null
    }
  ],
  '2': [
    {
      id: 'agend-4',
      data: '2024-03-13T11:00:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Cliente achou o preço alto'
    },
    {
      id: 'agend-5',
      data: '2024-03-12T15:30:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CANCELADO,
      observacoes: 'Vendedor desmarcou: Manutenção necessária'
    }
  ],
  '3': [
    {
      id: 'agend-6',
      data: '2024-03-10T09:00:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Cliente muito interessado, pediu prazo para pensar'
    },
    {
      id: 'agend-7',
      data: '2024-03-11T16:00:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Visita realizada com sucesso'
    }
  ],
  '4': [
    {
      id: 'agend-8',
      data: '2024-03-09T10:00:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Cliente aprovou a moto e fechou negócio'
    },
    {
      id: 'agend-9',
      data: '2024-03-08T14:30:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CANCELADO,
      observacoes: 'Cliente desmarcou: Encontrou outra opção'
    }
  ],
  '5': [
    {
      id: 'agend-10',
      data: '2024-03-16T11:00:00Z',
      comprador: {
        id: BUYER_USER,
        nome: 'Victor Sanches',
        telefone: '(11) 98888-8888'
      },
      vendedor: {
        id: CURRENT_USER,
        nome: 'Victor Santos',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.AGENDADO,
      observacoes: null
    }
  ]
};