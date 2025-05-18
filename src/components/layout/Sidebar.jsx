'use client';

import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineUserGroup, HiOutlineUser } from 'react-icons/hi';
import useAuthStore from '@/store/authStore';
import useChatStore from '@/store/chatStore';
import { getInitials, getAvatarColorFromName, getStatusColor, cn, truncateText } from '@/utils/helpers';

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user } = useAuthStore();
  const { 
    contacts, 
    groups, 
    fetchContacts, 
    fetchGroups, 
    fetchPrivateMessages, 
    fetchGroupMessages,
    activeChat,
    chatType,
    unreadMessages
  } = useChatStore();
  
  const [activeTab, setActiveTab] = useState('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  
  // Kişileri ve grupları yükleme
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        console.log('Kullanıcı oturumu bulunamadı, kişiler ve gruplar yüklenmiyor');
        return;
      }
      
      console.log('Kişiler ve gruplar yükleniyor...');
      
      try {
        console.log('Kişileri getirme isteği gönderiliyor...');
        const contactsData = await fetchContacts();
        console.log(`${contactsData.length || 0} kişi başarıyla yüklendi`);
      } catch (error) {
        console.error('Kişileri getirirken hata:', error);
      }
      
      try {
        console.log('Grupları getirme isteği gönderiliyor...');
        const groupsData = await fetchGroups();
        console.log(`${groupsData.length || 0} grup başarıyla yüklendi`);
      } catch (error) {
        console.error('Grupları getirirken hata:', error);
      }
    };
    
    loadData();
  }, [user, fetchContacts, fetchGroups]);
  
  // Arama sonuçlarını filtreleme
  useEffect(() => {
    console.log('CONTACTS:', contacts);
    console.log('GROUPS:', groups);
    
    if (activeTab === 'contacts') {
      setFilteredList(
        contacts && Array.isArray(contacts) 
          ? contacts.filter(contact => 
              contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
            )
          : []
      );
    } else {
      setFilteredList(
        groups && Array.isArray(groups)
          ? groups.filter(group => 
              group.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : []
      );
    }
    
    console.log('FILTERED_LIST:', filteredList);
  }, [searchQuery, activeTab, contacts, groups]);
  
  // Sohbet seçildiğinde
  const handleChatSelect = (id, type) => {
    if (type === 'private') {
      fetchPrivateMessages(id);
    } else {
      fetchGroupMessages(id);
    }
    
    // Mobil görünümde sidebar'ı kapat
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };
  
  // Grup oluşturma modalını aç
  const openCreateGroupModal = () => {
    // Grup oluşturma modalı açılacak
    console.log('Grup oluştur');
  };
  
  // Yeni sohbet başlatma modalını aç
  const openNewChatModal = () => {
    // Yeni sohbet başlatma modalı açılacak
    console.log('Yeni sohbet');
  };
  
  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
      />
      
      <div 
        className={cn(
          "fixed top-[var(--header-height)] left-0 w-[var(--sidebar-width)] z-40 h-[calc(100vh-var(--header-height))]",
          "bg-white dark:bg-[var(--card-bg)] border-r border-[var(--border-color)] shadow-sm",
          "lg:translate-x-0 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Debug bilgisi */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-2 text-xs bg-yellow-100 text-gray-800">
              <div>Contacts: {contacts && Array.isArray(contacts) ? contacts.length : 0}</div>
              <div>Groups: {groups && Array.isArray(groups) ? groups.length : 0}</div>
              <div>Filtered: {filteredList ? filteredList.length : 0}</div>
            </div>
          )}
          
          {/* Arama */}
          <div className="p-3 border-b border-[var(--border-color)]">
            <div className="relative">
              <input
                type="text"
                className="input pl-10"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          
          {/* Sekmeler */}
          <div className="flex border-b border-[var(--border-color)]">
            <button
              className={cn(
                "flex-1 py-3 text-center font-medium",
                activeTab === 'contacts' 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-500 dark:text-gray-400"
              )}
              onClick={() => setActiveTab('contacts')}
            >
              Kişiler
            </button>
            <button
              className={cn(
                "flex-1 py-3 text-center font-medium",
                activeTab === 'groups' 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-500 dark:text-gray-400"
              )}
              onClick={() => setActiveTab('groups')}
            >
              Gruplar
            </button>
          </div>
          
          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'contacts' ? (
              <>
                <div className="p-3 sticky top-0 bg-white dark:bg-[var(--card-bg)] z-10 border-b border-[var(--border-color)]">
                  <button
                    className="flex items-center justify-center w-full gap-2 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                    onClick={openNewChatModal}
                  >
                    <HiOutlinePlus size={18} />
                    <span>Yeni Sohbet</span>
                  </button>
                </div>
                <div className="divide-y divide-[var(--border-color)]">
                  {filteredList.length > 0 ? (
                    filteredList.map((contact) => (
                      <button
                        key={contact.id}
                        className={cn(
                          "flex items-center gap-3 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800",
                          activeChat === contact.id && chatType === 'private' && "bg-gray-100 dark:bg-gray-800"
                        )}
                        onClick={() => handleChatSelect(contact.id, 'private')}
                      >
                        <div className="relative">
                          <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-full text-white",
                            getAvatarColorFromName(contact.username)
                          )}>
                            {getInitials(contact.username)}
                          </div>
                          <div className={cn(
                            "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[var(--card-bg)]",
                            getStatusColor(contact.status || 'offline')
                          )} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{contact.username}</span>
                            {unreadMessages[contact.id] > 0 && (
                              <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                                {unreadMessages[contact.id]}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {contact.lastMessage ? truncateText(contact.lastMessage, 25) : contact.email}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? 'Arama sonucu bulunamadı'
                        : 'Henüz kişi bulunamadı'}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-3 sticky top-0 bg-white dark:bg-[var(--card-bg)] z-10 border-b border-[var(--border-color)]">
                  <button
                    className="flex items-center justify-center w-full gap-2 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                    onClick={openCreateGroupModal}
                  >
                    <HiOutlinePlus size={18} />
                    <span>Grup Oluştur</span>
                  </button>
                </div>
                <div className="divide-y divide-[var(--border-color)]">
                  {filteredList.length > 0 ? (
                    filteredList.map((group) => (
                      <button
                        key={group.id}
                        className={cn(
                          "flex items-center gap-3 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800",
                          activeChat === group.id && chatType === 'group' && "bg-gray-100 dark:bg-gray-800"
                        )}
                        onClick={() => handleChatSelect(group.id, 'group')}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full text-white",
                          getAvatarColorFromName(group.name)
                        )}>
                          {getInitials(group.name)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{group.name}</span>
                            {unreadMessages[group.id] > 0 && (
                              <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                                {unreadMessages[group.id]}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {group.memberCount || 0} üye
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? 'Arama sonucu bulunamadı'
                        : 'Henüz grup bulunamadı'}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 