'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { availabilityService } from '@/services/availabilityService';
import { toast } from '@/components/ui/toast';
import { normalizeDateString } from '@/utils/dateUtils';

// Função auxiliar para comparar arrays
const arraysIguais = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
};

const DisponibilidadeContext = createContext({});

const disponibilidadePadrao = {
  tipo: null,
  dataUnica: {
    horarios: {}
  },
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
    horarios: {}
  }
};

// Função para criar disponibilidade padrão baseada nas configurações da loja
const createDefaultAvailability = (storeSettings) => {
  const defaultData = { ...disponibilidadePadrao };
  
  // Aplica as configurações da loja
  if (storeSettings?.weekDays) {
    Object.entries(storeSettings.weekDays).forEach(([dia, config]) => {
      defaultData.semanal[dia] = {
        ativo: config.active !== false && config.slots?.length > 0,
        horarios: []
      };
    });
  }
  
  return defaultData;
};

// Função auxiliar para converter do frontend para o Firebase
const convertToFirebase = (frontendData) => {
  const firebaseData = {
    availableDays: {
      type: frontendData.tipo,
      config: {
        weekDays: {
          dom: { active: false, slots: [] },
          seg: { active: false, slots: [] },
          ter: { active: false, slots: [] },
          qua: { active: false, slots: [] },
          qui: { active: false, slots: [] },
          sex: { active: false, slots: [] },
          sab: { active: false, slots: [] }
        },
        dates: {},
        range: {
          start: null,
          end: null
        }
      }
    },
    metadata: {
      lastUpdate: new Date().toISOString()
    }
  };

  if (frontendData.tipo === 'semanal') {
    Object.entries(frontendData.semanal).forEach(([dia, config]) => {
      firebaseData.availableDays.config.weekDays[dia] = {
        active: config.ativo,
        slots: config.horarios.sort()
      };
    });
  }
  else if (frontendData.tipo === 'dataUnica') {
    Object.entries(frontendData.dataUnica.horarios).forEach(([data, horarios]) => {
      if (horarios.length > 0) {
        firebaseData.availableDays.config.dates[data] = horarios.sort();
      }
    });
  }
  else if (frontendData.tipo === 'faixaHorario') {
    firebaseData.availableDays.config.range = {
      start: frontendData.faixaHorario.dataInicio,
      end: frontendData.faixaHorario.dataFim
    };

    Object.entries(frontendData.faixaHorario.horarios).forEach(([data, horarios]) => {
      if (horarios.length > 0) {
        firebaseData.availableDays.config.dates[data] = horarios.sort();
      }
    });
  }

  return firebaseData;
};

// Função auxiliar para verificar se um dia está disponível na loja
function isDiaDisponivelNaLoja(diaSemana, storeSettings) {
  const diaConfig = storeSettings?.weekDays?.[diaSemana];
  return diaConfig?.active !== false && Array.isArray(diaConfig?.slots) && diaConfig.slots.length > 0;
}

// Função auxiliar para verificar se um horário está disponível na loja
function isHorarioDisponivelNaLoja(data, availableSlots) {
  if (!data || !availableSlots) return false;
  const dateStr = normalizeDateString(data);
  const slots = availableSlots[dateStr];
  return Array.isArray(slots) && slots.length > 0 && slots.includes(horario);
}

// Função auxiliar para obter horários disponíveis para uma data
function getHorariosDisponiveis(data, availableSlots) {
  if (!data || !availableSlots) return [];
  const dateStr = normalizeDateString(data);
  const slots = availableSlots[dateStr];
  return Array.isArray(slots) ? slots : [];
}

// Função auxiliar para converter do Firebase para o frontend
function convertFromFirebase(firebaseData, storeSettings, availableSlots) {
  console.log('[convertFromFirebase] Iniciando conversão:', firebaseData);
  
  // Verifica se temos os dados necessários
  if (!firebaseData?.availableDays?.availableDays || !storeSettings) {
    console.log('[convertFromFirebase] Dados insuficientes, retornando padrão');
    return createDefaultAvailability(storeSettings);
  }

  // Garante que availableSlots seja um objeto
  const slots = availableSlots || {};

  // Acessa o objeto availableDays interno
  const availableDays = firebaseData.availableDays.availableDays;
  console.log('[convertFromFirebase] Dados disponíveis:', availableDays);

  // Detecta o tipo real dos dados
  const tipo = availableDays.type || 'semanal';
  console.log('[convertFromFirebase] Tipo detectado:', tipo);

  // Cria estrutura base dos dados
  const frontendData = {
    tipo,
    dataUnica: {
      horarios: {}
    },
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
      horarios: {}
    }
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
  }

  console.log('[convertFromFirebase] Dados convertidos:', frontendData);
  return frontendData;
}

