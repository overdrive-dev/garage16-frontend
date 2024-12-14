'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, requireAuth = true, requireComplete = true }) {
  const { user, isProfileComplete, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Não faz nada enquanto estiver carregando
    if (loading) return;

    if (requireAuth && !user) {
      // Usuário não está logado
      router.push('/entrar');
      return;
    }

    if (user && requireComplete && !isProfileComplete(user)) {
      // Usuário logado mas perfil incompleto
      router.push('/completar-cadastro');
      return;
    }

    if (user && !requireAuth) {
      // Usuário logado tentando acessar página de auth
      router.push('/');
      return;
    }
  }, [user, requireAuth, requireComplete, router, isProfileComplete, loading]);

  // Não renderiza nada enquanto estiver carregando
  if (loading) return null;

  // Renderiza o conteúdo apenas se todas as condições forem atendidas
  if (requireAuth && !user) return null;
  if (user && requireComplete && !isProfileComplete(user)) return null;
  if (user && !requireAuth) return null;

  return children;
} 