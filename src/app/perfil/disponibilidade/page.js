'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import DataUnicaConfig from '@/components/disponibilidade/DataUnicaConfig';
import SemanalConfig from '@/components/disponibilidade/SemanalConfig';
import PeriodoConfig from '@/components/disponibilidade/PeriodoConfig';
import { format } from 'date-fns';

const estadoInicial = {
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

export default function DisponibilidadePage() {
  const router = useRouter();
  const { 
    disponibilidade, 
    currentConfig,
    updateCurrentConfig,
    hasChanges,
    saveChanges,
    loading 
  } = useDisponibilidade();
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!disponibilidade || !disponibilidade.config) return;

    console.log('🔄 [DisponibilidadePage] Inicializando estado com dados do Firebase:', {
      type: disponibilidade.type,
      config: disponibilidade.config,
      range: disponibilidade.config.range,
      dates: disponibilidade.config.dates
    });

    const estadoInicial = {
      tipo: disponibilidade.type,
      dataUnica: {
        horarios: disponibilidade.config.dates || {}
      },
      semanal: {},
      faixaHorario: {
        dataInicio: disponibilidade.config.range?.start || new Date().toISOString().split('T')[0],
        dataFim: disponibilidade.config.range?.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        horarios: disponibilidade.config.dates || {}
      }
    };

    ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].forEach(dia => {
      const configDia = disponibilidade.config.weekDays?.[dia] || {};
      estadoInicial.semanal[dia] = {
        ativo: configDia.active || false,
        horarios: configDia.slots || []
      };
    });

    console.log('✅ [DisponibilidadePage] Estado inicial criado:', {
      tipo: estadoInicial.tipo,
      dados: estadoInicial[estadoInicial.tipo],
      estadoCompleto: estadoInicial
    });
    
    updateCurrentConfig(estadoInicial);
  }, [disponibilidade]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveChanges();
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    updateCurrentConfig(disponibilidade || estadoInicial);
  };

  const handleNavigateAway = () => {
    setShowExitPrompt(false);
    router.back();
  };

  const handleConfirmNavigation = async () => {
    try {
      setIsSaving(true);
      await saveChanges();
      router.back();
    } catch (error) {
      console.error('Erro ao salvar disponibilidade:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTipoChange = (tipo) => {
    console.log('🔄 [DisponibilidadePage] Mudando tipo:', {
      tipoAtual: currentConfig?.tipo,
      novoTipo: tipo,
      currentConfig
    });

    if (!currentConfig) return;
    
    updateCurrentConfig(prev => ({
      ...prev,
      tipo
    }));
  };

  // Função para verificar se tem horários ativos em uma modalidade
  const temHorariosAtivos = (tipo) => {
    if (!disponibilidade) return false;

    console.log('🔍 [DisponibilidadePage] Verificando horários ativos:', {
      tipoVerificado: tipo,
      tipoAtual: disponibilidade.type,
      config: disponibilidade.config
    });

    // Verifica se é o tipo configurado no Firebase
    if (disponibilidade.type === tipo) {
      // Verifica se tem horários configurados baseado no tipo
      switch (tipo) {
        case 'dataUnica':
          return Object.keys(disponibilidade.config?.dates || {}).length > 0;
        case 'semanal':
          return Object.values(disponibilidade.config?.weekDays || {}).some(dia => 
            dia.active && Array.isArray(dia.slots) && dia.slots.length > 0
          );
        case 'faixaHorario':
          return disponibilidade.config?.range?.start && 
                 disponibilidade.config?.range?.end && 
                 Object.keys(disponibilidade.config?.dates || {}).length > 0;
        default:
          return false;
      }
    }
    return false;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentConfig && (
        <div className="space-y-8">
          {/* Cabeçalho */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold leading-7 text-gray-100 sm:text-3xl sm:tracking-tight">
              Configurações de Disponibilidade
            </h2>
            
            {/* Só mostra os botões se houver mudanças reais */}
            {hasChanges && (
              <div className="flex items-center justify-end space-x-4 border-t border-gray-700 pt-4">
                <span className="text-orange-400 text-sm">
                  Você tem alterações não salvas
                </span>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    'Confirmar Horários'
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Seleção do tipo de disponibilidade */}
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleTipoChange('dataUnica')}
                className={`relative p-4 rounded-lg border-2 transition-colors
                  ${currentConfig.tipo === 'dataUnica' 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-700 hover:border-gray-600'}`}
              >
                <div className="text-center">
                  <span className="block font-medium text-gray-200">Data Única</span>
                  <span className="text-sm text-gray-400">Sem repetição</span>
                </div>
                {temHorariosAtivos('dataUnica') && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Ativo
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange('semanal')}
                className={`relative p-4 rounded-lg border-2 transition-colors
                  ${currentConfig.tipo === 'semanal' 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-700 hover:border-gray-600'}`}
              >
                <div className="text-center">
                  <span className="block font-medium text-gray-200">Semanal</span>
                  <span className="text-sm text-gray-400">Repete toda semana</span>
                </div>
                {temHorariosAtivos('semanal') && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Ativo
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange('faixaHorario')}
                className={`relative p-4 rounded-lg border-2 transition-colors
                  ${currentConfig.tipo === 'faixaHorario' 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-700 hover:border-gray-600'}`}
              >
                <div className="text-center">
                  <span className="block font-medium text-gray-200">Período</span>
                  <span className="text-sm text-gray-400">Defina início e fim</span>
                </div>
                {temHorariosAtivos('faixaHorario') && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Ativo
                  </span>
                )}
              </button>
            </div>

            {/* Conteúdo baseado no tipo selecionado */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              {currentConfig.tipo === 'dataUnica' && (
                <DataUnicaConfig 
                  datas={currentConfig.dataUnica}
                  ultimoHorario={[]}
                  onChange={(novasHorarios) => {
                    console.log('📝 [DisponibilidadePage] Atualizando horários data única:', novasHorarios);
                    updateCurrentConfig(prev => ({
                      ...prev,
                      dataUnica: {
                        horarios: novasHorarios
                      }
                    }));
                  }}
                />
              )}

              {currentConfig.tipo === 'semanal' && (
                <SemanalConfig 
                  horarios={currentConfig.semanal}
                  ultimoHorario={[]}
                  onChange={(updates) => {
                    console.log('📝 [DisponibilidadePage] Atualizando horários semanais:', updates);
                    updateCurrentConfig(prev => ({
                      ...prev,
                      semanal: updates
                    }));
                  }}
                />
              )}

              {currentConfig.tipo === 'faixaHorario' && (
                <>
                  {console.log('🎯 [DisponibilidadePage] Renderizando PeriodoConfig:', {
                    horarios: currentConfig.faixaHorario?.horarios,
                    dataInicio: currentConfig.faixaHorario?.dataInicio,
                    dataFim: currentConfig.faixaHorario?.dataFim
                  })}
                  <PeriodoConfig 
                    datas={currentConfig.faixaHorario?.horarios || {}}
                    selectedPeriod={{
                      from: new Date(currentConfig.faixaHorario?.dataInicio),
                      to: new Date(currentConfig.faixaHorario?.dataFim)
                    }}
                    isRangeDefined={true}
                    ultimoHorario={[]}
                    onChange={(updates) => {
                      console.log('📝 [DisponibilidadePage] Atualizando horários período:', {
                        updates,
                        configAtual: currentConfig.faixaHorario
                      });

                      updateCurrentConfig(prev => ({
                        ...prev,
                        faixaHorario: {
                          ...prev.faixaHorario,
                          horarios: updates
                        }
                      }));
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Saída */}
      {hasChanges && (
        <Dialog
          open={showExitPrompt}
          onClose={() => setShowExitPrompt(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium text-gray-100 mb-4">
                Alterações não salvas
              </Dialog.Title>

              <p className="text-gray-300 mb-6">
                Você tem alterações não salvas na sua disponibilidade. 
                O que deseja fazer?
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Continuar editando
                </button>
                <button
                  type="button"
                  onClick={handleNavigateAway}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                  Sair sem salvar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmNavigation}
                  disabled={isSaving}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    'Salvar e sair'
                  )}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </main>
  );
} 