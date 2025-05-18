'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useAuthStore from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';

export default function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  
  // Socket hook'unu çağır
  useSocket();
  
  // Oturum kontrolü
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Sidebar'ı aç/kapat
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Sidebar'ı kapat
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  // Yolun auth sayfası olup olmadığını kontrol et
  const isAuthPage = pathname === '/giris' || pathname === '/kayit';
  
  // Yükleniyor durumu
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="pt-[var(--header-height)]">
        {isAuthenticated && !isAuthPage && (
          <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        )}
        
        <main
          className={`min-h-[calc(100vh-var(--header-height))] transition-all duration-300 ${
            isAuthenticated && !isAuthPage
              ? 'lg:ml-[var(--sidebar-width)]'
              : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
} 