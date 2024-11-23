import type { GeminiError } from '../types/gemini';

export function handleGeminiError(error: unknown): never {
  const err = error as GeminiError;
  
  // Log detailed error for debugging
  console.error('Gemini Error:', {
    message: err.message,
    code: err.code,
    status: err.status,
    details: err.details,
    stack: err.stack,
  });
  
  // Network errors
  if (err.message?.includes('Failed to fetch') || 
      err.message?.includes('network') || 
      err.message?.includes('CORS')) {
    throw new Error('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.');
  }
  
  // API-specific errors
  if (err.code === 'INVALID_ARGUMENT') {
    throw new Error('Geçersiz istek. Lütfen girdilerinizi kontrol edip tekrar deneyin.');
  }
  
  // Rate limiting
  if (err.status === 429) {
    throw new Error('Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.');
  }
  
  // Authentication errors
  if (err.status === 401 || err.status === 403) {
    throw new Error('Yetkilendirme hatası. Lütfen daha sonra tekrar deneyin.');
  }
  
  // Server errors
  if (err.status && err.status >= 500) {
    throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
  }
  
  // Generic error
  throw new Error('Bir hata oluştu. Lütfen tekrar deneyin.');
}