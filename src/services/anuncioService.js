import { mockAnuncios } from '@/mocks/anuncios';
import { auth } from '@/services/firebase';

export const anuncioService = {
  async getAnuncio(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (id === 'novo') {
          resolve({
            id: 'novo',
            status: 'rascunho',
          });
        } else {
          const anuncio = 
            mockAnuncios.publicados.find(a => a.id === id) ||
            mockAnuncios.rascunhos.find(a => a.id === id);
            
          if (anuncio) {
            const userId = auth.currentUser?.uid || 'user123';
            resolve({ ...anuncio, userId });
          } else {
            resolve(null);
          }
        }
      }, 500);
    });
  },

  async createAnuncio(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAnuncio = {
          ...data,
          id: `anuncio${Date.now()}`,
          status: 'pendente',
          createdAt: new Date().toISOString()
        };
        mockAnuncios.publicados.push(newAnuncio);
        resolve(newAnuncio);
      }, 500);
    });
  },

  async updateAnuncio(id, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockAnuncios.publicados.findIndex(a => a.id === id);
        if (index >= 0) {
          mockAnuncios.publicados[index] = { ...mockAnuncios.publicados[index], ...data };
          resolve(mockAnuncios.publicados[index]);
        }
      }, 500);
    });
  }
}; 