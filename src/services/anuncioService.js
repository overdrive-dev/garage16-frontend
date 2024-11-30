import { anuncios } from '@/mocks/anuncios';

export const anuncioService = {
  async getAnuncios(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...anuncios];
        if (filters.userId) {
          filtered = filtered.filter(a => a.userId === filters.userId);
        }
        resolve(filtered);
      }, 500);
    });
  },

  async createAnuncio(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAnuncio = {
          id: `anuncio${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString()
        };
        anuncios.push(newAnuncio);
        resolve(newAnuncio);
      }, 500);
    });
  }
}; 