'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AnuncioForm from '@/components/anuncio/AnuncioForm';
import { anuncioService } from '@/services/anuncioService';

export default function NovoVeiculoClient() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (data) => {
    try {
      await anuncioService.createAnuncio(data);
      router.push('/meus-anuncios');
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
    }
  };

  return (
    <AnuncioForm 
      tipo="novo"
      anuncio={null}
      onSubmit={handleSubmit}
      userId={user.uid}
    />
  );
} 