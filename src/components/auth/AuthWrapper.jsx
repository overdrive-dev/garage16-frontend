'use client'

import { Suspense } from 'react';
import AuthLoading from './AuthLoading';

export default function AuthWrapper({ children }) {
  return (
    <Suspense fallback={<AuthLoading />}>
      {children}
    </Suspense>
  );
} 