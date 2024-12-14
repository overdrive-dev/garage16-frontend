'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { availabilityService } from '@/services/availabilityService';
import { toast } from '@/components/ui/toast';

// Função auxiliar para comparar arrays
const arraysIguais = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
};

const DisponibilidadeContext = createContext({});

const disponibilidadePadrao = {
  tipo: 'semanal',
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
  defaultData.tipo = 'semanal'; // Garante que o tipo seja sempre definido
  
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
  console.log('Convertendo dados do frontend:', frontendData);

  const firebaseData = {
    availableDays: {
      type: frontendData.tipo,  // Não precisa mais normalizar o tipo
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
    // Converte configuração semanal padrão
    Object.entries(frontendData.semanal).forEach(([dia, config]) => {
      firebaseData.availableDays.config.weekDays[dia] = {
        active: config.ativo,
        slots: config.horarios
      };
    });
  }
  else if (frontendData.tipo === 'dataUnica') {
    // Converte datas únicas
    Object.entries(frontendData.dataUnica.horarios).forEach(([data, horarios]) => {
      if (horarios.length > 0) {
        firebaseData.availableDays.config.dates[data] = horarios;
      }
    });
  }
  else if (frontendData.tipo === 'faixaHorario') {
    // Converte faixa de horário
    firebaseData.availableDays.config.range = {
      start: frontendData.faixaHorario.dataInicio,
      end: frontendData.faixaHorario.dataFim
    };

    // Processa os horários padrão do range
    Object.entries(frontendData.faixaHorario.horarios).forEach(([data, horarios]) => {
      if (horarios.length > 0) {
        firebaseData.availableDays.config.dates[data] = horarios;
      }
    });
  }

  console.log('Dados convertidos para Firebase:', firebaseData);
  return firebaseData;
};

// Função auxiliar para converter do Firebase para o frontend
const convertFromFirebase = (firebaseData, storeSettings) => {
  console.log('Convertendo dados do Firebase:', firebaseData);
  console.log('Configurações da loja:', storeSettings);

  // Se não houver dados, retorna o padrão baseado nas configurações da loja
  if (!firebaseData?.availableDays) return createDefaultAvailability(storeSettings);

  const frontendData = {
    tipo: firebaseData.availableDays.type || 'semanal',
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

  // Função auxiliar para verificar se um dia está disponível na loja
  const isDiaDisponivelNaLoja = (diaSemana) => {
    const diaConfig = storeSettings?.weekDays?.[diaSemana];
    return diaConfig?.active !== false && diaConfig?.slots?.length > 0;
  };

  // Função auxiliar para verificar se um horário está disponível na loja
  const isHorarioDisponivelNaLoja = (diaSemana, horario) => {
    return storeSettings?.weekDays?.[diaSemana]?.slots?.includes(horario);
  };

  // Converte configuração semanal
  if (firebaseData.availableDays.type === 'semanal') {
    // Converte configuração padrão dos dias da semana
    Object.entries(firebaseData.availableDays.config.weekDays).forEach(([dia, config]) => {
      // Verifica se o dia está disponível na loja
      const diaEstaDisponivel = isDiaDisponivelNaLoja(dia);
      
      // Filtra os horários do usuário para manter apenas os que estão disponíveis na loja
      const horariosPermitidos = config.slots.filter(horario => 
        isHorarioDisponivelNaLoja(dia, horario)
      );
      
      frontendData.semanal[dia] = {
        ativo: diaEstaDisponivel && config.active && horariosPermitidos.length > 0,
        horarios: diaEstaDisponivel ? horariosPermitidos : []
      };
    });
  }
  // Converte datas únicas
  else if (firebaseData.availableDays.type === 'dataUnica') {
    Object.entries(firebaseData.availableDays.config.dates).forEach(([data, slots]) => {
      // Verifica se a data está bloqueada nas configurações da loja
      const dataEstaDisponivel = !storeSettings?.blockedDates?.includes(data);
      
      if (dataEstaDisponivel) {
        // Pega o dia da semana desta data
        const diaDaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][new Date(data).getDay()];
        
        // Verifica se o dia da semana está disponível
        if (isDiaDisponivelNaLoja(diaDaSemana)) {
          // Filtra os horários para manter apenas os que estão disponíveis na loja
          const horariosPermitidos = slots.filter(horario => 
            isHorarioDisponivelNaLoja(diaDaSemana, horario)
          );
          
          if (horariosPermitidos.length > 0) {
            frontendData.dataUnica.horarios[data] = horariosPermitidos;
          }
        }
      }
    });
  }
  // Converte faixa de horário
  else if (firebaseData.availableDays.type === 'faixaHorario') {
    frontendData.faixaHorario = {
      dataInicio: firebaseData.availableDays.config.range.start,
      dataFim: firebaseData.availableDays.config.range.end,
      horarios: {}
    };

    // Processa os horários padrão
    Object.entries(firebaseData.availableDays.config.dates || {}).forEach(([data, slots]) => {
      // Verifica se a data está bloqueada nas configurações da loja
      const dataEstaDisponivel = !storeSettings?.blockedDates?.includes(data);
      
      if (dataEstaDisponivel) {
        // Pega o dia da semana desta data
        const diaDaSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][new Date(data).getDay()];
        
        // Verifica se o dia da semana está disponível
        if (isDiaDisponivelNaLoja(diaDaSemana)) {
          // Filtra os horários para manter apenas os que estão disponíveis na loja
          const horariosPermitidos = slots.filter(horario => 
            isHorarioDisponivelNaLoja(diaDaSemana, horario)
          );
          
          if (horariosPermitidos.length > 0) {
            frontendData.faixaHorario.horarios[data] = horariosPermitidos;
          }
        }
      }
    });
  }

  console.log('Dados convertidos para frontend:', frontendData);
  return frontendData;
};

