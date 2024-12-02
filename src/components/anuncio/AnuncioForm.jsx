'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { rascunhoService } from '@/services/rascunhoService';
import { debounce } from '@/utils/debounce';
import Image from 'next/image';

const anuncioPadrao = {
  marca: '',
  modelo: '',
  ano: '',
  preco: '',
  imagens: [],
  disponibilidade: null
};

export default function AnuncioForm({ tipo, anuncio, onSubmit, userId }) {
  const router = useRouter();
  const anuncioNormalizado = {
    ...anuncioPadrao,
    ...anuncio,
    marca: anuncio?.marca || '',
    modelo: anuncio?.modelo || '',
    ano: anuncio?.ano || '',
    preco: anuncio?.preco || '',
    imagens: anuncio?.imagens || [],
    cor: anuncio?.cor || '',
    km: anuncio?.km || '',
    descricao: anuncio?.descricao || ''
  };
  const [formData, setFormData] = useState(anuncioNormalizado);
  const [originalData, setOriginalData] = useState(anuncioNormalizado);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [previewImages, setPreviewImages] = useState([
    'https://placehold.co/800x600/1f2937/ffffff?text=Foto+1',
    'https://placehold.co/800x600/1f2937/ffffff?text=Foto+2',
    'https://placehold.co/800x600/1f2937/ffffff?text=Foto+3',
    'https://placehold.co/800x600/1f2937/ffffff?text=Foto+4'
  ]);

  // Verifica se é um rascunho pelo ID
  const isRascunho = anuncio?.id === '16'; // ID do rascunho no mock

  // Ajusta o título baseado no tipo e se é rascunho
  const getFormTitle = () => {
    if (tipo === 'rascunho') return 'Continuar Rascunho';
    if (tipo === 'novo') return 'Novo Anúncio';
    return 'Editar Anúncio';
  };

  // Ajusta o texto do botão
  const getSubmitButtonText = () => {
    if (saving) return 'Salvando...';
    if (tipo === 'rascunho') return 'Publicar Anúncio';
    if (tipo === 'novo') return 'Publicar Anúncio';
    return 'Salvar Alterações';
  };

  // Verifica se houve alterações
  useEffect(() => {
    const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasUnsavedChanges);
  }, [formData, originalData]);

  // Aviso ao tentar sair com alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja sair mesmo assim?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Carregar rascunho ao montar
  useEffect(() => {
    const loadRascunho = async () => {
      if (tipo === 'novo') {
        try {
          const rascunho = await rascunhoService.getRascunho(userId);
          if (rascunho) {
            setFormData(rascunho);
            setLastSaved(new Date(rascunho.updatedAt));
          }
        } catch (error) {
          console.error('Erro ao carregar rascunho:', error);
        }
      }
    };

    loadRascunho();
  }, [tipo, userId]);

  // Função de autosave com debounce
  const saveRascunho = useCallback(
    debounce(async (data) => {
      if (tipo === 'novo') {
        try {
          setSaving(true);
          await rascunhoService.saveRascunho(userId, data);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Erro ao salvar rascunho:', error);
        } finally {
          setSaving(false);
        }
      }
    }, 1000),
    [tipo, userId]
  );

  // Salvar rascunho quando o formData mudar
  useEffect(() => {
    if (formData) {
      saveRascunho(formData);
    }
  }, [formData, saveRascunho]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagemChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      imagens: [...prev.imagens, ...files]
    }));

    // Atualiza o preview das imagens
    setPreviewImages(prev => [...prev, ...newImages]);
  };

  // Limpar URLs dos objetos quando o componente for desmontado
  useEffect(() => {
    return () => {
      previewImages.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewImages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gerar slug manualmente
      const slug = `${formData.marca}-${formData.modelo}-${formData.ano}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Adicionar slug aos dados
      const anuncioData = {
        ...formData,
        slug
      };

      await onSubmit(anuncioData);
      setOriginalData(anuncioData); // Atualiza dados originais após salvar
      setHasChanges(false);
      router.push(`/veiculo/${anuncioData.slug}`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja descartar as alterações?')) {
        setFormData(originalData); // Reverte para dados originais
        setHasChanges(false);
      }
    } else {
      router.back();
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-100 sm:truncate sm:text-3xl sm:tracking-tight">
              {getFormTitle()}
            </h2>
          </div>
          
          {/* Indicador de alterações */}
          {hasChanges && (
            <div className="mt-4 flex md:ml-4 md:mt-0 items-center space-x-4">
              <span className="text-orange-400 text-sm">
                Você tem alterações não salvas
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção de Imagens */}
          <div className="space-y-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-100">
              Fotos do Veículo
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewImages.map((url, index) => (
                <div key={index} className="relative aspect-[4/3] group">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg border border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              <label className="relative aspect-[4/3] border-2 border-dashed border-gray-600 rounded-lg hover:border-orange-500 transition-colors cursor-pointer flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagemChange}
                  className="hidden"
                />
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="mt-2 block text-sm font-medium text-gray-400">
                    Adicionar foto
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Campos do formulário */}
          <div className="space-y-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-gray-100">
              Informações do Veículo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200">Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">Ano</label>
                <input
                  type="number"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200">Preço</label>
                <input
                  type="number"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Indicador de autosave */}
          {tipo === 'novo' && (
            <div className="text-sm text-gray-400">
              {saving ? (
                <span>Salvando rascunho...</span>
              ) : lastSaved ? (
                <span>
                  Último salvamento automático: {lastSaved.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-md transition-colors
                ${hasChanges 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 