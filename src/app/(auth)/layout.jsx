import AuthWrapper from '@/components/auth/AuthWrapper';

export default function AuthLayout({ children }) {
  return <AuthWrapper>{children}</AuthWrapper>;
} 