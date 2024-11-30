import { agendamentos } from '@/mocks/agendamentos';

export const agendamentoService = {
  async getAgendamentos(userId, tipo = 'comprador') {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = agendamentos.filter(a => 
          tipo === 'comprador' ? a.compradorId === userId : a.vendedorId === userId
        );
        resolve(filtered);
      }, 500);
    });
  },

  async createAgendamento(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAgendamento = {
          id: `agendamento${Date.now()}`,
          ...data,
          status: 'pendente',
          createdAt: new Date().toISOString()
        };
        agendamentos.push(newAgendamento);
        resolve(newAgendamento);
      }, 500);
    });
  }
}; 