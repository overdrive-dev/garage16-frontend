'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import AdminRoute from '@/middleware/adminRoute';

export default function NovaMoto() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    ano: '',
    km: '',
    cor: '',
    preco: '',
    descricao: '',
    fichaTecnica: {
      marca: '',
      modelo: '',
      cilindrada: '',
      potencia: '',
      combustivel: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Adicionar dados básicos
      Object.keys(formData).forEach(key => {
        if (key === 'fichaTecnica') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Adicionar imagens
      images.forEach(image => {
        if (image instanceof File) {
          formDataToSend.append('imagens', image);
        }
      });

      const response = await fetch('/api/motos', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) throw new Error('Erro ao salvar moto');

      router.push('/minhas-motos');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar moto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('fichaTecnica.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        fichaTecnica: {
          ...prev.fichaTecnica,
          [field]: value
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Anunciar Moto</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... campos do formulário (igual ao AdminMoto) ... */}
          
          <div className="bg-gray-900/50 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-400">
              Seu anúncio será revisado por nossa equipe antes de ser publicado.
              Você receberá uma notificação assim que for aprovado.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#FD4308] hover:bg-[#e63d07] text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar para Aprovação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 