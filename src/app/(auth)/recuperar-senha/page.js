import { Suspense } from 'react';
import LoadingComponent from '@/components/disponibilidade/LoadingComponent';
import RecuperarSenhaClient from './RecuperarSenhaClient';

export default function RecuperarSenhaPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <RecuperarSenhaClient />
    </Suspense>
  );
} 