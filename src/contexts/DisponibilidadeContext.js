'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { disponibilidadeService } from '@/services/disponibilidadeService';

const DisponibilidadeContext = createContext({});

const disponibilidadePadrao = {
  tipo: 'semanal',
  dataUnica: {},
  semanal: {
    dom: { ativo: false, horarios: [] },
    seg: { ativo: false, horarios: [] },
    ter: { ativo: false, horarios: [] },
    qua: { ativo: false, horarios: [] },
    qui: { ativo: false, horarios: [] },
    sex: { ativo: false, horarios: [] },
    sab: { ativo: false, horarios: [] }
  },
  faixaHorario: {
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    horarios: {
      dom: { ativo: false, horarios: [] },
      seg: { ativo: false, horarios: [] },
      ter: { ativo: false, horarios: [] },
      qua: { ativo: false, horarios: [] },
      qui: { ativo: false, horarios: [] },
      sex: { ativo: false, horarios: [] },
      sab: { ativo: false, horarios: [] }
    }
  }
};

export function DisponibilidadeProvider({ children }) {
  const { user } = useAuth();
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisponibilidade = async () => {
      try {
        if (user) {
          const data = await disponibilidadeService.getDisponibilidade(user.uid);
          setDisponibilidade(data || disponibilidadePadrao);
        }
      } catch (error) {
        console.error('Erro ao carregar disponibilidade:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisponibilidade();
  }, [user]);

  const updateDisponibilidade = async (novaDisponibilidade) => {
    try {
      if (user) {
        await disponibilidadeService.updateDisponibilidade(user.uid, novaDisponibilidade);
        setDisponibilidade(novaDisponibilidade);
      }
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