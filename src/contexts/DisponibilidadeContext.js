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
<<<<<<< Updated upstream
=======
  };

  if (tipo === 'semanal') {
    const weekDays = availableDays.config?.weekDays || {};
    console.log('[convertFromFirebase] Processando dias da semana:', weekDays);
    
    Object.entries(weekDays).forEach(([dia, config]) => {
      if (!config) return;
      
      const diaEstaDisponivel = isDiaDisponivelNaLoja(dia, storeSettings);
      const horariosPermitidos = Array.isArray(config.slots) 
        ? config.slots.filter(horario => {
            // Verifica se o horário está disponível em pelo menos uma data futura deste dia da semana
            const datasFuturas = Object.keys(slots)
              .filter(dateStr => {
                const data = new Date(dateStr);
                const diaSemanaData = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][data.getDay()];
                return diaSemanaData === dia;
              });
            return datasFuturas.some(dateStr => {
              const slotsData = slots[dateStr];
              return Array.isArray(slotsData) && slotsData.includes(horario);
            });
          }).sort()
        : [];
      
      frontendData.semanal[dia] = {
        ativo: diaEstaDisponivel && config.active && horariosPermitidos.length > 0,
        horarios: diaEstaDisponivel ? horariosPermitidos : []
      };
    });
  } else if (tipo === 'dataUnica' || tipo === 'unica') {
    const dates = availableDays.config?.dates || {};
    console.log('[convertFromFirebase] Processando datas únicas:', {
      dates,
      availableSlots: availableSlots?.slots || {}
    });
    
    Object.entries(dates).forEach(([data, slots]) => {
      if (!Array.isArray(slots)) {
        console.log(`[convertFromFirebase] Slots inválidos para data ${data}:`, slots);
        return;
      }
      
      const dateStr = normalizeDateString(data);
      const date = normalizeDate(dateStr);
      const diaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
      
      // Combina os slots da loja com os slots específicos da data
      const slotsLoja = storeSettings?.weekDays?.[diaSemana]?.slots || [];
      const slotsData = availableSlots?.slots?.[dateStr] || [];
      const horariosDisponiveis = Array.from(new Set([...slotsLoja, ...slotsData])).sort();
      
      console.log(`[convertFromFirebase] Processando data ${dateStr}:`, {
        slotsConfigurados: slots,
        diaSemana,
        slotsLoja,
        slotsData,
        horariosDisponiveis
      });
      
      // Filtra apenas os horários que ainda estão disponíveis
      const horariosPermitidos = slots.filter(horario => 
        horariosDisponiveis.includes(horario)
      ).sort();
      
      if (horariosPermitidos.length > 0) {
        console.log(`[convertFromFirebase] Horários permitidos para ${dateStr}:`, horariosPermitidos);
        frontendData.dataUnica.horarios[dateStr] = horariosPermitidos;
      }
    });

    console.log('[convertFromFirebase] Resultado final dataUnica:', frontendData.dataUnica);
  } else if (tipo === 'faixaHorario') {
    console.log('[convertFromFirebase] Processando faixa de horário. Config:', availableDays.config);
    
    // Define as datas de início e fim
    const range = availableDays.config?.range || {};
    console.log('[convertFromFirebase] Range recebido:', range);

    // Garante que as datas sejam válidas
    let dataInicio = range.start;
    let dataFim = range.end;

    // Se não tiver datas definidas, usa as datas padrão
    if (!dataInicio || !dataFim) {
      dataInicio = new Date().toISOString().split('T')[0];
      dataFim = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      console.log('[convertFromFirebase] Usando datas padrão:', { dataInicio, dataFim });
    }

    frontendData.faixaHorario = {
      dataInicio,
      dataFim,
      horarios: {}
    };

    // Se não tiver datas configuradas, retorna o objeto com as datas definidas
    if (!availableDays.config?.dates) {
      console.log('[convertFromFirebase] Sem datas configuradas para faixa de horário');
      return frontendData;
    }

    // Processa as datas e horários
    const dates = availableDays.config.dates;
    console.log('[convertFromFirebase] Processando datas da faixa:', dates);
    
    Object.entries(dates).forEach(([data, configSlots]) => {
      if (!Array.isArray(configSlots)) return;
      
      const horariosDisponiveis = getHorariosDisponiveis(data, availableSlots);
      if (horariosDisponiveis.length === 0) return;
      
      const horariosPermitidos = configSlots.filter(horario => 
        Array.isArray(horariosDisponiveis) && horariosDisponiveis.includes(horario)
      ).sort();
      
      if (horariosPermitidos.length > 0) {
        frontendData.faixaHorario.horarios[data] = horariosPermitidos;
      }
    });
>>>>>>> Stashed changes
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