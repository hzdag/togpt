import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { GeminiChat } from '../lib/gemini';
import { XAIChat } from '../lib/xai';
import { setTheme } from '../lib/theme';
import { storage } from '../lib/storage';
import type { ChatHistory, Message } from '../types';
import type { AIModel } from '../lib/types/models';

interface ChatStore {
  chats: Record<string, ChatHistory>;
  activeChat: string | null;
  activeModel: AIModel;
  theme: 'light' | 'dark' | 'system';
  loading: boolean;
  isGenerating: boolean;
  searchTerm: string;
  editingMessageId: string | null;
  chatModels: Record<string, { gemini: GeminiChat; xai: XAIChat }>;
  showModelChangeToast: boolean;
  modelSwitchCooldown: boolean;
  
  setActiveModel: (model: AIModel) => void;
  hideModelChangeToast: () => void;
  createChat: () => string;
  setActiveChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearMessages: () => void;
  toggleTheme: () => void;
  setSearchTerm: (term: string) => void;
  setEditingMessageId: (messageId: string | null) => void;
  editMessage: (messageId: string, content: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  clearAllChats: () => void;
  continueGeneration: (messageId: string) => Promise<void>;
}

const initialChats = storage.loadChats();
const initialActiveChat = storage.loadActiveChat();
const initialChatModels: Record<string, { gemini: GeminiChat; xai: XAIChat }> = {};

Object.keys(initialChats).forEach((chatId) => {
  initialChatModels[chatId] = {
    gemini: new GeminiChat(),
    xai: new XAIChat()
  };
});

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: initialChats,
  activeChat: initialActiveChat,
  activeModel: 'gemini',
  theme: 'system',
  loading: false,
  isGenerating: false,
  searchTerm: '',
  editingMessageId: null,
  chatModels: initialChatModels,
  showModelChangeToast: false,
  modelSwitchCooldown: false,

  setActiveModel: (model) => {
    const { activeModel, modelSwitchCooldown, activeChat, chats } = get();
    
    if (model !== activeModel && !modelSwitchCooldown) {
      const hasActiveChat = activeChat && chats[activeChat]?.messages.length > 0;
      const chatId = hasActiveChat ? get().createChat() : activeChat;
      
      set({ 
        activeModel: model,
        showModelChangeToast: true,
        modelSwitchCooldown: true,
        activeChat: chatId
      });

      setTimeout(() => {
        set({ modelSwitchCooldown: false });
      }, 3000);
    }
  },

  hideModelChangeToast: () => {
    set({ showModelChangeToast: false });
  },

