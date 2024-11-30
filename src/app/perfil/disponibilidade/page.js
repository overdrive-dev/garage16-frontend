'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDisponibilidade } from '@/contexts/DisponibilidadeContext';
import DataUnicaConfig from '@/components/disponibilidade/DataUnicaConfig';
import ConfiguracaoSemanal from '@/components/disponibilidade/ConfiguracaoSemanal';
import ConfiguracaoPersonalizada from '@/components/disponibilidade/ConfiguracaoPersonalizada';
import CalendarioPreview from '@/components/disponibilidade/CalendarioPreview';

const STORAGE_KEY = 'disponibilidade_draft';

export default function DisponibilidadePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { disponibilidade, updateDisponibilidade, loading } = useDisponibilidade();
  const [currentConfig, setCurrentConfig] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // Salva rascunho quando houver alterações
  useEffect(() => {
    if (currentConfig && JSON.stringify(currentConfig) !== JSON.stringify(disponibilidade)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
      setHasUnsavedChanges(true);
    }
  }, [currentConfig, disponibilidade]);

  const handleSave = async () => {
    await updateDisponibilidade(currentConfig);
    localStorage.removeItem(STORAGE_KEY);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentConfig(disponibilidade);
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
          <div className="mt-4 flex md:ml-4 md:mt-0 items-center space-x-4">
            {hasUnsavedChanges && (
              <span className="text-orange-400 text-sm">
                Você tem alterações não salvas
              </span>
            )}
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
              Salvar
            </button>
          </div>
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
    </main>
  );
} 