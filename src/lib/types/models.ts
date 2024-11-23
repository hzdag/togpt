export type AIModel = 'gemini' | 'grok';

export interface ModelConfig {
  id: AIModel;
  name: string;
  description: string;
  provider: string;
}