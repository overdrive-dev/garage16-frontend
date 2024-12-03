'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RecoverPasswordForm from '@/components/auth/RecoverPasswordForm';

export default function RecoverPasswordPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (user) return null;

  return <RecoverPasswordForm />;
} 