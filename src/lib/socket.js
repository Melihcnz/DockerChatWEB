import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

let socket;

export const initSocket = () => {
  const token = Cookies.get('token');
  
  if (!token) return null;
  
  if (!socket) {
    socket = io('https://chat.melihcanaz.com', {
      autoConnect: true,
      withCredentials: false,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 30000,
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Socket bağlantısı kuruldu');
      
      // Socket üzerinden kimlik doğrulama
      socket.emit('authenticate', { token });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket bağlantı hatası:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket bağlantısı kesildi:', reason);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 