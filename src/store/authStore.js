import { create } from 'zustand';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import apiClient from '@/lib/axios';
import { initSocket, disconnectSocket } from '@/lib/socket';
import { toast } from 'react-toastify';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  // Kullanıcı girişi
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      // Token'ı cookie'ye kaydet
      Cookies.set('token', token, { expires: 7 });
      
      // Socket bağlantısını başlat
      initSocket();
      
      set({ user, isAuthenticated: true, isLoading: false });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Giriş yapılırken bir hata oluştu';
      toast.error(message);
      return { success: false, message };
    }
  },
  
  // Kullanıcı kaydı
  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Kayıt olurken bir hata oluştu';
      toast.error(message);
      return { success: false, message };
    }
  },
  
  // Kullanıcı çıkışı
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      // Bağlantıyı sonlandır
      disconnectSocket();
      
      // Cookie'yi temizle
      Cookies.remove('token');
      
      set({ user: null, isAuthenticated: false });
    }
  },
  
  // Kimlik doğrulama durumunu kontrol et
  checkAuth: async () => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        set({ isLoading: false });
        return;
      }
      
      // Token'ın süresi dolmuş mu kontrol et
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          Cookies.remove('token');
          set({ isLoading: false });
          return;
        }
      } catch (e) {
        Cookies.remove('token');
        set({ isLoading: false });
        return;
      }
      
      // Geçerli kullanıcı bilgilerini al
      const response = await apiClient.get('/api/auth/me');
      
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      // Socket bağlantısını başlat
      initSocket();
      
    } catch (error) {
      console.error('Oturum doğrulama hatası:', error);
      Cookies.remove('token');
      set({ isLoading: false });
    }
  },
  
  // Kullanıcı profil güncelleme
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/api/users/profile', profileData);
      set({ user: { ...get().user, ...response.data } });
      toast.success('Profil başarıyla güncellendi');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profil güncellenirken bir hata oluştu';
      toast.error(message);
      return { success: false, message };
    }
  },
  
  // Kullanıcı şifre değiştirme
  changePassword: async (passwordData) => {
    try {
      await apiClient.put('/api/users/password', passwordData);
      toast.success('Şifre başarıyla değiştirildi');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu';
      toast.error(message);
      return { success: false, message };
    }
  },
  
  // Kullanıcı durumunu güncelleme (çevrimiçi, uzakta, meşgul)
  updateStatus: async (status) => {
    try {
      await apiClient.put('/api/users/status', { status });
      set({ user: { ...get().user, status } });
      return { success: true };
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      return { success: false };
    }
  }
}));

export default useAuthStore; 