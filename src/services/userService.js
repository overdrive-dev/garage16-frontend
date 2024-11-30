import { users } from '@/mocks/users';

export const userService = {
  async getProfile(userId) {
    // Simula chamada API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(users[userId]);
      }, 500);
    });
  },

  async updateProfile(userId, data) {
    // Simula chamada API
    return new Promise((resolve) => {
      setTimeout(() => {
        users[userId] = { ...users[userId], ...data };
        resolve(users[userId]);
      }, 500);
    });
  }
}; 