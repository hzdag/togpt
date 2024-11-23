import type { GeminiConfig } from '../types/gemini';

export const GEMINI_CONFIGS: Record<string, GeminiConfig> = {
  fast: {
    temperature: 0.7,
    topK: 10,
    topP: 0.8,
    maxOutputTokens: 250,
    candidateCount: 1,
  },
  balanced: {
    temperature: 0.8,
    topK: 20,
    topP: 0.9,
    maxOutputTokens: 500,
    candidateCount: 1,
  },
  thorough: {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 800,
    candidateCount: 1,
  },
};

// Optimize response generation
export const GENERATION_CONFIG = {
  stopSequences: ['\n\n\n', '###'],
  maxRetries: 2,
  retryDelay: 500,
  chunkSize: 5,
  typingDelay: {
    base: 10,
    punctuation: 100,
  },
  streamBuffer: {
    size: 1024,
    flushInterval: 50,
  },
};