'use client'

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';
import Breadcrumb from '@/components/Breadcrumb';

export default function PerfilPage() {
  const { user, updateUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.displayName || '',
    email: user?.email || '',
    cpf: user?.cpf || '',
    telefone: user?.telefone || '',
    endereco: user?.endereco || '',
    cidade: user?.cidade || '',
    estado: user?.estado || ''
  });

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Perfil' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile(formData);
      // Feedback de sucesso
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      // Feedback de erro
    } finally {
      setLoading(false);
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

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Pessoais */}
              <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                <h2 className="text-lg font-medium text-white">Informações Pessoais</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200">Nome</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
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

                  {/* CPF - Desabilitado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200">CPF</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      disabled
                      className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200">Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                <h2 className="text-lg font-medium text-white">Endereço</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-200">Endereço</label>
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200">Estado</label>
                    <input
                      type="text"
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 