'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import DataUnicaConfig from '@/components/disponibilidade/DataUnicaConfig';
import ConfiguracaoSemanal from '@/components/disponibilidade/ConfiguracaoSemanal';
import ConfiguracaoPersonalizada from '@/components/disponibilidade/ConfiguracaoPersonalizada';
import CalendarioPreview from '@/components/disponibilidade/CalendarioPreview';
import { Dialog } from '@headlessui/react';

const STORAGE_KEY = 'disponibilidade_draft';

export default function DisponibilidadePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { disponibilidade, updateDisponibilidade, loading } = useDisponibilidade();
  const [currentConfig, setCurrentConfig] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Carrega configuração inicial e verifica se há rascunho
  useEffect(() => {
    if (disponibilidade) {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setCurrentConfig(parsedDraft);
        setHasUnsavedChanges(true);
      } else {
        setCurrentConfig(disponibilidade);
      }
    }
  }, [disponibilidade]);

  // Verifica se houve alterações comparando com a versão salva
  const hasChanges = JSON.stringify(currentConfig) !== JSON.stringify(disponibilidade);

  // Atualiza o estado de alterações não salvas quando houver mudanças
  useEffect(() => {
    if (currentConfig) {
      const hasChanges = JSON.stringify(currentConfig) !== JSON.stringify(disponibilidade);
      setHasUnsavedChanges(hasChanges);
      
      // Se houver alterações, salva no localStorage
      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [currentConfig, disponibilidade]);

  // Intercepta navegações
  useEffect(() => {
    let blockNavigation = false;

    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja sair mesmo assim?';
        return e.returnValue;
      }
    };

    // Intercepta cliques em links
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      // Ignora links externos ou âncoras
      if (
        !link.href ||
        link.target === '_blank' ||
        link.href.startsWith('tel:') ||
        link.href.startsWith('mailto:') ||
        link.href.includes('#')
      ) return;

      try {
        const url = new URL(link.href);
        // Só intercepta navegação interna
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          if (hasChanges && !blockNavigation) {
            e.preventDefault();
            setPendingNavigation(url.pathname);
            setShowExitPrompt(true);
          }
        }
      } catch (error) {
        console.error('Erro ao processar URL:', error);
      }
    };

    // Intercepta navegação programática
    const handlePushState = () => {
      if (hasChanges && !blockNavigation) {
        setPendingNavigation(window.location.pathname);
        setShowExitPrompt(true);
        throw 'Navigation aborted';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePushState);

    // Patch router.push
    const originalPush = router.push;
    router.push = (...args) => {
      if (hasChanges && !blockNavigation) {
        setPendingNavigation(args[0]);
        setShowExitPrompt(true);
        return;
      }
      return originalPush.apply(router, args);
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePushState);
      router.push = originalPush;
    };
  }, [hasChanges, pathname, router]);

  const handleConfirmNavigation = async () => {
    try {
      await handleSave();
      if (pendingNavigation) {
        router.push(pendingNavigation);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setShowExitPrompt(false);
      setPendingNavigation(null);
    }
  };

  const handleNavigateAway = () => {
    const destination = pendingNavigation;
    setShowExitPrompt(false);
    setPendingNavigation(null);
    if (destination) {
      // Pequeno delay para garantir que o modal fechou
      setTimeout(() => {
        router.push(destination);
      }, 100);
    }
  };

  const handleSave = async () => {
    await updateDisponibilidade(currentConfig);
    localStorage.removeItem(STORAGE_KEY);
    setHasUnsavedChanges(false);
  };

  if (loading || !currentConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
              Configurações de Disponibilidade
            </h2>
          </div>
          
          {/* Só mostra os botões e texto se houver alterações */}
          {hasChanges && (
            <div className="mt-4 flex md:ml-4 md:mt-0 items-center space-x-4">
              <span className="text-orange-400 text-sm">
                Você tem alterações não salvas
              </span>
              <button
                type="button"
                onClick={handleNavigateAway}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Confirmar Horários
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
          {/* Coluna de Configurações */}
          <div className="space-y-8">
            {/* Bloco de Disponibilidade */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="space-y-6">
                {/* Seleção do tipo de disponibilidade */}
                <div>
                  <h3 className="text-lg font-medium text-gray-100 mb-4">
                    Disponibilidade geral
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentConfig({ 
                        ...currentConfig, 
                        tipo: 'unica' 
                      })}
                      className={`p-4 rounded-lg border-2 transition-colors
                        ${currentConfig.tipo === 'unica' 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-gray-700 hover:border-gray-600'}`}
                    >
                      <div className="text-center">
                        <span className="block font-medium text-gray-200">Data Única</span>
                        <span className="text-sm text-gray-400">Sem repetição</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentConfig({ 
                        ...currentConfig, 
                        tipo: 'semanal' 
                      })}
                      className={`p-4 rounded-lg border-2 transition-colors
                        ${currentConfig.tipo === 'semanal' 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-gray-700 hover:border-gray-600'}`}
                    >
                      <div className="text-center">
                        <span className="block font-medium text-gray-200">Semanal</span>
                        <span className="text-sm text-gray-400">Repete toda semana</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentConfig({ 
                        ...currentConfig, 
                        tipo: 'personalizada' 
                      })}
                      className={`p-4 rounded-lg border-2 transition-colors
                        ${currentConfig.tipo === 'personalizada' 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-gray-700 hover:border-gray-600'}`}
                    >
                      <div className="text-center">
                        <span className="block font-medium text-gray-200">Personalizada</span>
                        <span className="text-sm text-gray-400">Configure o período</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Conteúdo baseado no tipo selecionado */}
                <div className="mt-6">
                  {currentConfig.tipo === 'unica' && (
                    <DataUnicaConfig 
                      datas={currentConfig.dataUnica}
                      onChange={(updates) => {
                        setCurrentConfig({
                          ...currentConfig,
                          dataUnica: updates
                        });
                      }}
                    />
                  )}

                  {currentConfig.tipo === 'semanal' && (
                    <ConfiguracaoSemanal 
                      horarios={currentConfig.semanal}
                      onChange={(updates) => {
                        setCurrentConfig({
                          ...currentConfig,
                          semanal: updates
                        });
                      }}
                    />
                  )}

                  {currentConfig.tipo === 'personalizada' && (
                    <ConfiguracaoPersonalizada 
                      config={currentConfig.personalizada}
                      onChange={(updates) => {
                        setCurrentConfig({
                          ...currentConfig,
                          personalizada: updates
                        });
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna do Calendário */}
          <div className="lg:sticky lg:top-8 self-start">
            <CalendarioPreview 
              config={currentConfig} 
              onChange={setCurrentConfig}
            />
          </div>
        </div>
      </div>

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
                  onClick={handleNavigateAway}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Continuar editando
                </button>
                <button
                  type="button"
                  onClick={handleNavigateAway}
                  className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition-colors"
                >
                  Sair sem salvar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmNavigation}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  Salvar e sair
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </main>
  );
} 