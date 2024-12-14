export const users = {
  'vctr.ss@gmail.com': {
    id: 'vctr.ss@gmail.com',
    nome: 'Victor Santos',
    email: 'vctr.ss@gmail.com',
    telefone: '11999999999',
    whatsapp: '11999999999',
    cidade: 'São Paulo',
    estado: 'SP',
    notificacoes: {
      email: true,
      whatsapp: true
    },
    disponibilidade: {
      tipo: 'semanal',
      semanal: {
        seg: { ativo: true, horarios: ['09:00', '10:00'] },
        ter: { ativo: true, horarios: ['14:00', '15:00'] },
        qua: { ativo: true, horarios: ['09:00', '10:00'] },
        qui: { ativo: true, horarios: ['14:00', '15:00'] },
        sex: { ativo: true, horarios: ['09:00', '10:00'] },
        sab: { ativo: false, horarios: [] },
        dom: { ativo: false, horarios: [] }
      }
    }
  },
  'victor.sanches@solutionsa.com.br': {
    id: 'victor.sanches@solutionsa.com.br',
    nome: 'Victor Sanches',
    email: 'victor.sanches@solutionsa.com.br',
    telefone: '11988888888',
    whatsapp: '11988888888',
    cidade: 'São Paulo',
    estado: 'SP',
    notificacoes: {
      email: true,
      whatsapp: false
    },
    disponibilidade: {
      tipo: 'semanal',
      semanal: {
        seg: { ativo: true, horarios: ['14:00', '15:00', '16:00'] },
        ter: { ativo: true, horarios: ['14:00', '15:00', '16:00'] },
        qua: { ativo: true, horarios: ['14:00', '15:00', '16:00'] },
        qui: { ativo: true, horarios: ['14:00', '15:00', '16:00'] },
        sex: { ativo: true, horarios: ['14:00', '15:00'] },
        sab: { ativo: true, horarios: ['10:00', '11:00'] },
        dom: { ativo: false, horarios: [] }
      }
    }
  }
}; 