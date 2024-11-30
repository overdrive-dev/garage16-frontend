export const users = {
  'user123': {
    id: 'user123',
    nome: 'João Silva',
    email: 'joao@example.com',
    telefone: '11999999999',
    whatsapp: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP',
    notificacoes: {
      email: true,
      whatsapp: false
    },
    disponibilidade: {
      tipo: 'semanal',
      semanal: {
        seg: { ativo: true, horarios: ['09:00', '10:00'] },
        ter: { ativo: true, horarios: ['14:00', '15:00'] },
        // ...
      }
    }
  }
}; 