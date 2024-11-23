import React from 'react';
import { Globe, Zap } from 'lucide-react';
import { AVAILABLE_MODELS } from '../lib/config/models';
import { useChatStore } from '../store/chat';
import { cn } from '../lib/utils';

export function ModelSelector() {
  const { activeModel, setActiveModel, modelSwitchCooldown } = useChatStore();

  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="space-y-1 mb-3">
        <h3 className="text-sm font-medium">AI Modeli</h3>
        <p className="text-xs text-muted-foreground">
          Sohbet etmek istediğiniz AI modelini seçin
        </p>
      </div>
      <div className="space-y-2">
        {AVAILABLE_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => setActiveModel(model.id)}
            disabled={modelSwitchCooldown && model.id !== activeModel}
            className={cn(
              'w-full px-3 py-2 rounded-lg text-left transition-colors',
              'hover:bg-secondary',
              activeModel === model.id && 'bg-primary/10 dark:bg-primary/20 text-primary',
              modelSwitchCooldown && model.id !== activeModel && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="space-y-1">
              <div className="font-medium flex items-center gap-2">
                {model.name}
                {model.id === 'grok' ? (
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">{model.description}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {model.features.map((feature, index) => (
                  <span
                    key={index}
                    className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px]",
                      "bg-secondary/50 text-secondary-foreground"
                    )}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}