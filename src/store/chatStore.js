import { create } from 'zustand';
import apiClient from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/authStore';

const useChatStore = create((set, get) => ({
  activeChat: null,
  chatType: null, // 'private' veya 'group'
  contacts: [],
  groups: [],
  messages: [],
  isLoadingMessages: false,
  unreadMessages: {},
  typingUsers: {},
  
  // Tüm kullanıcıları getir
  fetchContacts: async () => {
    try {
      const response = await apiClient.get('/api/users/all');
      console.log('Contacts API yanıtı:', response.data);
      
      // API yanıtının yapısını kontrol et
      let contacts = [];
      if (response.data && response.data.users) {
        // { users: [...] } formatında
        contacts = response.data.users;
      } else if (Array.isArray(response.data)) {
        // Doğrudan dizi formatında
        contacts = response.data;
      } else {
        console.error('Beklenmeyen API yanıt formatı:', response.data);
      }
      
      set({ contacts });
      return contacts;
    } catch (error) {
      console.error('Kullanıcılar getirilirken hata:', error);
      return [];
    }
  },
  
  // Kullanıcının gruplarını getir
  fetchGroups: async () => {
    try {
      const response = await apiClient.get('/api/users/groups/my');
      console.log('Groups API yanıtı:', response.data);
      
      // API yanıtının yapısını kontrol et
      let groups = [];
      if (response.data && response.data.groups) {
        // { groups: [...] } formatında
        groups = response.data.groups;
      } else if (Array.isArray(response.data)) {
        // Doğrudan dizi formatında
        groups = response.data;
      } else {
        console.error('Beklenmeyen API yanıt formatı:', response.data);
      }
      
      set({ groups });
      return groups;
    } catch (error) {
      console.error('Gruplar getirilirken hata:', error);
      return [];
    }
  },
  
  // Özel mesajları getir
  fetchPrivateMessages: async (userId) => {
    set({ isLoadingMessages: true });
    try {
      const response = await apiClient.get(`/api/messages/private/${userId}`);
      console.log('Özel mesajlar yanıtı:', response.data);
      
      // API yanıtının yapısını kontrol et
      let messages = [];
      if (response.data && response.data.messages) {
        // { messages: [...] } formatında
        messages = response.data.messages;
      } else if (Array.isArray(response.data)) {
        // Doğrudan dizi formatında
        messages = response.data;
      } else {
        console.error('Beklenmeyen mesaj yanıt formatı:', response.data);
      }
      
      set({ 
        messages,
        activeChat: userId,
        chatType: 'private',
        isLoadingMessages: false
      });
      
      // Mesajları okundu olarak işaretle
      get().markMessagesAsRead(userId, 'private');
      
      return messages;
    } catch (error) {
      console.error('Özel mesajlar getirilirken hata:', error);
      set({ isLoadingMessages: false });
      return [];
    }
  },
  
  // Grup mesajlarını getir
  fetchGroupMessages: async (groupId) => {
    set({ isLoadingMessages: true });
    try {
      const response = await apiClient.get(`/api/messages/group/${groupId}`);
      console.log('Grup mesajlar yanıtı:', response.data);
      
      // API yanıtının yapısını kontrol et
      let messages = [];
      if (response.data && response.data.messages) {
        // { messages: [...] } formatında
        messages = response.data.messages;
      } else if (Array.isArray(response.data)) {
        // Doğrudan dizi formatında
        messages = response.data;
      } else {
        console.error('Beklenmeyen mesaj yanıt formatı:', response.data);
      }
      
      set({ 
        messages,
        activeChat: groupId,
        chatType: 'group',
        isLoadingMessages: false
      });
      
      // Mesajları okundu olarak işaretle
      get().markMessagesAsRead(groupId, 'group');
      
      return messages;
    } catch (error) {
      console.error('Grup mesajları getirilirken hata:', error);
      set({ isLoadingMessages: false });
      return [];
    }
  },
  
  // Özel mesaj gönder
  sendPrivateMessage: async (receiverId, content) => {
    try {
      const socket = getSocket();
      
      if (!socket) {
        toast.error('Mesaj gönderilemedi: Bağlantı sorunu');
        return { success: false };
      }
      
      // Mesajı socket üzerinden gönder
      socket.emit('send_private_message', {
        receiverId,
        content
      });
      
      // UI'ı hemen güncelle (optimistik)
      const userId = get().getUserId();
      const optimisticId = `opt_${Date.now()}`;
      const tempMessage = {
        id: optimisticId, // Geçici bir ID kullan
        _optimisticId: optimisticId, // Bu bir optimistik mesaj olduğunu belirten özel flag
        senderId: userId,
        receiverId,
        content,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      set(state => {
        // Mesajlar dizisi kontrolü
        const currentMessages = Array.isArray(state.messages) ? state.messages : [];
        return {
          messages: [...currentMessages, tempMessage]
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      toast.error('Mesaj gönderilemedi');
      return { success: false };
    }
  },
  
  // Grup mesajı gönder
  sendGroupMessage: async (groupId, content) => {
    try {
      const socket = getSocket();
      
      if (!socket) {
        toast.error('Mesaj gönderilemedi: Bağlantı sorunu');
        return { success: false };
      }
      
      // Mesajı socket üzerinden gönder
      socket.emit('send_group_message', {
        groupId,
        content
      });
      
      // UI'ı hemen güncelle (optimistik)
      const userId = get().getUserId();
      const optimisticId = `opt_${Date.now()}`;
      const tempMessage = {
        id: optimisticId, // Geçici bir ID kullan
        _optimisticId: optimisticId, // Bu bir optimistik mesaj olduğunu belirten özel flag
        senderId: userId,
        groupId,
        content,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      
      set(state => {
        // Mesajlar dizisi kontrolü
        const currentMessages = Array.isArray(state.messages) ? state.messages : [];
        return {
          messages: [...currentMessages, tempMessage]
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Grup mesajı gönderme hatası:', error);
      toast.error('Mesaj gönderilemedi');
      return { success: false };
    }
  },
  
  // Mesaj silme
  deleteMessage: async (messageId) => {
    try {
      await apiClient.delete(`/api/messages/${messageId}`);
      
      // UI'dan mesajı kaldır
      set(state => {
        // Mesajlar dizisi kontrolü
        const currentMessages = Array.isArray(state.messages) ? state.messages : [];
        return {
          messages: currentMessages.filter(msg => msg.id !== messageId)
        };
      });
      
      return { success: true };
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      toast.error('Mesaj silinemedi');
      return { success: false };
    }
  },
  
  // Yeni gelen mesajı ekle
  addNewMessage: (message) => {
    const { activeChat, chatType } = get();
    
    // Aktif sohbette yeni mesaj geldi
    if (
      (chatType === 'private' && 
       (message.senderId === activeChat || message.receiverId === activeChat)) ||
      (chatType === 'group' && message.groupId === activeChat)
    ) {
      set(state => {
        // Mesajlar dizisi kontrolü
        const currentMessages = Array.isArray(state.messages) ? state.messages : [];
        return {
          messages: [...currentMessages, message]
        };
      });
      
      // Aktif sohbette olduğu için okundu olarak işaretle
      const chatId = chatType === 'private' ? message.senderId : message.groupId;
      get().markMessagesAsRead(chatId, chatType);
    } 
    // Aktif olmayan sohbetlerden gelen mesajlar için okunmamış sayısını artır
    else {
      const chatId = chatType === 'private' ? message.senderId : message.groupId;
      set(state => ({
        unreadMessages: {
          ...state.unreadMessages,
          [chatId]: (state.unreadMessages[chatId] || 0) + 1
        }
      }));
    }
  },
  
  // Mesajları okundu olarak işaretle
  markMessagesAsRead: (chatId, chatType) => {
    try {
      const socket = getSocket();
      
      if (socket) {
        socket.emit('mark_as_read', { 
          chatId, 
          chatType 
        });
      }
      
      // Okunmamış mesaj sayısını sıfırla
      set(state => ({
        unreadMessages: {
          ...state.unreadMessages,
          [chatId]: 0
        }
      }));
    } catch (error) {
      console.error('Mesaj okundu işaretleme hatası:', error);
    }
  },
  
  // Okunmamış mesaj sayısını getir
  fetchUnreadCounts: async () => {
    try {
      const response = await apiClient.get('/api/messages/unread');
      set({ unreadMessages: response.data });
    } catch (error) {
      console.error('Okunmamış mesaj sayısı getirme hatası:', error);
    }
  },
  
  // Yazıyor durumunu gönder
  sendTypingStatus: (chatId, chatType, isTyping = true) => {
    try {
      const socket = getSocket();
      
      if (socket) {
        socket.emit('typing', { 
          chatId, 
          chatType, 
          isTyping 
        });
      }
    } catch (error) {
      console.error('Yazıyor durumu gönderme hatası:', error);
    }
  },
  
  // Kullanıcının yazıyor durumunu ayarla
  setUserTyping: (userId, isTyping) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping
      }
    }));
  },
  
  // Yeni grup oluştur
  createGroup: async (groupData) => {
    try {
      const response = await apiClient.post('/api/groups', groupData);
      const newGroup = response.data;
      
      set(state => ({
        groups: [...state.groups, newGroup]
      }));
      
      toast.success('Grup başarıyla oluşturuldu');
      return { success: true, group: newGroup };
    } catch (error) {
      const message = error.response?.data?.message || 'Grup oluşturulurken bir hata oluştu';
      toast.error(message);
      return { success: false, message };
    }
  },
  
  // Gruba üye ekle
  addGroupMember: async (groupId, userId) => {
    try {
      await apiClient.post('/api/groups/members', { groupId, userId });
      
      // Grup listesini güncelle
      get().fetchGroups();
      
      toast.success('Üye gruba eklendi');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Üye eklenirken bir hata oluştu';
      toast.error(message);
      return { success: false, message };
    }
  },
  
  // Gruptan üye çıkar
  removeGroupMember: async (groupId, userId) => {
    try {
      await apiClient.delete(`/api/groups/members/${groupId}/${userId}`);
      
      // Grup listesini güncelle
      get().fetchGroups();
      
      toast.success('Üye gruptan çıkarıldı');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Üye çıkarılırken bir hata oluştu';
      toast.error(message);
      return { success: false, message };
    }
  },
  
  // Aktif sohbeti temizle
  clearActiveChat: () => {
    set({
      activeChat: null,
      chatType: null,
      messages: []
    });
  },
  
  // Kullanıcı store'dan kullanıcı bilgisini al
  getUserId: () => {
    const authState = useAuthStore.getState();
    return authState.user?.id;
  },
  
  // Mevcut mesajları getir
  getMessages: () => {
    return get().messages;
  },
  
  // Mesajları doğrudan güncelle
  updateMessages: (newMessages) => {
    set({ messages: newMessages });
  }
}));

export default useChatStore; 