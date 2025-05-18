import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const BASE_URL = 'https://chat.melihcanaz.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 saniye timeout ekleyelim
});

// Tüm isteklere bearer token ekleme
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API isteği gönderiliyor: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API isteği gönderilirken hata:', error);
    return Promise.reject(error);
  }
);

// Yanıt durumlarını kontrol etme
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API yanıtı alındı: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Sunucu yanıtı aldık ama hata kodu döndü
      console.error(`API Hata: ${error.response.status} - ${error.response.config.url}`);
      
      if (error.response.status === 401) {
        // Token geçersiz veya süresi dolmuş
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/giris';
        }
      } else if (error.response.status >= 500) {
        toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      }
    } else if (error.request) {
      // İstek yapıldı ama yanıt alamadık
      console.error('API yanıt vermedi:', error.request);
      toast.error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
    } else {
      // İstek oluşturulurken bir şeyler ters gitti
      console.error('API istek hatası:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 