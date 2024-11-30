'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

const DisponibilidadeContext = createContext({});

export function DisponibilidadeProvider({ children }) {
  const { user } = useAuth();
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDisponibilidade = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            setDisponibilidade(userDoc.data().disponibilidade || null);
          }
        } catch (error) {
          console.error('Erro ao carregar disponibilidade:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDisponibilidade();
    }
  }, [user]);

  const updateDisponibilidade = async (novaDisponibilidade) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        disponibilidade: novaDisponibilidade
      });
      setDisponibilidade(novaDisponibilidade);
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      throw error;
    }
  };

  return (
    <DisponibilidadeContext.Provider 
      value={{ 
        disponibilidade, 
        updateDisponibilidade,
        loading 
      }}
    >
      {children}
    </DisponibilidadeContext.Provider>
  );
}

export const useDisponibilidade = () => useContext(DisponibilidadeContext); 