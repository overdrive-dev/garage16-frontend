'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { availabilityService } from '@/services/availabilityService';
import { toast } from '@/components/ui/toast';

const DisponibilidadeContext = createContext({});

const disponibilidadePadrao = {
  tipo: 'semanal',
  dataUnica: {
    horarios: {},
    ultimoHorario: []
  },
  semanal: {
    dom: { ativo: false, horarios: [] },
    seg: { ativo: false, horarios: [] },
    ter: { ativo: false, horarios: [] },
    qua: { ativo: false, horarios: [] },
    qui: { ativo: false, horarios: [] },
    sex: { ativo: false, horarios: [] },
    sab: { ativo: false, horarios: [] },
    ultimoHorario: []
  },
  faixaHorario: {
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    horarios: {},
    ultimoHorario: []
  }
};

// Função auxiliar para converter disponibilidade do formato do Firebase para o frontend
const convertFromFirebase = (firebaseData) => {
  if (!firebaseData?.availableDays) return disponibilidadePadrao;

  console.log('convertFromFirebase - Dados recebidos:', firebaseData);

  // Pega o tipo de agendamento do Firebase ou usa o padrão 'semanal'
  // Prioriza scheduleType, mas usa activeType se scheduleType não existir
  const scheduleType = firebaseData.availableDays.scheduleType || 
                      firebaseData.availableDays.activeType || 
                      'semanal';

  console.log('convertFromFirebase - Tipo detectado:', scheduleType);

  // Prepara a estrutura de data única
  const dataUnica = {
    horarios: {}
  };

  // Prepara a estrutura semanal com todos os dias inativos
  const semanal = {
    dom: { ativo: false, horarios: [] },
    seg: { ativo: false, horarios: [] },
    ter: { ativo: false, horarios: [] },
    qua: { ativo: false, horarios: [] },
    qui: { ativo: false, horarios: [] },
    sex: { ativo: false, horarios: [] },
    sab: { ativo: false, horarios: [] }
  };

  // Se houver datas configuradas, converte para o formato apropriado
  const todasDatas = Object.entries(firebaseData.availableDays)
    .filter(([key, data]) => key !== 'scheduleType' && key !== 'activeType' && data.slots?.length > 0)
    .sort((a, b) => new Date(b[0]) - new Date(a[0])); // Ordena por data, mais recente primeiro

  console.log('convertFromFirebase - Datas encontradas:', todasDatas.length);

  // Pega o último horário configurado (o mais recente)
  const ultimoHorario = todasDatas[0]?.[1].slots || [];

  // Se for semanal, primeiro identifica quais dias da semana têm horários
  if (scheduleType === 'semanal') {
    // Cria um mapa dos dias da semana com seus horários
    const diasDaSemana = {
      dom: { ativo: false, horarios: [] },
      seg: { ativo: false, horarios: [] },
      ter: { ativo: false, horarios: [] },
      qua: { ativo: false, horarios: [] },
      qui: { ativo: false, horarios: [] },
      sex: { ativo: false, horarios: [] },
      sab: { ativo: false, horarios: [] }
    };

    // Para cada data no Firebase, marca o dia da semana correspondente como ativo
    todasDatas.forEach(([date, data]) => {
      const dayOfWeek = new Date(date).getDay();
      const weekDay = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][dayOfWeek];
      
      // Se já não estiver configurado, configura o dia
      if (!diasDaSemana[weekDay].ativo) {
        diasDaSemana[weekDay] = {
          ativo: true,
          horarios: data.slots
        };
      }
    });

    // Atualiza a estrutura semanal com os dias ativos
    Object.assign(semanal, diasDaSemana);
  }
  // Para outros tipos, processa normalmente
  else if (scheduleType === 'dataUnica') {
    todasDatas.forEach(([date, data]) => {
      dataUnica.horarios[date] = data.slots;
    });
  }

  // Prepara a estrutura de faixa de horário
  const hoje = new Date();
  const proximaSemana = new Date();
  proximaSemana.setDate(hoje.getDate() + 7);

  const faixaHorario = {
    dataInicio: hoje.toISOString().split('T')[0],
    dataFim: proximaSemana.toISOString().split('T')[0],
    horarios: {}
  };

  // Se houver datas configuradas para faixa de horário, usa elas
  if (scheduleType === 'faixaHorario' && todasDatas.length > 0) {
    faixaHorario.dataInicio = todasDatas[todasDatas.length - 1][0]; // Primeira data
    faixaHorario.dataFim = todasDatas[0][0]; // Última data

    // Preenche os horários com as datas
    todasDatas.forEach(([date, data]) => {
      faixaHorario.horarios[date] = data.slots;
    });
  }

  const result = {
    tipo: scheduleType,
    semanal: {
      ...semanal,
      ultimoHorario
    },
    dataUnica: {
      ...dataUnica,
      ultimoHorario
    },
    faixaHorario: {
      ...faixaHorario,
      ultimoHorario
    }
  };

  console.log('convertFromFirebase - Resultado final:', result);
  return result;
};

