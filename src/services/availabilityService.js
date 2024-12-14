import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  serverTimestamp 
} from 'firebase/firestore';

// Coleções
const USER_AVAILABILITY_COLLECTION = 'user_availability';
const STORE_SETTINGS_COLLECTION = 'store_settings';

export const availabilityService = {
  // Busca a disponibilidade de um usuário
  async getUserAvailability(userId) {
    try {
      const docRef = doc(db, USER_AVAILABILITY_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      // Se não existir, retorna estrutura padrão
      return {
        userId,
        availableDays: {},
        metadata: {
          createdAt: serverTimestamp(),
          lastUpdate: serverTimestamp()
        }
      };
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
      throw error;
    }
  },

  // Atualiza ou cria a disponibilidade de um usuário
  async updateUserAvailability(userId, availableDays) {
    try {
      const docRef = doc(db, USER_AVAILABILITY_COLLECTION, userId);
      
      await setDoc(docRef, {
        userId,
        availableDays,
        metadata: {
          lastUpdate: serverTimestamp(),
          createdAt: serverTimestamp() // Será sobrescrito se já existir
        }
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      throw error;
    }
  },

  // Busca as configurações da loja
  async getStoreSettings() {
    try {
      // Por enquanto usando um ID fixo para a loja
      const docRef = doc(db, STORE_SETTINGS_COLLECTION, 'default_store');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      // Se não existir, retorna configurações padrão
      return {
        workingDays: ["1", "2", "3", "4", "5"], // seg a sex
        holidays: [],
        businessHours: {
          start: "09:00",
          end: "18:00"
        },
        metadata: {
          lastUpdate: serverTimestamp(),
          updatedBy: 'system'
        }
      };
    } catch (error) {
      console.error('Erro ao buscar configurações da loja:', error);
      throw error;
    }
  }
}; 