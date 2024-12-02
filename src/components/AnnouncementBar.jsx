'use client'

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ANNOUNCEMENT = {
  ativo: true,
  mensagem: '🎄 Promoção de Natal: Na compra de qualquer moto, ganhe um capacete Lucca! 🎁',
  link: '/veiculos',
  cor_fundo: 'bg-gray-800',
  cor_texto: 'text-gray-200',
  permite_fechar: true,
  exibir_ate: '2024-12-25',
  id: 'promo-natal-2024'
};

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isHidden = sessionStorage.getItem(`announcement-${ANNOUNCEMENT.id}`);
    if (!isHidden) {
      setIsVisible(true);
    }
  }, []);

  if (!ANNOUNCEMENT.ativo || !isVisible) return null;

  if (ANNOUNCEMENT.exibir_ate) {
    const hoje = new Date();
    const dataLimite = new Date(ANNOUNCEMENT.exibir_ate);
    if (hoje > dataLimite) return null;
  }

  const handleClose = () => {
    sessionStorage.setItem(`announcement-${ANNOUNCEMENT.id}`, 'hidden');
    setIsVisible(false);
  };

  const Content = () => (
    <span className="text-sm">
      {ANNOUNCEMENT.mensagem}
    </span>
  );

  return (
    <div className={`${ANNOUNCEMENT.cor_fundo} ${ANNOUNCEMENT.cor_texto} border-b border-gray-700`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-10 relative">
          {ANNOUNCEMENT.link ? (
            <a 
              href={ANNOUNCEMENT.link}
              className="hover:text-white transition-colors"
            >
              <Content />
            </a>
          ) : (
            <Content />
          )}

          {ANNOUNCEMENT.permite_fechar && (
            <button
              type="button"
              className="absolute right-0 p-1 text-gray-400 hover:text-white transition-colors"
              onClick={handleClose}
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}