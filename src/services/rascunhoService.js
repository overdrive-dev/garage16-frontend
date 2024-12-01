// Por enquanto usando mock, depois será substituído por chamadas à API
const mockRascunhos = {};

export const rascunhoService = {
  async getRascunho(userId) {
    // Simula GET /api/rascunhos/{userId}
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockRascunhos[userId]);
      }, 500);
    });
  },

  async saveRascunho(userId, data) {
    // Simula POST /api/rascunhos/{userId}
    return new Promise((resolve) => {
      setTimeout(() => {
        mockRascunhos[userId] = {
          ...data,
          updatedAt: new Date().toISOString()
        };
        resolve(mockRascunhos[userId]);
      }, 500);
    });
  },

  async deleteRascunho(userId) {
    // Simula DELETE /api/rascunhos/{userId}
    return new Promise((resolve) => {
      setTimeout(() => {
        delete mockRascunhos[userId];
        resolve();
      }, 500);
    });
  }
}; 