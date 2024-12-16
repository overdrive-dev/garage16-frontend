'use client'

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { availabilityService } from '@/services/availabilityService';
import { toast } from '@/components/ui/toast';
import { 
  normalizeDate, 
  toFirebaseDate, 
  fromFirebaseDate,
  getDayOfWeek,
  getDayString,
  DIAS_SEMANA
} from '@/utils/dateUtils';

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
    dataInicio: toFirebaseDate(new Date()),
    dataFim: toFirebaseDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    horarios: {}
  }
};

// Função para criar disponibilidade padrão baseada nas configurações da loja
const createDefaultAvailability = (storeSettings) => {
  const defaultData = { ...disponibilidadePadrao };
  
  // Aplica as configurações da loja
  if (storeSettings?.weekDays) {
    DIAS_SEMANA.forEach(dia => {
      const config = storeSettings.weekDays[dia];
      defaultData.semanal[dia] = {
        ativo: config?.active !== false && Array.isArray(config?.slots) && config.slots.length > 0,
        horarios: []
      };
    });
  }
  
  return defaultData;
};

// Função auxiliar para verificar se um dia está disponível na loja
function isDiaDisponivelNaLoja(diaSemana, storeSettings) {
  if (!diaSemana || !storeSettings?.weekDays) return false;
  const diaConfig = storeSettings.weekDays[diaSemana];
  return diaConfig?.active !== false && Array.isArray(diaConfig?.slots) && diaConfig.slots.length > 0;
}

// Função auxiliar para verificar se um horário está disponível na loja
function isHorarioDisponivelNaLoja(data, horario, availableSlots) {
  if (!data || !horario || !availableSlots) return false;
  const dateStr = toFirebaseDate(data);
  const slots = availableSlots[dateStr];
  return Array.isArray(slots) && slots.length > 0 && slots.includes(horario);
}

// Função auxiliar para obter horários disponíveis para uma data
function getHorariosDisponiveis(data, availableSlots) {
  if (!data || !availableSlots) return [];
  const dateStr = toFirebaseDate(data);
  const slots = availableSlots[dateStr];
  return Array.isArray(slots) ? slots : [];
}

