'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AnuncioForm from '@/components/anuncio/AnuncioForm';
import { anuncioService } from '@/services/anuncioService';

export default function EditarRascunhoClient({ rascunho }) {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (data) => {
    try {
      // Se tem slug, foi publicado
      if (data.slug) {
        await anuncioService.createAnuncio(data);
        router.push(`/veiculo/${data.slug}`);
      } else {
        // Se não tem slug, continua como rascunho
        await anuncioService.updateAnuncio(rascunho.id, data);
        router.push('/meus-anuncios');
      }
    } catch (error) {
      console.error('Erro ao atualizar rascunho:', error);
    }
  };

  return (
    <AnuncioForm 
      tipo="rascunho"
      anuncio={rascunho}
      onSubmit={handleSubmit}
      userId={user.uid}
    />
  );
} 