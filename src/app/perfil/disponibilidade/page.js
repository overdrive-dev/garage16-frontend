'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import DataUnicaConfig from '@/components/disponibilidade/DataUnicaConfig';
import ConfiguracaoSemanal from '@/components/disponibilidade/ConfiguracaoSemanal';
import ConfiguracaoFaixaHorario from '@/components/disponibilidade/ConfiguracaoFaixaHorario';

const estadoInicial = {
  tipo: 'unica',
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
  const { config, setConfig } = useDisponibilidade();
  const [currentConfig, setCurrentConfig] = useState(config || estadoInicial);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(currentConfig));
  }, [config, currentConfig]);

  const handleSave = () => {
    setConfig(currentConfig);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setCurrentConfig(config || estadoInicial);
    setHasChanges(false);
  };

  const handleNavigateAway = () => {
    setShowExitPrompt(false);
    router.back();
  };

  const handleConfirmNavigation = () => {
    handleSave();
    router.back();
  };

  const handleTipoChange = (tipo) => {
    setCurrentConfig(prev => ({
      ...prev,
      tipo
    }));
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold leading-7 text-gray-100 sm:text-3xl sm:tracking-tight">
            Configurações de Disponibilidade
          </h2>
          
          {/* Só mostra os botões e texto se houver alterações */}
          {hasChanges && (
            <div className="flex items-center justify-end space-x-4 border-t border-gray-700 pt-4">
              <span className="text-orange-400 text-sm">
                Você tem alterações não salvas
              </span>
              <button
                type="button"
                onClick={handleCancel}
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

        <div className="space-y-6">
          {/* Seleção do tipo de disponibilidade */}
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleTipoChange('unica')}
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
              onClick={() => handleTipoChange('semanal')}
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
              onClick={() => handleTipoChange('faixaHorario')}
              className={`p-4 rounded-lg border-2 transition-colors
                ${currentConfig.tipo === 'faixaHorario' 
                  ? 'border-orange-500 bg-orange-500/10' 
                  : 'border-gray-700 hover:border-gray-600'}`}
            >
              <div className="text-center">
                <span className="block font-medium text-gray-200">Período</span>
                <span className="text-sm text-gray-400">Defina início e fim</span>
              </div>
            </button>
          </div>

          {/* Conteúdo baseado no tipo selecionado */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            {currentConfig.tipo === 'unica' && (
              <DataUnicaConfig 
                datas={currentConfig.dataUnica?.horarios || {}}
                onChange={(updates) => {
                  setCurrentConfig(prev => ({
                    ...prev,
                    dataUnica: {
                      horarios: updates
                    }
                  }));
                }}
              />
            )}

            {currentConfig.tipo === 'semanal' && (
              <ConfiguracaoSemanal 
                horarios={currentConfig.semanal}
                onChange={(updates) => {
                  setCurrentConfig(prev => ({
                    ...prev,
                    semanal: updates
                  }));
                }}
              />
            )}

            {currentConfig.tipo === 'faixaHorario' && (
              <ConfiguracaoFaixaHorario 
                config={currentConfig.faixaHorario}
                onChange={(updates) => {
                  setCurrentConfig(prev => ({
                    ...prev,
                    faixaHorario: updates
                  }));
                }}
              />
            )}
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
                  onClick={handleCancel}
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