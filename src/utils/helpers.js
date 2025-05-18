import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TailwindCSS sınıflarını temizleyen ve birleştiren yardımcı fonksiyon
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Mesaj tarihini formatla
export function formatMessageDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Bugün içinde
  if (diffDays === 0) {
    // Son bir saat içinde
    if (diffHrs === 0) {
      // Son bir dakika içinde
      if (diffMins === 0) {
        return 'Şimdi';
      }
      return `${diffMins} dakika önce`;
    }
    
    // Saat formatında
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Dün
  if (diffDays === 1) {
    return `Dün ${date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }
  
  // Son bir hafta içinde
  if (diffDays < 7) {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return `${days[date.getDay()]} ${date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }
  
  // Daha eski
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Kullanıcı adından avatar rengi oluştur
export function getAvatarColorFromName(name) {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  
  if (!name) return colors[0];
  
  // İsmin harflerinden basit bir hash fonksiyonu
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Hash değerini colors dizisinin uzunluğunda bir indekse dönüştür
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Kullanıcı adından avatar metni oluştur
export function getInitials(name) {
  if (!name) return '?';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Durum rengini belirle
export function getStatusColor(status) {
  const statusColors = {
    'online': 'bg-green-500',
    'away': 'bg-yellow-500',
    'busy': 'bg-red-500',
    'offline': 'bg-gray-500'
  };
  
  return statusColors[status] || statusColors.offline;
}

// İçeriği kısalt
export function truncateText(text, maxLength = 25) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

// Mesajları tarihe göre grupla
export const groupMessagesByDate = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return [];
  }
  
  const groups = {};
  
  messages.forEach(message => {
    if (!message || !message.createdAt) return;
    
    const date = new Date(message.createdAt);
    if (isNaN(date.getTime())) return; // Geçersiz tarih kontrolü
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Tarih formatını belirle
    let dateString;
    if (date.toDateString() === today.toDateString()) {
      dateString = 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateString = 'Dün';
    } else {
      dateString = date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    
    groups[dateString].push(message);
  });
  
  // Tarihe göre sıralı grupları oluştur
  return Object.keys(groups)
    .sort((a, b) => {
      if (a === 'Bugün') return 1;
      if (b === 'Bugün') return -1;
      if (a === 'Dün') return 1;
      if (b === 'Dün') return -1;
      
      // Diğer tarihler için
      const dateA = new Date(groups[a][0].createdAt);
      const dateB = new Date(groups[b][0].createdAt);
      return dateB - dateA;
    })
    .map(date => ({
      date,
      messages: groups[date].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA - dateB;
      })
    }));
}; 