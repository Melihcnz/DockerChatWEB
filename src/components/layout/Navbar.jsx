'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { HiOutlineLogout, HiOutlineUser, HiOutlineCog, HiOutlineMenuAlt1 } from 'react-icons/hi';
import useAuthStore from '@/store/authStore';
import { getInitials, getAvatarColorFromName, cn } from '@/utils/helpers';

export default function Navbar({ toggleSidebar }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  // Profil dropdown menüsünü aç/kapat
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Dropdown menu dışına tıklandığında menüyü kapat
  const handleClickOutside = () => {
    setShowDropdown(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-[var(--header-height)] z-30 bg-white dark:bg-[var(--card-bg)] shadow-sm border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="p-2 text-2xl text-gray-600 dark:text-gray-300 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <HiOutlineMenuAlt1 />
            </button>
          )}
          
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DockerChat Logo" width={40} height={40} />
            <span className="text-xl font-semibold text-primary dark:text-white">DockerChat</span>
          </Link>
        </div>

        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open user menu"
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full text-white",
                getAvatarColorFromName(user.username)
              )}>
                {getInitials(user.username)}
              </div>
              <span className="hidden md:block font-medium">{user.username}</span>
            </button>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={handleClickOutside}
                />
                <div className="absolute right-0 z-50 mt-2 w-56 bg-white dark:bg-[var(--card-bg)] rounded-md shadow-lg border border-[var(--border-color)]">
                  <div className="p-3 border-b border-[var(--border-color)]">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/profil" 
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={handleClickOutside}
                    >
                      <HiOutlineUser className="text-gray-500" />
                      <span>Profil</span>
                    </Link>
                    <Link 
                      href="/ayarlar" 
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={handleClickOutside}
                    >
                      <HiOutlineCog className="text-gray-500" />
                      <span>Ayarlar</span>
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        handleClickOutside();
                      }} 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                    >
                      <HiOutlineLogout className="text-red-600" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              href="/giris" 
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              Giriş Yap
            </Link>
            <Link 
              href="/kayit" 
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md"
            >
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}