export function DisponibilidadeProvider({ children }) {
  const { user } = useAuth();
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega slots disponíveis
  useEffect(() => {
    const loadAvailableSlots = async () => {
      try {
        const { slots } = await availabilityService.getAvailableSlots();
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Erro ao carregar slots disponíveis:', error);
      }
    };

    loadAvailableSlots();
  }, []);

  // Quando as configurações da loja são carregadas, atualiza o currentConfig inicial
  useEffect(() => {
    if (storeSettings) {
      setCurrentConfig(createDefaultAvailability(storeSettings));
    }
  }, [storeSettings]);

  // Quando a disponibilidade é carregada, atualiza o currentConfig
  useEffect(() => {
    if (disponibilidade) {
      setCurrentConfig(disponibilidade);
    }
  }, [disponibilidade]);

  // Verifica se há mudanças sempre que currentConfig mudar
  useEffect(() => {
    if (!disponibilidade || !currentConfig) return;

    const hasRealChanges = (() => {
      // Se não houver disponibilidade salva, compara com o padrão
      const disponibilidadeAtual = disponibilidade || disponibilidadePadrao;

      console.log('[DEBUG] Verificando mudanças:', {
        tipo: currentConfig.tipo,
        tipoAtual: disponibilidadeAtual.tipo,
        currentConfig,
        disponibilidadeAtual
      });

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
          const horarios = currentConfig.dataUnica.horarios || {};
          temHorarios = Object.values(horarios).some(slots => 
            Array.isArray(slots) && slots.length > 0
          );
          console.log('[DEBUG] Verificando horários em dataUnica:', {
            horarios,
            temHorarios
          });
        }
        else if (currentConfig.tipo === 'faixaHorario') {
          temHorarios = Object.values(currentConfig.faixaHorario.horarios || {}).some(horarios => 
            Array.isArray(horarios) && horarios.length > 0
          );
        }

        console.log('[DEBUG] Mudou tipo:', {
          de: disponibilidadeAtual.tipo,
          para: currentConfig.tipo,
          temHorarios
        });

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
          const horariosAtuais = disponibilidadeAtual.dataUnica.horarios || {};
          const horariosNovos = currentConfig.dataUnica.horarios || {};
          
          console.log('[DEBUG] Comparando horários em dataUnica:', {
            horariosAtuais,
            horariosNovos
          });

          // Se tem horários diferentes
          if (Object.keys(horariosAtuais).length !== Object.keys(horariosNovos).length) {
            return true;
          }

          // Compara cada data
          return Object.keys(horariosNovos).some(data => {
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

    console.log('[DEBUG] Resultado final hasChanges:', hasRealChanges);
    setHasChanges(hasRealChanges);
  }, [disponibilidade, currentConfig]);

  // Carrega configurações da loja
  useEffect(() => {
    const loadStoreSettings = async () => {
      try {
        const settings = await availabilityService.getStoreSettings();
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
      try {
        if (user) {
          console.log('fetchDisponibilidade - Iniciando carregamento para usu��rio:', user.uid);
          const data = await availabilityService.getUserAvailability(user.uid);
          console.log('fetchDisponibilidade - Dados recebidos do Firebase:', data);
          
          // Passa as configurações da loja para a função de conversão
          const convertedData = convertFromFirebase(data, storeSettings);
          console.log('fetchDisponibilidade - Dados convertidos para frontend:', convertedData);
          
          setDisponibilidade(convertedData);
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
  }, [user, storeSettings]); // Adiciona storeSettings como dependência

  const updateCurrentConfig = (updates) => {
    console.log('[DEBUG] updateCurrentConfig:', {
      currentConfig,
      updates: typeof updates === 'function' ? updates(currentConfig) : updates
    });

    setCurrentConfig(prev => {
      // Se for uma função, executa ela
      const updatedConfig = typeof updates === 'function' ? updates(prev) : updates;
      
      // Normaliza o tipo para 'dataUnica' se for 'unica'
      const tipo = updatedConfig.tipo === 'unica' ? 'dataUnica' : (updatedConfig.tipo || prev.tipo);
      
      const newConfig = {
        ...prev,
        ...updatedConfig,
        tipo
      };

      console.log('[DEBUG] Novo currentConfig:', newConfig);
      return newConfig;
    });
  };

  const updateDisponibilidade = async (novaDisponibilidade) => {
    try {
      if (user) {
        console.log('updateDisponibilidade - Iniciando atualização com dados:', novaDisponibilidade);
        
        const firebaseData = convertToFirebase(novaDisponibilidade);
        console.log('updateDisponibilidade - Dados convertidos para Firebase:', firebaseData);
        
        await availabilityService.updateUserAvailability(user.uid, firebaseData);
        console.log('updateDisponibilidade - Dados salvos no Firebase');
        
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