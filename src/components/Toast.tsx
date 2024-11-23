import React, { useEffect, useState } from 'react';
import { Check, Bot } from 'lucide-react';
import { cn } from '../lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        setIsVisible(false);
        setTimeout(onClose, 300);
      } else {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      clearTimeout(showTimeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/90',
      text: 'text-green-800 dark:text-green-100',
      icon: 'bg-green-100 dark:bg-green-800',
      progress: 'bg-green-500 dark:bg-green-400',
      progressBg: 'bg-green-100/50 dark:bg-green-800/50'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/90',
      text: 'text-blue-800 dark:text-blue-100',
      icon: 'bg-blue-100 dark:bg-blue-800',
      progress: 'bg-blue-500 dark:bg-blue-400',
      progressBg: 'bg-blue-100/50 dark:bg-blue-800/50'
    }
  };

  const style = styles[type];

  return (
    <div
      className={cn(
        'fixed top-0 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-300',
        isVisible ? 'translate-y-4 opacity-100' : '-translate-y-full opacity-0'
      )}
    >
      <div className={cn(style.bg, style.text, 'rounded-lg shadow-lg overflow-hidden backdrop-blur-sm')}>
        <div className="flex items-center gap-2 p-4">
          <div className={cn('flex-shrink-0 rounded-full p-1', style.icon)}>
            {type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          <p className="font-medium">{message}</p>
        </div>
        <div className={cn('h-1 relative overflow-hidden', style.progressBg)}>
          <div
            className={cn('absolute inset-y-0 right-0 transition-all duration-100 ease-linear', style.progress)}
            style={{ width: `${100 - progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}