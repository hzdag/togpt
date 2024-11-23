import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences } from '../types';

interface PreferencesStore {
  preferences: UserPreferences;
  error: string | null;
  isLoading: boolean;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  setError: (error: string | null) => void;
}

const defaultPreferences: UserPreferences = {
  fontSize: 'medium',
  responseSpeed: 'balanced',
  language: 'auto'
};

const validatePreferences = (prefs: Partial<UserPreferences>): string | null => {
  if (prefs.fontSize && !['small', 'medium', 'large'].includes(prefs.fontSize)) {
    return 'Geçersiz yazı boyutu seçildi';
  }
  if (prefs.responseSpeed && !['fast', 'balanced', 'thorough'].includes(prefs.responseSpeed)) {
    return 'Geçersiz yanıt hızı seçildi';
  }
  return null;
};

export const usePreferences = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      error: null,
      isLoading: false,

      updatePreferences: async (newPreferences) => {
        set({ isLoading: true, error: null });
        
        try {
          const validationError = validatePreferences(newPreferences);
          if (validationError) {
            throw new Error(validationError);
          }

          // Add a small delay for UI feedback
          await new Promise(resolve => setTimeout(resolve, 300));

          // Update preferences and apply font size
          const updatedPreferences = {
            ...get().preferences,
            ...newPreferences
          };

          // Apply font size to root element
          if (newPreferences.fontSize) {
            document.documentElement.style.fontSize = {
              small: '14px',
              medium: '16px',
              large: '18px'
            }[newPreferences.fontSize];
          }

          set({
            preferences: updatedPreferences,
            isLoading: false
          });

          // Save to localStorage
          try {
            localStorage.setItem(
              'app-preferences',
              JSON.stringify(updatedPreferences)
            );
          } catch (e) {
            console.error('Failed to save preferences:', e);
            throw new Error('Tercihler kaydedilemedi');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
            isLoading: false,
          });
        }
      },

      setError: (error) => set({ error }),
    }),
    {
      name: 'user-preferences',
      partialize: (state) => ({ preferences: state.preferences }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            preferences: {
              ...defaultPreferences,
              ...persistedState.preferences,
            }
          };
        }
        return persistedState;
      },
    }
  )
);