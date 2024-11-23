import type { AIModel } from '../types/models';

export const AVAILABLE_MODELS = [
  {
    id: 'gemini' as AIModel,
    name: 'ToGPT Pro',
    description: 'Hızlı ve güvenilir AI asistanınız',
    provider: 'ToGPT AI',
    features: [
      'Akıllı yanıtlar',
      'Kod desteği',
      'Görsel analiz',
      'Doğal diyalog'
    ],
    capabilities: {
      codeGeneration: true,
      imageAnalysis: true,
      contextualLearning: true,
      realTimeResponse: true
    },
    limits: {
      maxTokens: 2048,
      maxTurns: 30,
      maxImages: 5
    }
  },
  {
    id: 'grok' as AIModel,
    name: 'ToGPT X',
    description: 'Seçici internet erişimli gelişmiş AI modelimiz',
    provider: 'ToGPT AI',
    features: [
      'Akıllı internet erişimi',
      'Güncel bilgiler',
      'Kaynak gösterimi',
      'Veri analizi'
    ],
    capabilities: {
      webSearch: true,
      dataAnalysis: true,
      sourceCitation: true,
      realTimeData: true
    },
    limits: {
      maxTokens: 4096,
      maxTurns: 50,
      maxSearches: 3
    }
  }
];