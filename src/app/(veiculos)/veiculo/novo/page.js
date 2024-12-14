import { Suspense } from 'react';
import NovoVeiculoClient from './NovoVeiculoClient';
import LoadingComponent from '@/components/disponibilidade/LoadingComponent';

export default function NovoVeiculoPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <NovoVeiculoClient />
    </Suspense>
  );
} 