  createChat: () => {
    const chatId = uuidv4();
    const newChat: ChatHistory = {
      id: chatId,
      title: 'Yeni Sohbet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };

    const chatModels = {
      gemini: new GeminiChat(),
      xai: new XAIChat()
    };

    set((state) => {
      const updatedChats = { ...state.chats, [chatId]: newChat };
      const updatedChatModels = { ...state.chatModels, [chatId]: chatModels };
      
      storage.saveChats(updatedChats);
      storage.saveActiveChat(chatId);
      
      return {
        chats: updatedChats,
        activeChat: chatId,
        chatModels: updatedChatModels,
      };
    });

    return chatId;
  },

  setActiveChat: (chatId) => {
    if (get().chats[chatId]) {
      storage.saveActiveChat(chatId);
      set({ activeChat: chatId });
    }
  },

  deleteChat: (chatId) => {
    set((state) => {
      const { [chatId]: deletedChat, ...remainingChats } = state.chats;
      const { [chatId]: deletedModels, ...remainingModels } = state.chatModels;
      const newActiveChat = state.activeChat === chatId ? null : state.activeChat;
      
      storage.saveChats(remainingChats);
      storage.saveActiveChat(newActiveChat);
      
      return {
        chats: remainingChats,
        activeChat: newActiveChat,
        chatModels: remainingModels,
      };
    });
  },

  clearMessages: () => {
    const { activeChat } = get();
    if (!activeChat || !get().chats[activeChat]) return;

    set((state) => {
      const updatedChats = {
        ...state.chats,
        [activeChat]: {
          ...state.chats[activeChat],
          messages: [],
          updatedAt: Date.now()
        }
      };
      storage.saveChats(updatedChats);

      const newModels = {
        gemini: new GeminiChat(),
        xai: new XAIChat()
      };
      const updatedChatModels = {
        ...state.chatModels,
        [activeChat]: newModels
      };

      return { 
        chats: updatedChats,
        chatModels: updatedChatModels
      };
    });
  },

  clearAllChats: () => {
    storage.clearStorage();
    set({
      chats: {},
      activeChat: null,
      chatModels: {},
    });
  },

  toggleTheme: () => {
    set((state) => {
      let newTheme: 'light' | 'dark' | 'system';
      
      if (state.theme === 'system') {
        newTheme = 'light';
      } else if (state.theme === 'light') {
        newTheme = 'dark';
      } else {
        newTheme = 'system';
      }
      
      setTheme(newTheme);
      return { theme: newTheme };
    });
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  setEditingMessageId: (messageId) => {
    set({ editingMessageId: messageId });
  },

  editMessage: async (messageId, content) => {
    const { activeChat, activeModel, chatModels } = get();
    if (!activeChat || !get().chats[activeChat]) return;

    const chat = get().chats[activeChat];
    const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const updatedMessages = chat.messages.slice(0, messageIndex);
    
    const editedMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now()
    };
    updatedMessages.push(editedMessage);

    const models = chatModels[activeChat];
    if (activeModel === 'gemini') {
      models.gemini.setHistory(updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    } else {
      models.xai.setHistory(updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    set((state) => {
      const updatedChats = {
        ...state.chats,
        [activeChat]: {
          ...chat,
          messages: updatedMessages,
          title: messageIndex === 0 ? content.slice(0, 50) : chat.title,
          updatedAt: Date.now()
        }
      };
      storage.saveChats(updatedChats);
      return {
        chats: updatedChats,
        editingMessageId: null,
        loading: true,
        isGenerating: true
      };
    });

    try {
      const models = get().chatModels[activeChat];
      const response = activeModel === 'gemini' 
        ? await models.gemini.sendMessage(content)
        : await models.xai.sendMessage(content);
      
      if (!response) {
        set({ loading: false, isGenerating: false });
        return;
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        content: response,
        role: 'assistant',
        timestamp: Date.now()
      };

      set((state) => {
        const updatedChats = {
          ...state.chats,
          [activeChat]: {
            ...state.chats[activeChat],
            messages: [...updatedMessages, assistantMessage],
            updatedAt: Date.now()
          }
        };
        storage.saveChats(updatedChats);
        return {
          chats: updatedChats,
          loading: false,
          isGenerating: false
        };
      });
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        content: error instanceof Error ? error.message : 'Bir hata oluştu',
        role: 'assistant',
        timestamp: Date.now(),
        error: true
      };

      set((state) => {
        const updatedChats = {
          ...state.chats,
          [activeChat]: {
            ...state.chats[activeChat],
            messages: [...updatedMessages, errorMessage],
            updatedAt: Date.now()
          }
        };
        storage.saveChats(updatedChats);
        return {
          chats: updatedChats,
          loading: false,
          isGenerating: false
        };
      });
    }
  },

  sendMessage: async (content) => {
    let chatId = get().activeChat;
    
    if (!chatId || !get().chats[chatId]) {
      chatId = get().createChat();
    }

    const messageId = uuidv4();
    const userMessage: Message = {
      id: messageId,
      content,
      role: 'user',
      timestamp: Date.now()
    };

    const loadingMessage: Message = {
      id: uuidv4(),
      content: '',
      role: 'assistant',
      timestamp: Date.now()
    };

    set((state) => {
      const chat = state.chats[chatId!];
      const updatedChats = {
        ...state.chats,
        [chatId!]: {
          ...chat,
          messages: [...chat.messages, userMessage, loadingMessage],
          title: chat.messages.length === 0 ? content.slice(0, 50) : chat.title,
          updatedAt: Date.now()
        }
      };
      storage.saveChats(updatedChats);
      return {
        chats: updatedChats,
        loading: true,
        isGenerating: true
      };
    });

    try {
      const { activeModel, chatModels } = get();
      const models = chatModels[chatId];
      const response = activeModel === 'gemini'
        ? await models.gemini.sendMessage(content)
        : await models.xai.sendMessage(content);
      
      if (!response) {
        set({ loading: false, isGenerating: false });
        return;
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        content: response,
        role: 'assistant',
        timestamp: Date.now()
      };

      set((state) => {
        const chat = state.chats[chatId!];
        const messages = chat.messages.slice(0, -1);
        const updatedChats = {
          ...state.chats,
          [chatId!]: {
            ...chat,
            messages: [...messages, assistantMessage],
            updatedAt: Date.now()
          }
        };
        storage.saveChats(updatedChats);
        return {
          chats: updatedChats,
          loading: false,
          isGenerating: false
        };
      });
    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        content: error instanceof Error ? error.message : 'Bir hata oluştu',
        role: 'assistant',
        timestamp: Date.now(),
        error: true
      };

      set((state) => {
        const chat = state.chats[chatId!];
        const messages = chat.messages.slice(0, -1);
        const updatedChats = {
          ...state.chats,
          [chatId!]: {
            ...chat,
            messages: [...messages, errorMessage],
            updatedAt: Date.now()
          }
        };
        storage.saveChats(updatedChats);
        return {
          chats: updatedChats,
          loading: false,
          isGenerating: false
        };
      });
    }
  },

  stopGeneration: () => {
    const { activeChat, activeModel, chatModels } = get();
    if (!activeChat || !get().chats[activeChat]) return;

    const models = chatModels[activeChat];
    if (activeModel === 'gemini') {
      models.gemini.abortGeneration();
    } else {
      models.xai.abortGeneration();
    }
    set({ 
      isGenerating: false,
      loading: false 
    });
  },

  continueGeneration: async (messageId) => {
    const { activeChat, activeModel, chatModels } = get();
    if (!activeChat || !get().chats[activeChat]) return;

    const chat = get().chats[activeChat];
    const message = chat.messages.find(msg => msg.id === messageId);
    if (!message || message.role !== 'assistant') return;

    set({ loading: true, isGenerating: true });

    try {
      const models = chatModels[activeChat];
      const response = activeModel === 'gemini'
        ? await models.gemini.continueGeneration()
        : await models.xai.continueGeneration();

      if (!response) {
        set({ loading: false, isGenerating: false });
        return;
      }

      set((state) => {
        const updatedMessages = state.chats[activeChat].messages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: msg.content + '\n\n' + response }
            : msg
        );

        const updatedChats = {
          ...state.chats,
          [activeChat]: {
            ...state.chats[activeChat],
            messages: updatedMessages,
            updatedAt: Date.now()
          }
        };

        storage.saveChats(updatedChats);
        return {
          chats: updatedChats,
          loading: false,
          isGenerating: false
        };
      });
    } catch (error) {
      console.error('Continue generation error:', error);
      set({ loading: false, isGenerating: false });
    }
  }
}));