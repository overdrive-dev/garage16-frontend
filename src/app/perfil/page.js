'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Breadcrumb from '@/components/Breadcrumb';
import UserAvatar from '@/components/UserAvatar';
import ListaEnderecos from '@/components/ListaEnderecos';

export default function PerfilPage() {
  const { user, updateUserProfile, saveEndereco, deleteEndereco } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || user?.displayName || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    notificacoes: {
      email: user?.notificacoes?.email ?? true,
      whatsapp: user?.notificacoes?.whatsapp ?? true
    }
  });

  // Atualiza o formData quando o user mudar
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || user.displayName || '',
        email: user.email || '',
        whatsapp: user.whatsapp || '',
        notificacoes: {
          email: user.notificacoes?.email ?? true,
          whatsapp: user.notificacoes?.whatsapp ?? true
        }
      });
    }
  }, [user]);

  // Função de salvamento com debounce
  const debouncedSave = useCallback(
    async (data) => {
      setLoading(true);
      try {
        await updateUserProfile(data);
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      } finally {
        setLoading(false);
      }
    },
    [updateUserProfile]
  );

  // Efeito para salvar automaticamente quando houver mudanças
  useEffect(() => {
    const hasChanges = 
      formData.nome !== (user?.nome || user?.displayName) ||
      formData.whatsapp !== user?.whatsapp ||
      formData.notificacoes.email !== user?.notificacoes?.email ||
      formData.notificacoes.whatsapp !== user?.notificacoes?.whatsapp;

    if (hasChanges && user) {
      const timeoutId = setTimeout(() => {
        debouncedSave(formData);
      }, 1000); // Aguarda 1 segundo após a última alteração

      return () => clearTimeout(timeoutId);
    }
  }, [formData, user, debouncedSave]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Perfil' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notificacoes.')) {
      const notificationType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notificacoes: {
          ...prev.notificacoes,
          [notificationType]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="w-full mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="max-w-3xl mx-auto p-6">
          <div className="space-y-8">
            {/* Header com Avatar */}
            <div className="flex items-center space-x-6">
              <UserAvatar user={user} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.displayName}</h1>
                <p className="text-gray-400">Membro desde {new Date(user?.metadata?.creationTime).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Informações Pessoais */}
              <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">Informações Pessoais</h2>
                  {loading && (
                    <span className="text-sm text-gray-400">Salvando...</span>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200">Nome</label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Email - Desabilitado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200">WhatsApp</label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Preferências de Notificação */}
                  <div className="space-y-4 pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-medium text-white">Preferências de Notificação</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="notificacoes.email"
                          checked={formData.notificacoes.email}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                        />
                        <label className="ml-2 block text-sm text-gray-200">
                          Receber notificações por email
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="notificacoes.whatsapp"
                          checked={formData.notificacoes.whatsapp}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                        />
                        <label className="ml-2 block text-sm text-gray-200">
                          Receber notificações por WhatsApp
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Endereços */}
              <div className="bg-gray-800 rounded-lg p-6">
                <ListaEnderecos
                  enderecos={user?.enderecos || []}
                  onSave={saveEndereco}
                  onDelete={deleteEndereco}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 