import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-secondary/50 dark:bg-secondary/20">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 dark:bg-secondary/40 backdrop-blur-sm border-b border-border">
        {language && (
          <span className="text-xs font-medium text-secondary-foreground">
            {language}
          </span>
        )}
        <button
          onClick={copyToClipboard}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
            'bg-secondary/50 hover:bg-secondary dark:hover:bg-secondary/60',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
            'text-secondary-foreground'
          )}
          aria-label="Kodu kopyala"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span>Kopyalandı!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Kopyala</span>
            </>
          )}
        </button>
      </div>
      <div 
        className={cn(
          "overflow-x-auto p-4",
          "scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent",
          "font-mono text-sm leading-relaxed"
        )}
        dir="ltr"
      >
        <pre className="whitespace-pre">
          {code.split('\n').map((line, i) => (
            <div 
              key={i} 
              className={cn(
                "px-2 border-l-2 border-transparent",
                "hover:bg-secondary/30 dark:hover:bg-secondary/10",
                "transition-colors"
              )}
            >
              {line || '\n'}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}