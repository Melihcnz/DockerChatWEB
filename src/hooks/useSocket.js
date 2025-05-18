"use client";

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSocket, initSocket } from '@/lib/socket';
import useChatStore from '@/store/chatStore';
import useAuthStore from '@/store/authStore';

export function useSocket() {
  const { addNewMessage, setUserTyping, getMessages, updateMessages } = useChatStore();
  const { user, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Kullanıcı authenticate olmadıysa socket bağlantısı kurma
    if (!isAuthenticated || !user) return;
    
    // Socket bağlantısını başlat
    const socket = initSocket();
    
    if (!socket) return;
    
    // Özel mesaj alma dinleyicisi
    socket.on('private_message', (message) => {
      console.log('Yeni özel mesaj:', message);
      
      // Mesaj veri yapısının kontrolü
      if (message && typeof message === 'object') {
        // Mevcut mesajları kontrol et
        const existingMessages = getMessages();
        
        // Optimistik mesajları filtrele ve gerçek mesaj ile değiştir
        if (Array.isArray(existingMessages)) {
          const updatedMessages = existingMessages.filter(m => 
            // Aynı ID'ye sahip gerçek mesajları filtrele
            m.id !== message.id && 
            // İçerik, alıcı ve gönderici aynı olan optimistik mesajları filtrele
            !(m._optimisticId && m.content === message.content && 
              m.senderId === message.senderId && 
              m.receiverId === message.receiverId)
          );
          
          // Mesajlar dizisini güncelle ve sonra yeni mesajı ekle
          updateMessages([...updatedMessages, message]);
        } else {
          // Mesajlar dizisi yoksa sadece yeni mesaj ekle
          addNewMessage(message);
        }
        
        // Kendi mesajımız değilse bildirim göster
        if (message.senderId !== user.id) {
          const senderName = message.senderName || 'Bir kullanıcı';
          toast.info(`${senderName}: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`);
        }
      } else {
        console.error('Geçersiz mesaj formatı:', message);
      }
    });
    
    // Grup mesajı alma dinleyicisi
    socket.on('group_message', (message) => {
      console.log('Yeni grup mesajı:', message);
      
      // Mesaj veri yapısının kontrolü
      if (message && typeof message === 'object') {
        // Mevcut mesajları kontrol et
        const existingMessages = getMessages();
        
        // Optimistik mesajları filtrele ve gerçek mesaj ile değiştir
        if (Array.isArray(existingMessages)) {
          const updatedMessages = existingMessages.filter(m => 
            // Aynı ID'ye sahip gerçek mesajları filtrele
            m.id !== message.id && 
            // İçerik, grup ve gönderici aynı olan optimistik mesajları filtrele
            !(m._optimisticId && m.content === message.content && 
              m.senderId === message.senderId && 
              m.groupId === message.groupId)
          );
          
          // Mesajlar dizisini güncelle ve sonra yeni mesajı ekle
          updateMessages([...updatedMessages, message]);
        } else {
          // Mesajlar dizisi yoksa sadece yeni mesaj ekle
          addNewMessage(message);
        }
        
        // Kendi mesajımız değilse bildirim göster
        if (message.senderId !== user.id) {
          const senderName = message.senderName || 'Bir kullanıcı';
          const groupName = message.groupName || 'Grup';
          toast.info(`${groupName} - ${senderName}: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`);
        }
      } else {
        console.error('Geçersiz mesaj formatı:', message);
      }
    });
    
    // Kullanıcı yazıyor bildirimi
    socket.on('user_typing', (data) => {
      if (data && data.senderId && data.senderId !== user.id) {
        setUserTyping(data.senderId, data.isTyping);
      }
    });
    
    // Kullanıcı durumu değiştiğinde
    socket.on('user_status_changed', (data) => {
      // Burada kullanıcıların durumlarını güncelleyebilirsiniz
      console.log('Kullanıcı durumu değişti:', data);
    });
    
    // Mesaj okundu bildirimi
    socket.on('message_read', (data) => {
      console.log('Mesaj okundu:', data);
      // Burada mesajları okundu olarak işaretleyebilirsiniz
    });
    
    // Temizlik işlevi
    return () => {
      socket.off('private_message');
      socket.off('group_message');
      socket.off('user_typing');
      socket.off('user_status_changed');
      socket.off('message_read');
    };
  }, [isAuthenticated, user, addNewMessage, setUserTyping, getMessages, updateMessages]);
  
  return { socket: getSocket() };
} 