export function DisponibilidadeProvider({ children }) {
  const { user } = useAuth();
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Memoriza as funções de conversão
  const convertToFirebase = useMemo(() => (frontendData) => {
    const firebaseData = {
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
      },
      metadata: {
        lastUpdate: new Date().toISOString()
      }
    };

    if (frontendData.tipo === 'semanal') {
      DIAS_SEMANA.forEach(dia => {
        const config = frontendData.semanal[dia];
        if (config) {
          firebaseData.config.weekDays[dia] = {
            active: config.ativo,
            slots: config.horarios.sort()
          };
        }
      });
    }
    else if (frontendData.tipo === 'dataUnica') {
      Object.entries(frontendData.dataUnica.horarios).forEach(([data, horarios]) => {
        if (Array.isArray(horarios) && horarios.length > 0) {
          firebaseData.config.dates[data] = horarios.sort();
        }
      });
    }
    else if (frontendData.tipo === 'faixaHorario') {
      firebaseData.config.range = {
        start: frontendData.faixaHorario.dataInicio,
        end: frontendData.faixaHorario.dataFim
      };

      Object.entries(frontendData.faixaHorario.horarios).forEach(([data, horarios]) => {
        if (Array.isArray(horarios) && horarios.length > 0) {
          firebaseData.config.dates[data] = horarios.sort();
        }
      });
    }

    return firebaseData;
  }, []);

  const convertFromFirebase = useMemo(() => (firebaseData) => {
    if (!firebaseData || !storeSettings) {
      return createDefaultAvailability(storeSettings);
    }

    const tipo = firebaseData.type || 'semanal';
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
        dataInicio: null,
        dataFim: null,
        horarios: {}
      }
    };

    // Processa todos os horários configurados no Firebase
    const dates = firebaseData.config?.dates || {};
    Object.entries(dates).forEach(([data, configSlots]) => {
      if (!Array.isArray(configSlots)) return;
      
      const dataObj = fromFirebaseDate(data);
      if (!dataObj) return;

      const dayIndex = getDayOfWeek(dataObj);
      const diaSemana = getDayString(dayIndex);
      if (!diaSemana) return;

      const slotsLoja = storeSettings?.weekDays?.[diaSemana]?.slots || [];
      const horariosPermitidos = configSlots.filter(horario => 
        slotsLoja.includes(horario)
      ).sort();

      // Adiciona os horários em todas as visualizações
      frontendData.dataUnica.horarios[data] = horariosPermitidos;
      frontendData.faixaHorario.horarios[data] = horariosPermitidos;
    });

    // Configura os horários semanais
    const weekDays = firebaseData.config?.weekDays || {};
    DIAS_SEMANA.forEach(dia => {
      const config = weekDays[dia];
      const slotsLoja = storeSettings?.weekDays?.[dia]?.slots || [];
      
      const diaEstaDisponivel = isDiaDisponivelNaLoja(dia, storeSettings);
      const horariosPermitidos = Array.isArray(config?.slots) 
        ? config.slots.filter(horario => slotsLoja.includes(horario)).sort()
        : [];

      frontendData.semanal[dia] = {
        ativo: diaEstaDisponivel && config?.active !== false && horariosPermitidos.length > 0,
        horarios: horariosPermitidos
      };
    });

    // Configura o período da faixa de horário
    const range = firebaseData.config?.range || {};
    frontendData.faixaHorario.dataInicio = range.start || toFirebaseDate(new Date());
    frontendData.faixaHorario.dataFim = range.end || toFirebaseDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    // Mantém o tipo original
    frontendData.tipo = tipo;

    return frontendData;
  }, [storeSettings]);

  // Função para verificar se uma data tem horários configurados
  const hasConfiguredSlots = (data, config) => {
    if (!data || !config) return false;
    const dateStr = toFirebaseDate(data);
    
    // Verifica em todas as configurações
    const hasInDataUnica = config.dataUnica?.horarios?.[dateStr]?.length > 0;
    const hasInFaixaHorario = config.faixaHorario?.horarios?.[dateStr]?.length > 0;
    
    // Verifica na configuração semanal
    const diaSemana = getDayString(getDayOfWeek(data));
    const hasInSemanal = config.semanal?.[diaSemana]?.ativo && 
                        config.semanal?.[diaSemana]?.horarios?.length > 0;
    
    return hasInDataUnica || hasInFaixaHorario || hasInSemanal;
  };

  // Função para obter horários de uma data específica
  const getHorariosData = (data, config) => {
    if (!data || !config) return [];
    const dateStr = toFirebaseDate(data);
    
    // Combina horários de todas as configurações
    const horariosDataUnica = config.dataUnica?.horarios?.[dateStr] || [];
    const horariosFaixaHorario = config.faixaHorario?.horarios?.[dateStr] || [];
    
    const diaSemana = getDayString(getDayOfWeek(data));
    const horariosSemanal = config.semanal?.[diaSemana]?.ativo ? 
                           (config.semanal?.[diaSemana]?.horarios || []) : 
                           [];
    
    // Remove duplicatas e ordena
    return [...new Set([...horariosDataUnica, ...horariosFaixaHorario, ...horariosSemanal])].sort();
  };

  useEffect(() => {
    const loadData = async () => {
      setInitialized(false);
      setLoading(true);

      if (!user) {
        setDisponibilidade(null);
        setCurrentConfig(null);
        setStoreSettings(null);
        setAvailableSlots(null);
        setHasChanges(false);
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const [settings, slots, data] = await Promise.all([
          availabilityService.getStoreSettings(),
          availabilityService.getAvailableSlots(),
          availabilityService.getUserAvailability(user.uid)
        ]);

        setStoreSettings(settings);
        setAvailableSlots(slots);

        if (data) {
          setDisponibilidade(data);
          const convertedData = convertFromFirebase(data);
          setCurrentConfig(convertedData);
        } else {
          const defaultConfig = createDefaultAvailability(settings);
          defaultConfig.tipo = 'semanal'; // Define tipo padrão
          setCurrentConfig(defaultConfig);
          setDisponibilidade(convertToFirebase(defaultConfig));
        }
        setHasChanges(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar configurações');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadData();
  }, [user]);

  // Função para salvar mudanças explicitamente
  const saveChanges = async () => {
    if (!user || !currentConfig || !hasChanges) return;

    try {
      setLoading(true);
      const firebaseData = convertToFirebase(currentConfig);
      await availabilityService.updateUserAvailability(user.uid, firebaseData);
      setDisponibilidade(firebaseData);
      setHasChanges(false);
      toast.success('Alterações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar a configuração atual (apenas localmente)
  const updateCurrentConfig = (updates) => {
    if (!initialized) return; // Previne atualizações antes da inicialização

    setCurrentConfig(prev => {
      if (!prev) return prev;

      const updatedConfig = typeof updates === 'function' ? updates(prev) : updates;
      
      // Mantém o tipo original se não for explicitamente alterado
      const tipo = updatedConfig.tipo ? 
        (updatedConfig.tipo === 'unica' ? 'dataUnica' : updatedConfig.tipo) : 
        prev.tipo;
      
      const newConfig = {
        ...prev,
        ...updatedConfig,
        tipo
      };

      // Marca que há mudanças não salvas apenas se houver diferenças reais
      const currentFirebaseData = convertToFirebase(prev);
      const newFirebaseData = convertToFirebase(newConfig);
      if (JSON.stringify(currentFirebaseData) !== JSON.stringify(newFirebaseData)) {
        setHasChanges(true);
      }

      return newConfig;
    });
  };

  // Função para verificar se houve alterações reais
  const hasRealChanges = (current, original) => {
    if (!current || !original) return false;

    // Verifica alterações baseado no tipo atual
    switch (current.tipo) {
      case 'dataUnica': {
        const currentDates = current.dataUnica?.horarios || {};
        const originalDates = original.config?.dates || {};
        
        // Compara apenas os horários configurados
        const allDates = new Set([...Object.keys(currentDates), ...Object.keys(originalDates)]);
        
        return Array.from(allDates).some(date => {
          const currentSlots = Array.isArray(currentDates[date]) ? currentDates[date] : [];
          const originalSlots = Array.isArray(originalDates[date]) ? originalDates[date] : [];
          return !arraysIguais([...currentSlots].sort(), [...originalSlots].sort());
        });
      }
      
      case 'semanal': {
        const currentSemanal = current.semanal || {};
        const originalSemanal = original.config?.weekDays || {};
        
        return DIAS_SEMANA.some(dia => {
          const currentDia = currentSemanal[dia] || { ativo: false, horarios: [] };
          const originalDia = originalSemanal[dia] || { active: false, slots: [] };
          
          // Compara apenas se houve mudança real nos horários ou no estado ativo
          const currentHorarios = Array.isArray(currentDia.horarios) ? [...currentDia.horarios] : [];
          const originalSlots = Array.isArray(originalDia.slots) ? [...originalDia.slots] : [];
          
          const horariosChanged = !arraysIguais(
            currentHorarios.sort(),
            originalSlots.sort()
          );
          const ativoChanged = currentDia.ativo !== originalDia.active;
          
          return horariosChanged || ativoChanged;
        });
      }
      
      case 'faixaHorario': {
        const currentRange = current.faixaHorario || {};
        const originalRange = original.config?.range || {};
        const originalDates = original.config?.dates || {};
        
        // Verifica mudanças nas datas do período
        const datesChanged = currentRange.dataInicio !== originalRange.start ||
                           currentRange.dataFim !== originalRange.end;
        
        // Verifica mudanças nos horários
        const currentHorarios = currentRange.horarios || {};
        const allDates = new Set([...Object.keys(currentHorarios), ...Object.keys(originalDates)]);
        const horariosChanged = Array.from(allDates).some(date => {
          const currentSlots = Array.isArray(currentHorarios[date]) ? [...currentHorarios[date]] : [];
          const originalSlots = Array.isArray(originalDates[date]) ? [...originalDates[date]] : [];
          return !arraysIguais(currentSlots.sort(), originalSlots.sort());
        });
        
        return datesChanged || horariosChanged;
      }
      
      default:
        return false;
    }
  };

  // Efeito para verificar alterações
  useEffect(() => {
    if (!initialized) return;
    
    const changes = hasRealChanges(currentConfig, disponibilidade);
    console.log('🔍 [DisponibilidadeContext] Verificando alterações:', {
      hasChanges: changes,
      currentConfig,
      disponibilidade
    });
    
    setHasChanges(changes);
  }, [currentConfig, disponibilidade, initialized]);

  const isReady = initialized && !loading && storeSettings && availableSlots;

  return (
    <DisponibilidadeContext.Provider 
      value={{ 
        disponibilidade,
        currentConfig,
        updateCurrentConfig,
        saveChanges,
        hasChanges,
        storeSettings,
        availableSlots,
        loading,
        isReady,
        initialized,
        hasConfiguredSlots,
        getHorariosData
      }}
    >
      {children}
    </DisponibilidadeContext.Provider>
  );
}

export const useDisponibilidade = () => useContext(DisponibilidadeContext); 