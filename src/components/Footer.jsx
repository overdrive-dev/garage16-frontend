'use client'

import Link from 'next/link';

// Mock dos dados do rodapé - Futuramente virá do admin
const FOOTER_DATA = {
  endereco: {
    rua: 'Av. Exemplo, 1234',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    telefone: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
    email: 'contato@garage16.com.br'
  },
  horarios: {
    segunda_sexta: '09:00 às 18:00',
    sabado: '09:00 às 13:00',
    domingo: 'Fechado'
  },
  redes_sociais: {
    instagram: 'https://instagram.com/garage16',
    facebook: 'https://facebook.com/garage16',
    youtube: 'https://youtube.com/garage16'
  }
};

export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <span className="text-white text-2xl font-bold">GARAGE</span>
              <span className="text-orange-500 text-2xl font-bold">16</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Sua loja especializada em motos premium e customizadas.
            </p>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-white font-semibold mb-4">Endereço</h3>
            <address className="text-gray-400 text-sm not-italic space-y-2">
              <p>{FOOTER_DATA.endereco.rua}</p>
              <p>{FOOTER_DATA.endereco.bairro}</p>
              <p>{`${FOOTER_DATA.endereco.cidade} - ${FOOTER_DATA.endereco.estado}`}</p>
              <p>CEP: {FOOTER_DATA.endereco.cep}</p>
            </address>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                Telefone: {FOOTER_DATA.endereco.telefone}
              </p>
              <p className="text-gray-400 text-sm">
                WhatsApp: {FOOTER_DATA.endereco.whatsapp}
              </p>
              <p className="text-gray-400 text-sm">
                Email: {FOOTER_DATA.endereco.email}
              </p>
            </div>
          </div>

          {/* Horário de Funcionamento */}
          <div>
            <h3 className="text-white font-semibold mb-4">Horário de Funcionamento</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                Segunda à Sexta: {FOOTER_DATA.horarios.segunda_sexta}
              </p>
              <p className="text-gray-400 text-sm">
                Sábado: {FOOTER_DATA.horarios.sabado}
              </p>
              <p className="text-gray-400 text-sm">
                Domingo: {FOOTER_DATA.horarios.domingo}
              </p>
            </div>
          </div>
        </div>

        {/* Redes Sociais e Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Redes Sociais */}
            <div className="flex space-x-6">
              <a 
                href={FOOTER_DATA.redes_sociais.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a 
                href={FOOTER_DATA.redes_sociais.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Facebook
              </a>
              <a 
                href={FOOTER_DATA.redes_sociais.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                YouTube
              </a>
            </div>

            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Garage16. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 