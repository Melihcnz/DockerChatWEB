import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      const result = await register(userData);
      
      if (result.success) {
        router.push('/giris');
      } else {
        setErrors({ form: result.message });
      }
    } catch (error) {
      setErrors({ form: 'Kayıt olurken bir hata oluştu' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height))] p-4">
      <div className="auth-form">
        <h1 className="text-2xl font-bold mb-6 text-center">DockerChat'e Kayıt Ol</h1>
        
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
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="E-posta adresinizi girin"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
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
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Şifre Tekrar
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Şifrenizi tekrar girin"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
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
                Kayıt Olunuyor...
              </span>
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Zaten hesabın var mı?{' '}
            <Link 
              href="/giris" 
              className="text-primary hover:underline font-medium"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 