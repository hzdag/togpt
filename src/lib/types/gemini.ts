export interface GeminiConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  candidateCount: number;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiError extends Error {
  code?: string;
  status?: number;
  details?: string;
}