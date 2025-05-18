'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        router.push('/');
      } else {
        setErrors({ form: result.message });
      }
    } catch (error) {
      setErrors({ form: 'Giriş yapılırken bir hata oluştu' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height))] p-4">
      <div className="auth-form">
        <h1 className="text-2xl font-bold mb-6 text-center">DockerChat'e Giriş Yap</h1>
        
        {errors.form && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-md mb-4">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`input ${errors.username ? 'border-red-500' : ''}`}
              value={formData.username}
              onChange={handleChange}
              placeholder="Kullanıcı adınızı girin"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`input ${errors.password ? 'border-red-500' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Şifrenizi girin"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Giriş Yapılıyor...
              </span>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hesabın yok mu?{' '}
            <Link 
              href="/kayit" 
              className="text-primary hover:underline font-medium"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Test Hesapları:<br />
            <span className="font-semibold">Kullanıcı Adı:</span> admin, user1, user2, user3<br />
            <span className="font-semibold">Şifre:</span> 123456
          </p>
        </div>
      </div>
    </div>
  );
} 