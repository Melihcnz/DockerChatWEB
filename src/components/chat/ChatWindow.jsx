'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { HiOutlineDotsVertical, HiPaperAirplane, HiOutlineEmojiHappy } from 'react-icons/hi';
import { formatMessageDate, getInitials, getAvatarColorFromName, cn, groupMessagesByDate } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import useChatStore from '@/store/chatStore';

export default function ChatWindow() {
  const { user } = useAuthStore();
  const { 
    activeChat, 
    chatType, 
    messages, 
    contacts,
    groups,
    sendPrivateMessage,
    sendGroupMessage,
    typingUsers,
    sendTypingStatus,
    isLoadingMessages
  } = useChatStore();
  
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const messageBoxRef = useRef(null);
  
  // Aktif sohbetin bilgilerini al
  const getChatDetails = () => {
    if (!activeChat) return null;
    
    if (chatType === 'private') {
      return contacts.find(contact => contact.id === activeChat) || { 
        username: 'Kullanıcı',
        status: 'offline'
      };
    } else {
      return groups.find(group => group.id === activeChat) || { 
        name: 'Grup' 
      };
    }
  };
  
  const chatDetails = getChatDetails();
  
  // Mesaj gönderme
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !activeChat) return;
    
    if (chatType === 'private') {
      sendPrivateMessage(activeChat, messageInput);
    } else {
      sendGroupMessage(activeChat, messageInput);
    }
    
    setMessageInput('');
    
    // Yazıyor durumunu güncelle
    sendTypingStatus(activeChat, chatType, false);
  };
  
  // Yazma durumunu bildir
  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    if (activeChat) {
      sendTypingStatus(activeChat, chatType, e.target.value.length > 0);
    }
  };
  
  // Mesajları tarihe göre grupla
  const messageGroups = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);
  
  // Yeni mesaj geldiğinde otomatik scroll
  useEffect(() => {
    if (messagesEndRef.current && Array.isArray(messages) && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Yazıyor bildirimi
  const renderTypingIndicator = () => {
    if (!activeChat) return null;
    
    const typingUser = typingUsers[activeChat];
    if (!typingUser) return null;
    
    return (
      <div className="typing-indicator ml-4 mb-2">
        <span></span>
        <span></span>
        <span></span>
        <p className="ml-2">Yazıyor...</p>
      </div>
    );
  };
  
  // Sohbet seçilmediğinde boş ekran göster
  if (!activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center p-6">
          <h3 className="text-xl font-semibold mb-2">DockerChat'e Hoş Geldiniz</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Sohbet etmek için soldaki menüden bir kişi veya grup seçin
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Sohbet başlığı */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full text-white",
            getAvatarColorFromName(chatType === 'private' ? chatDetails?.username : chatDetails?.name)
          )}>
            {getInitials(chatType === 'private' ? chatDetails?.username : chatDetails?.name)}
          </div>
          <div>
            <h3 className="font-semibold">{chatType === 'private' ? chatDetails?.username : chatDetails?.name}</h3>
            {chatType === 'private' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {chatDetails?.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
              </p>
            )}
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <HiOutlineDotsVertical size={20} className="text-gray-500" />
        </button>
      </div>
      
      {/* Mesaj alanı */}
      <div 
        ref={messageBoxRef} 
        className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-4"
      >
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messageGroups.length > 0 ? (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex justify-center mb-4">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                  {group.date}
                </span>
              </div>
              
              {group.messages.map((message, msgIndex) => {
                const isSentByMe = message.senderId === user?.id;
                
                return (
                  <div 
                    key={`msg-${message.id || 'temp-' + msgIndex}-${message.createdAt}`} 
                    className={cn("mb-4", isSentByMe ? "text-right" : "text-left")}
                  >
                    <div 
                      className={cn(
                        "message-bubble inline-block",
                        isSentByMe ? "sent" : "received"
                      )}
                    >
                      {!isSentByMe && chatType === 'group' && (
                        <p className="text-xs font-medium mb-1">{message.senderName || 'Kullanıcı'}</p>
                      )}
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {formatMessageDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 dark:text-gray-400">Henüz mesaj yok</p>
          </div>
        )}
        
        {renderTypingIndicator()}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Mesaj yazma alanı */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button 
            type="button" 
            className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            aria-label="Emoji ekle"
          >
            <HiOutlineEmojiHappy size={22} />
          </button>
          <input
            type="text"
            className="input flex-1"
            placeholder="Mesajınızı yazın..."
            value={messageInput}
            onChange={handleTyping}
          />
          <button
            type="submit"
            className={cn(
              "p-2 rounded-full",
              messageInput.trim()
                ? "bg-primary text-white hover:bg-primary-hover"
                : "bg-gray-200 text-gray-500 dark:bg-gray-700 cursor-not-allowed"
            )}
            disabled={!messageInput.trim()}
            aria-label="Mesaj gönder"
          >
            <HiPaperAirplane size={20} className="rotate-90" />
          </button>
        </form>
      </div>
    </div>
  );
} 