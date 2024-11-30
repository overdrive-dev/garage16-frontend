'use client'

import Image from 'next/image';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function UserAvatar({ user, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  if (!user?.photoURL) {
    return <UserCircleIcon className={`${sizes[size]} text-gray-400`} />;
  }

  return (
    <div className={`${sizes[size]} relative rounded-full overflow-hidden`}>
      <Image
        src={user.photoURL}
        alt={user.displayName || user.email}
        fill
        className="object-cover"
        onError={(e) => {
          e.target.src = ''; // Limpa a src em caso de erro
          e.target.onerror = null; // Previne loop infinito
        }}
      />
    </div>
  );
} 