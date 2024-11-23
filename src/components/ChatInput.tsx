import React, { useState, useRef, useEffect } from 'react';
import { Bot, FileText, Mic, Send, Square, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chat';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isGenerating, stopGeneration, createChat, activeChat } = useChatStore();

  const suggestions = [
    "Yapay zeka hakkında bilgi ver",
    "Python ile web scraping nasıl yapılır?",
    "React hooks nedir?",
    "Modern web teknolojileri nelerdir?"
  ];

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      if (!activeChat) {
        createChat();
      }
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload
  };

  const canSubmit = input.trim().length > 0 && !disabled;

  return (
    <div className="relative">
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 mb-2 mx-4"
          >
            <div className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg p-2 space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary/80 text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-xl bg-secondary/50 dark:bg-secondary/30 shadow-sm px-3">
              <button
                type="button"
                onClick={handleFileUpload}
                className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                title="Dosya yükle"
              >
                <Upload className="h-4 w-4 stroke-[1.5px]" />
              </button>

              <div className="flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Mesajınızı yazın..."
                  disabled={disabled}
                  rows={1}
                  className={cn(
                    "w-full resize-none bg-transparent",
                    "focus:outline-none focus:ring-0",
                    "disabled:opacity-50 transition-all duration-200",
                    "py-2.5 px-0 min-h-[40px] max-h-[120px]",
                    "scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20",
                    "dark:scrollbar-thumb-primary/20 dark:hover:scrollbar-thumb-primary/30",
                    "placeholder:text-muted-foreground text-foreground text-sm leading-relaxed"
                  )}
                  style={{
                    margin: 0,
                    display: 'block'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-md transition-colors",
                  isRecording
                    ? "bg-destructive/10 text-destructive"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
                title={isRecording ? "Kaydı durdur" : "Sesli mesaj"}
              >
                <Mic className="h-4 w-4 stroke-[1.5px]" />
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-md transition-colors flex-shrink-0",
                  canSubmit ? [
                    "bg-primary text-primary-foreground",
                    "hover:opacity-90"
                  ] : [
                    "bg-muted text-muted-foreground",
                    "cursor-not-allowed"
                  ]
                )}
                title="Gönder"
              >
                <Send className="h-4 w-4 stroke-[1.5px]" />
              </button>
            </div>

            {isGenerating && (
              <button
                type="button"
                onClick={stopGeneration}
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-md",
                  "bg-destructive text-destructive-foreground",
                  "hover:opacity-90 transition-colors"
                )}
                title="Yanıtı durdur"
              >
                <Square className="h-4 w-4 stroke-[1.5px]" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                ToGPT AI Asistanı
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Markdown desteklenir
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}