// Função auxiliar para converter disponibilidade do formato do frontend para o Firebase
const convertToFirebase = (frontendData) => {
  console.log('convertToFirebase - Dados recebidos:', frontendData);

  // Primeiro, limpa todos os dados existentes
  const availableDays = {
    scheduleType: frontendData.tipo,
    // Remove o activeType se existir
    activeType: null
  };

  // Se for configuração semanal
  if (frontendData.tipo === 'semanal') {
    console.log('convertToFirebase - Processando modo semanal');
    // Para os próximos 30 dias
    const hoje = new Date();
    const datas = [];

    // Primeiro, gera todas as datas dos próximos 30 dias
    for (let i = 0; i < 30; i++) {
      const date = new Date(hoje);
      date.setDate(hoje.getDate() + i);
      datas.push(date);
    }

    // Depois, para cada data, verifica se o dia da semana está ativo
    datas.forEach(date => {
      const weekDay = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][date.getDay()];
      const diaSemana = frontendData.semanal[weekDay];
      const dateStr = date.toISOString().split('T')[0];

      // Só adiciona se o dia estiver ativo E tiver horários
      if (diaSemana?.ativo && diaSemana.horarios?.length > 0) {
        availableDays[dateStr] = {
          slots: diaSemana.horarios
        };
      }
    });
    console.log('convertToFirebase - Dados processados para semanal:', availableDays);
  }
  // Se for data única
  else if (frontendData.tipo === 'dataUnica') {
    // Limpa todos os dados existentes primeiro
    Object.entries(frontendData.dataUnica.horarios || {}).forEach(([date, horarios]) => {
      if (horarios?.length > 0) {
        availableDays[date] = {
          slots: horarios
        };
      }
    });
  }
  // Se for faixa de horário
  else if (frontendData.tipo === 'faixaHorario') {
    const start = new Date(frontendData.faixaHorario.dataInicio);
    const end = new Date(frontendData.faixaHorario.dataFim);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const horarios = frontendData.faixaHorario.horarios[dateStr];
      
      if (horarios?.length > 0) {
        availableDays[dateStr] = {
          slots: horarios
        };
      }
    }
  }

  // Remove o activeType se for null
  if (availableDays.activeType === null) {
    delete availableDays.activeType;
  }

  console.log('convertToFirebase - Dados finais para Firebase:', availableDays);
  return availableDays;
};

export function DisponibilidadeProvider({ children }) {
  const { user } = useAuth();
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(disponibilidadePadrao);
  const [hasChanges, setHasChanges] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [loading, setLoading] = useState(true);

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

      // Se mudou o tipo, verifica se tem horários configurados no novo tipo
      if (currentConfig.tipo !== disponibilidadeAtual.tipo) {
        let temHorarios = false;

        if (currentConfig.tipo === 'semanal') {
          temHorarios = Object.values(currentConfig.semanal).some(dia => 
            dia.ativo && dia.horarios.length > 0
          );
        }
        else if (currentConfig.tipo === 'dataUnica') {
          temHorarios = Object.values(currentConfig.dataUnica.horarios || {}).some(horarios => 
            horarios && horarios.length > 0
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
      if (currentConfig.tipo === disponibilidadeAtual.tipo) {
        if (currentConfig.tipo === 'dataUnica') {
          // Converte os objetos para strings para comparação
          const horariosAtuaisStr = JSON.stringify(disponibilidadeAtual.dataUnica.horarios || {});
          const horariosNovosStr = JSON.stringify(currentConfig.dataUnica.horarios || {});
          return horariosAtuaisStr !== horariosNovosStr;
        }
        else if (currentConfig.tipo === 'semanal') {
          // Converte os objetos para strings para comparação
          const horariosAtuaisStr = JSON.stringify(disponibilidadeAtual.semanal);
          const horariosNovosStr = JSON.stringify(currentConfig.semanal);
          return horariosAtuaisStr !== horariosNovosStr;
        }
        else if (currentConfig.tipo === 'faixaHorario') {
          // Compara datas de início e fim
          if (currentConfig.faixaHorario.dataInicio !== disponibilidadeAtual.faixaHorario.dataInicio ||
              currentConfig.faixaHorario.dataFim !== disponibilidadeAtual.faixaHorario.dataFim) {
            return true;
          }

          // Converte os objetos para strings para comparação
          const horariosAtuaisStr = JSON.stringify(disponibilidadeAtual.faixaHorario.horarios || {});
          const horariosNovosStr = JSON.stringify(currentConfig.faixaHorario.horarios || {});
          return horariosAtuaisStr !== horariosNovosStr;
        }
      }

      return false;
    })();

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
          console.log('fetchDisponibilidade - Iniciando carregamento para usuário:', user.uid);
          const data = await availabilityService.getUserAvailability(user.uid);
          console.log('fetchDisponibilidade - Dados recebidos do Firebase:', data);
          
          const convertedData = convertFromFirebase(data);
          console.log('fetchDisponibilidade - Dados convertidos para frontend:', convertedData);
          
          setDisponibilidade(convertedData);
        }
      } catch (error) {
        console.error('Erro ao carregar disponibilidade:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisponibilidade();
  }, [user]);

  const updateCurrentConfig = (updates) => {
    setCurrentConfig(typeof updates === 'function' 
      ? updates(currentConfig) 
      : { ...currentConfig, ...updates }
    );
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
        loading 
      }}
    >
      {children}
    </DisponibilidadeContext.Provider>
  );
}

export const useDisponibilidade = () => useContext(DisponibilidadeContext); 