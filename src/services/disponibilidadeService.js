// Por enquanto usando mock, depois será substituído por chamadas à API
const mockDisponibilidades = {};

export const disponibilidadeService = {
  async getDisponibilidade(userId) {
    // Simula chamada GET /api/users/{userId}/disponibilidade
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDisponibilidades[userId]);
      }, 500);
    });
  },

  async updateDisponibilidade(userId, data) {
    // Simula chamada PUT /api/users/{userId}/disponibilidade
    return new Promise((resolve) => {
      setTimeout(() => {
        mockDisponibilidades[userId] = data;
        resolve(data);
      }, 500);
    });
  }
}; 