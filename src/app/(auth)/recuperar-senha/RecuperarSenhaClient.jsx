'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Componente do formulário de recuperação de senha
function RecuperarSenhaForm() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      if (error.code === 'auth/user-not-found') {
        setError('Email não encontrado');
      } else {
        setError('Erro ao enviar email de recuperação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-4 text-sm">
            Email de recuperação enviado! Verifique sua caixa de entrada.
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/entrar"
              className="text-orange-500 hover:text-orange-400 text-sm"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

// Componente principal
export default function RecuperarSenhaClient() {
  return <RecuperarSenhaForm />;
} 