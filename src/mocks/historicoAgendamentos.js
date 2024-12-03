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

export const historicoAgendamentos = {
  '1': [
    {
      id: 'agend-1',
      data: '2024-03-15T14:00:00Z',
      comprador: {
        nome: 'João Silva',
        telefone: '(11) 99999-9999'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Visita realizada com sucesso. Cliente gostou da moto.'
    },
    {
      id: 'agend-2',
      data: '2024-03-14T10:00:00Z',
      comprador: {
        nome: 'Maria Santos',
        telefone: '(11) 98888-8888'
      },
      status: STATUS_AGENDAMENTO.CANCELADO,
      observacoes: 'Comprador desmarcou: Surgiu um imprevisto'
    },
    {
      id: 'agend-3',
      data: '2024-03-18T16:00:00Z',
      comprador: {
        nome: 'Pedro Oliveira',
        telefone: '(11) 97777-7777'
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
        nome: 'Carlos Ferreira',
        telefone: '(11) 96666-6666'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Cliente achou o preço alto'
    },
    {
      id: 'agend-5',
      data: '2024-03-12T15:30:00Z',
      comprador: {
        nome: 'Ana Beatriz',
        telefone: '(11) 95555-5555'
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
        nome: 'Roberto Souza',
        telefone: '(11) 94444-4444'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Cliente muito interessado, pediu prazo para pensar'
    },
    {
      id: 'agend-7',
      data: '2024-03-11T16:00:00Z',
      comprador: {
        nome: 'Fernanda Lima',
        telefone: '(11) 93333-3333'
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
        nome: 'Lucas Mendes',
        telefone: '(11) 92222-2222'
      },
      status: STATUS_AGENDAMENTO.CONCLUIDO,
      observacoes: 'Cliente aprovou a moto e fechou negócio'
    },
    {
      id: 'agend-9',
      data: '2024-03-08T14:30:00Z',
      comprador: {
        nome: 'Mariana Costa',
        telefone: '(11) 91111-1111'
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
        nome: 'Gabriel Santos',
        telefone: '(11) 90000-0000'
      },
      status: STATUS_AGENDAMENTO.AGENDADO,
      observacoes: null
    }
  ]
};