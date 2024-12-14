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
        weekDays: {
          dom: { active: false, slots: [] },
          seg: { 
            active: true, 
            slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
          },
          ter: { 
            active: true, 
            slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
          },
          qua: { 
            active: true, 
            slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
          },
          qui: { 
            active: true, 
            slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
          },
          sex: { 
            active: true, 
            slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
          },
          sab: { 
            active: true, 
            slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00"]
          }
        },
        blockedDates: [],
        metadata: {
          lastUpdate: serverTimestamp(),
          updatedBy: 'system'
        }
      };
    } catch (error) {
      console.error('Erro ao buscar configurações da loja:', error);
      throw error;
    }
  },

  // Novo método para buscar slots disponíveis
  async getAvailableSlots() {
    try {
      console.log('Buscando slots disponíveis...');
      const slotsDoc = await getDoc(doc(db, 'availableSlots', 'default_store'));
      
      console.log('Documento encontrado:', slotsDoc.exists());
      const data = slotsDoc.data();
      console.log('Dados recebidos:', data);
      
      if (!slotsDoc.exists()) {
        console.log('Nenhum slot disponível encontrado');
        return { slots: {} };
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar slots disponíveis:', error);
      throw error;
    }
  }
}; 