export function DisponibilidadeProvider({ children }) {
  const { user } = useAuth();
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [loading, setLoading] = useState(true);

  // Log inicial do estado
  console.log('[DisponibilidadeProvider] Estado inicial:', {
    user: !!user,
    disponibilidade: !!disponibilidade,
    currentConfig: !!currentConfig,
    storeSettings: !!storeSettings,
    loading
  });

  // Carrega slots disponíveis
  useEffect(() => {
    const loadAvailableSlots = async () => {
      try {
        const { slots } = await availabilityService.getAvailableSlots();
        console.log('[loadAvailableSlots] Slots carregados:', slots);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Erro ao carregar slots disponíveis:', error);
      }
    };

    loadAvailableSlots();
  }, []);

  // Carrega configurações da loja
  useEffect(() => {
    const loadStoreSettings = async () => {
      try {
        const settings = await availabilityService.getStoreSettings();
        console.log('[loadStoreSettings] Configurações carregadas:', settings);
        setStoreSettings(settings);
      } catch (error) {
        console.error('Erro ao carregar configurações da loja:', error);
      }
    };

    loadStoreSettings();
  }, []);

  // Carrega disponibilidade do usuário
  useEffect(() => {
    const fetchDisponibilidade = async () => {
      console.log('[fetchDisponibilidade] Iniciando busca...', {
        temUser: !!user,
        temStoreSettings: !!storeSettings
      });

      try {
        if (user) {
          const data = await availabilityService.getUserAvailability(user.uid);
          console.log('[fetchDisponibilidade] Dados brutos do Firebase:', data);
          
          const convertedData = convertFromFirebase(data, storeSettings, availableSlots);
          console.log('[fetchDisponibilidade] Dados convertidos:', convertedData);
          
          setDisponibilidade(convertedData);
          setCurrentConfig(convertedData);
          
          console.log('[fetchDisponibilidade] Estados atualizados:', {
            disponibilidade: convertedData,
            currentConfig: convertedData
          });
        }
      } catch (error) {
        console.error('Erro ao carregar disponibilidade:', error);
      } finally {
        setLoading(false);
      }
    };

    // Só carrega a disponibilidade quando tivermos as configurações da loja
    if (storeSettings) {
      fetchDisponibilidade();
    }
  }, [user, storeSettings, availableSlots]);

  // Log quando currentConfig muda
  useEffect(() => {
    console.log('[DisponibilidadeProvider] currentConfig atualizado:', currentConfig);
  }, [currentConfig]);

  // Log quando disponibilidade muda
  useEffect(() => {
    console.log('[DisponibilidadeProvider] disponibilidade atualizada:', disponibilidade);
  }, [disponibilidade]);

  // Verifica se há mudanças sempre que currentConfig mudar
  useEffect(() => {
    if (!disponibilidade || !currentConfig) return;

    const hasRealChanges = (() => {
      // Se não houver disponibilidade salva, compara com o padrão
      const disponibilidadeAtual = disponibilidade || disponibilidadePadrao;

      // Se mudou o tipo, verifica se tem horários configurados no novo tipo
      if (currentConfig.tipo !== disponibilidadeAtual.tipo && 
          !(currentConfig.tipo === 'dataUnica' && disponibilidadeAtual.tipo === 'unica') &&
          !(currentConfig.tipo === 'unica' && disponibilidadeAtual.tipo === 'dataUnica')) {
        let temHorarios = false;

        if (currentConfig.tipo === 'semanal') {
          temHorarios = Object.values(currentConfig.semanal).some(dia => 
            dia.ativo && dia.horarios.length > 0
          );
        }
        else if (currentConfig.tipo === 'dataUnica' || currentConfig.tipo === 'unica') {
          const horarios = currentConfig.dataUnica?.horarios || {};
          temHorarios = Object.values(horarios).some(slots => 
            Array.isArray(slots) && slots.length > 0
          );
        }
        else if (currentConfig.tipo === 'faixaHorario') {
          temHorarios = Object.values(currentConfig.faixaHorario.horarios || {}).some(horarios => 
            Array.isArray(horarios) && horarios.length > 0
          );
        }

        return temHorarios;
      }

      // Se o tipo é o mesmo, compara os horários
      if (currentConfig.tipo === disponibilidadeAtual.tipo || 
          (currentConfig.tipo === 'dataUnica' && disponibilidadeAtual.tipo === 'unica') ||
          (currentConfig.tipo === 'unica' && disponibilidadeAtual.tipo === 'dataUnica')) {
        
        // Normaliza os tipos para comparação
        const tipoAtual = disponibilidadeAtual.tipo === 'unica' ? 'dataUnica' : disponibilidadeAtual.tipo;
        const tipoNovo = currentConfig.tipo === 'unica' ? 'dataUnica' : currentConfig.tipo;

        if (tipoNovo === 'semanal') {
          // Compara cada dia da semana
          return Object.entries(currentConfig.semanal).some(([dia, config]) => {
            const configAtual = disponibilidadeAtual.semanal[dia];
            return (
              config.ativo !== configAtual.ativo ||
              !arraysIguais(config.horarios, configAtual.horarios)
            );
          });
        }
        else if (tipoNovo === 'dataUnica') {
          // Compara os horários de cada data
          const horariosAtuais = disponibilidadeAtual.dataUnica?.horarios || {};
          const horariosNovos = currentConfig.dataUnica?.horarios || {};

          // Se tem horários diferentes
          if (Object.keys(horariosAtuais).length !== Object.keys(horariosNovos).length) {
            return true;
          }

          // Verifica se todas as datas em horariosNovos existem em horariosAtuais
          const datasNovas = Object.keys(horariosNovos);
          const datasAtuais = Object.keys(horariosAtuais);
          
          if (!datasNovas.every(data => datasAtuais.includes(data))) {
            return true;
          }

          // Compara cada data
          return datasNovas.some(data => {
            const horariosData = horariosNovos[data] || [];
            const horariosAntigos = horariosAtuais[data] || [];
            return !arraysIguais(horariosData, horariosAntigos);
          });
        }
        else if (tipoNovo === 'faixaHorario') {
          // Compara os horários de cada data no período
          const datasAtuais = Object.keys(disponibilidadeAtual.faixaHorario.horarios || {});
          const datasNovas = Object.keys(currentConfig.faixaHorario.horarios || {});

          // Se tem datas diferentes
          if (datasAtuais.length !== datasNovas.length) return true;

          // Compara os horários de cada data
          return datasNovas.some(data => {
            const horariosAtuais = disponibilidadeAtual.faixaHorario.horarios[data] || [];
            const horariosNovos = currentConfig.faixaHorario.horarios[data] || [];
            return !arraysIguais(horariosAtuais, horariosNovos);
          });
        }
      }

      return false;
    })();

    setHasChanges(hasRealChanges);
  }, [disponibilidade, currentConfig]);

  const updateCurrentConfig = (updates) => {
    setCurrentConfig(prev => {
      // Se for uma função, executa ela
      const updatedConfig = typeof updates === 'function' ? updates(prev) : updates;
      
      // Normaliza o tipo para 'dataUnica' se for 'unica'
      const tipo = updatedConfig.tipo === 'unica' ? 'dataUnica' : (updatedConfig.tipo || prev?.tipo);
      
      return {
        ...prev,
        ...updatedConfig,
        tipo
      };
    });
  };

  const updateDisponibilidade = async (novaDisponibilidade) => {
    try {
      if (user) {
        const firebaseData = convertToFirebase(novaDisponibilidade);
        await availabilityService.updateUserAvailability(user.uid, firebaseData);
        
        // Atualiza ambos os estados
        setDisponibilidade(novaDisponibilidade);
        setCurrentConfig(novaDisponibilidade);
        
        toast.success('Disponibilidade atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      toast.error('Não foi possível salvar sua disponibilidade. Tente novamente.');
      throw error;
    }
  };

  return (
    <DisponibilidadeContext.Provider 
      value={{ 
        disponibilidade,
        currentConfig,
        updateCurrentConfig,
        hasChanges,
        updateDisponibilidade,
        storeSettings,
        availableSlots,
        loading 
      }}
    >
      {children}
    </DisponibilidadeContext.Provider>
  );
}

export const useDisponibilidade = () => useContext(DisponibilidadeContext); 