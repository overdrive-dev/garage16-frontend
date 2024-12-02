'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AnuncioForm from '@/components/anuncio/AnuncioForm';
import { anuncioService } from '@/services/anuncioService';

export default function EditarVeiculoClient({ veiculo }) {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (data) => {
    try {
      await anuncioService.updateAnuncio(veiculo.id, data);
      router.push(`/veiculo/${data.slug || data.id}`);
    } catch (error) {
      console.error('Erro ao atualizar anúncio:', error);
    }
  };

  return (
    <AnuncioForm 
      tipo="editar"
      anuncio={veiculo}
      onSubmit={handleSubmit}
      userId={user.uid}
    />
  );
} 