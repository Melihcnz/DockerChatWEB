'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

// Bu bileşen istemci tarafı durumu ve etkilerini yönetmek için kullanılır
export default function Providers({ children }) {
  const { checkAuth } = useAuthStore();
  
  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return children;
} 