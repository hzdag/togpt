import React, { useState } from 'react';
import { AlertCircle, Loader2, X, Sun, Moon, Zap } from 'lucide-react';
import { usePreferences } from '../store/preferences';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeedChange: () => void;
}

interface SettingOptionProps<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  current: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

function SettingOption<T extends string>({
  value,
  label,
  description,
  icon,
  current,
  onChange,
  disabled,
}: SettingOptionProps<T>) {
  return (
    <button
      onClick={() => onChange(value)}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2 rounded-lg transition-all',
        'text-left relative overflow-hidden group',
        'hover:bg-secondary/80',
        current === value
          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
          : 'hover:bg-secondary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-secondary/50 dark:bg-secondary/30",
            current === value && "bg-primary/10 dark:bg-primary/20 text-primary"
          )}>
            {icon}
          </div>
        )}
        <div>
          <div className="font-medium text-sm">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
          )}
        </div>
      </div>
    </button>
  );
}

export function SettingsModal({ isOpen, onClose, onSpeedChange }: SettingsModalProps) {
  const { preferences, updatePreferences, error, isLoading } = usePreferences();
  const [currentSpeed, setCurrentSpeed] = useState(preferences.responseSpeed);
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const handleSpeedChange = (value: typeof preferences.responseSpeed) => {
    setCurrentSpeed(value);
    setHasChanges(true);
  };

  const handleFontSizeChange = async (value: typeof preferences.fontSize) => {
    await updatePreferences({ fontSize: value });
    setHasChanges(true);
  };

  const handleClose = async () => {
    if (currentSpeed !== preferences.responseSpeed) {
      await updatePreferences({ responseSpeed: currentSpeed });
      onSpeedChange();
    }
    setHasChanges(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-40">
      <div className="bg-background rounded-lg w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Ayarlar</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <section className="space-y-2">
            <div className="text-sm font-medium mb-2">Yazı Boyutu</div>
            <div className="grid gap-2">
              <SettingOption
                value="small"
                label="Küçük"
                description="Daha fazla içerik görüntüle"
                icon={<span className="text-sm">A</span>}
                current={preferences.fontSize}
                onChange={handleFontSizeChange}
                disabled={isLoading}
              />
              <SettingOption
                value="medium"
                label="Orta"
                description="Önerilen boyut"
                icon={<span className="text-base">A</span>}
                current={preferences.fontSize}
                onChange={handleFontSizeChange}
                disabled={isLoading}
              />
              <SettingOption
                value="large"
                label="Büyük"
                description="Kolay okunabilirlik"
                icon={<span className="text-lg">A</span>}
                current={preferences.fontSize}
                onChange={handleFontSizeChange}
                disabled={isLoading}
              />
            </div>
          </section>

          <section className="space-y-2">
            <div className="text-sm font-medium mb-2">Yanıt Hızı</div>
            <div className="grid gap-2">
              <SettingOption
                value="fast"
                label="Hızlı"
                description="Kısa ve öz yanıtlar"
                icon={<Zap className="h-4 w-4" />}
                current={currentSpeed}
                onChange={handleSpeedChange}
                disabled={isLoading}
              />
              <SettingOption
                value="balanced"
                label="Dengeli"
                description="Önerilen hız"
                icon={<Zap className="h-4 w-4" />}
                current={currentSpeed}
                onChange={handleSpeedChange}
                disabled={isLoading}
              />
              <SettingOption
                value="thorough"
                label="Detaylı"
                description="Kapsamlı yanıtlar"
                icon={<Zap className="h-4 w-4" />}
                current={currentSpeed}
                onChange={handleSpeedChange}
                disabled={isLoading}
              />
            </div>
          </section>
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            {isLoading && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            )}
            {hasChanges && !isLoading && (
              <span>Değişiklikler kaydedildi</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-colors",
              hasChanges
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}