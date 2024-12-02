'use client'

import Image from 'next/image';
import { useState } from 'react';

export default function UserAvatar({ user, size = 'md' }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-20 w-20'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Fallback para quando não há foto ou ocorre erro
  const FallbackAvatar = () => (
    <div 
      className={`${sizeClasses[size]} bg-gray-700 rounded-full flex items-center justify-center text-gray-300`}
    >
      {getInitials(user?.displayName)}
    </div>
  );

  if (!user?.photoURL || imageError) {
    return <FallbackAvatar />;
  }

  return (
    <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-gray-700`}>
      {isLoading && <FallbackAvatar />}
      <Image
        src={user.photoURL}
        alt={user.displayName || 'Avatar do usuário'}
        fill
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setImageError(true)}
        priority
      />
    </div>
  );
} 