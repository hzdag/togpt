export const ACCESSIBILITY_CONFIG = {
  aria: {
    landmarks: {
      main: 'Ana içerik',
      navigation: 'Ana navigasyon',
      search: 'Arama',
      chat: 'Sohbet alanı',
      settings: 'Ayarlar'
    },
    labels: {
      themeToggle: 'Tema değiştir',
      menuToggle: 'Menüyü aç/kapat',
      sendMessage: 'Mesaj gönder',
      clearChat: 'Sohbeti temizle',
      newChat: 'Yeni sohbet',
      modelSelect: 'AI modeli seç'
    }
  },
  keyboard: {
    shortcuts: {
      newChat: 'ctrl+n',
      sendMessage: 'ctrl+enter',
      clearChat: 'ctrl+l',
      focusInput: '/',
      toggleTheme: 'ctrl+t',
      toggleMenu: 'ctrl+b'
    }
  },
  focus: {
    outlineWidth: '2px',
    outlineColor: 'rgb(var(--primary))',
    outlineOffset: '2px'
  },
  motion: {
    reducedMotion: {
      animations: false,
      transitions: {
        duration: '0ms'
      }
    }
  }
};