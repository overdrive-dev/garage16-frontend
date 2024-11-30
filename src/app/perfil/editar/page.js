'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

export default function EditarPerfil() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      userService.getProfile(user.uid)
        .then(data => setProfile(data));
    }
  }, [user]);

  const handleSubmit = async (data) => {
    await userService.updateProfile(user.uid, data);
    // ... resto do código
  };

  // ... resto do componente
} 