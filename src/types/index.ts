export interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large';
  responseSpeed: 'fast' | 'balanced' | 'thorough';
  language: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  archived?: boolean;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  error?: boolean;
  isHistorical?: boolean;
}