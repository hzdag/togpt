import { encryptData, decryptData } from './encryption';
import type { ChatHistory } from '../types';

const CHATS_STORAGE_KEY = 'togpt-chats';
const ACTIVE_CHAT_KEY = 'togpt-active-chat';

function isValidChat(chat: any): chat is ChatHistory {
  return (
    chat &&
    typeof chat.id === 'string' &&
    typeof chat.title === 'string' &&
    typeof chat.createdAt === 'number' &&
    typeof chat.updatedAt === 'number' &&
    Array.isArray(chat.messages) &&
    chat.messages.every((msg: any) =>
      msg &&
      typeof msg.id === 'string' &&
      typeof msg.content === 'string' &&
      (msg.role === 'user' || msg.role === 'assistant') &&
      typeof msg.timestamp === 'number'
    )
  );
}

export const storage = {
  saveChats(chats: Record<string, ChatHistory>) {
    try {
      const serialized = JSON.stringify(chats);
      const encrypted = encryptData(serialized);
      localStorage.setItem(CHATS_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to save chats:', error);
    }
  },

  loadChats(): Record<string, ChatHistory> {
    try {
      const encrypted = localStorage.getItem(CHATS_STORAGE_KEY);
      if (!encrypted) return {};

      const decrypted = decryptData(encrypted);
      const chats = JSON.parse(decrypted);

      // Validate and sanitize loaded data
      return Object.entries(chats).reduce((acc, [id, chat]) => {
        if (isValidChat(chat)) {
          acc[id] = chat;
        }
        return acc;
      }, {} as Record<string, ChatHistory>);
    } catch (error) {
      console.error('Failed to load chats:', error);
      return {};
    }
  },

  saveActiveChat(chatId: string | null) {
    try {
      if (chatId) {
        localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
      } else {
        localStorage.removeItem(ACTIVE_CHAT_KEY);
      }
    } catch (error) {
      console.error('Failed to save active chat:', error);
    }
  },

  loadActiveChat(): string | null {
    try {
      return localStorage.getItem(ACTIVE_CHAT_KEY);
    } catch (error) {
      console.error('Failed to load active chat:', error);
      return null;
    }
  },

  clearStorage() {
    try {
      localStorage.removeItem(CHATS_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
};