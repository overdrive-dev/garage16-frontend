import './globals.css'
import Header from '@/components/Header'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'Garage16 - Compra e Venda de Veículos',
  description: 'Encontre o veículo dos seus sonhos ou anuncie o seu',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-900 text-gray-100">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 