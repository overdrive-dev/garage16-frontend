import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { DisponibilidadeProvider } from '@/contexts/DisponibilidadeContext'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Garage 16',
  description: 'Plataforma de anúncios de veículos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full bg-gray-900">
      <body className={`${inter.className} h-full text-gray-100`}>
        <AuthProvider>
          <DisponibilidadeProvider>
            <Header />
            <div className="min-h-screen">
              {children}
            </div>
          </DisponibilidadeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 