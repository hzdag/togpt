import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Bot, Check, Copy, MessageSquare, Pencil, ThumbsDown, ThumbsUp, User, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useChatStore } from '../store/chat';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onTypingComplete?: () => void;
}

export function ChatMessage({ message, onTypingComplete }: ChatMessageProps) {
  const isBot = message.role === 'assistant';
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [copied, setCopied] = useState(false);
  const { isGenerating, editingMessageId, setEditingMessageId, editMessage, continueGeneration } = useChatStore();
  const isEditing = editingMessageId === message.id;

  const isTruncated = isBot && (
    message.content.endsWith('...') ||
    message.content.endsWith('…') ||
    message.content.endsWith('devam edecek') ||
    message.content.match(/(\w+|\.|,)$/)
  );

  useEffect(() => {
    if (isBot && !message.error && !message.isHistorical && !displayedContent) {
      setIsTyping(true);
      let index = 0;
      const content = message.content;
      let isCancelled = false;
      
      const typeNextChunk = () => {
        if (isCancelled) return;
        
        if (index < content.length) {
          const chunkSize = 5;
          const chunk = content.slice(index, index + chunkSize);
          const nextChar = content[index + chunkSize];
          
          let delay = 10;
          if ('.!?'.includes(chunk[chunk.length - 1]) && (!nextChar || nextChar === ' ')) {
            delay = 100;
          }
          
          setTimeout(() => {
            setDisplayedContent(content.slice(0, index + chunk.length));
            index += chunk.length;
            typeNextChunk();
          }, delay);
          
          if (index % 20 === 0) {
            onTypingComplete?.();
          }
        } else {
          setIsTyping(false);
          setShowFeedback(true);
          onTypingComplete?.();
        }
      };

      typeNextChunk();
      return () => { isCancelled = true; };
    } else {
      setDisplayedContent(message.content);
      setIsTyping(false);
      if (isBot) setShowFeedback(true);
      onTypingComplete?.();
    }
  }, [message.content, isBot, message.error, message.isHistorical, onTypingComplete]);

  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  const handleStartEdit = () => {
    if (!isBot && !isGenerating) {
      setEditingMessageId(message.id);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await editMessage(message.id, editContent.trim());
    }
    setEditingMessageId(null);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    // TODO: Implement feedback handling
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'px-4 py-6 transition-colors message-container',
        isBot ? 'bg-secondary/50 dark:bg-secondary/20' : 'bg-background'
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-6">
        <div className="flex-shrink-0 mt-1">
          {isBot ? (
            <div className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg shadow-sm',
              message.error 
                ? 'bg-destructive/10 text-destructive dark:bg-destructive/20' 
                : 'bg-primary/10 text-primary dark:bg-primary/20'
            )}>
              {message.error ? <AlertCircle className="h-3.5 w-3.5 stroke-[1.5px]" /> : <Bot className="h-3.5 w-3.5 stroke-[1.5px]" />}
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-secondary-foreground shadow-sm">
              <User className="h-3.5 w-3.5 stroke-[1.5px]" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2 message-content">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm flex items-center gap-2">
              <span>{isBot ? 'ToGPT' : 'Siz'}</span>
              {isTyping && isGenerating && (
                <span className="text-muted-foreground animate-pulse">yanıt yazıyor...</span>
              )}
            </div>
            {!isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                  title={copied ? 'Kopyalandı!' : 'Mesajı kopyala'}
                >
                  <Copy className="h-3.5 w-3.5 stroke-[1.5px]" />
                </button>
                {!isBot && (
                  <button
                    onClick={handleStartEdit}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                    title="Mesajı düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5 stroke-[1.5px]" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className={cn(
            'prose dark:prose-invert max-w-none',
            'prose-p:leading-7 prose-p:my-2',
            'prose-pre:my-4 prose-pre:rounded-lg',
            'prose-code:text-primary prose-code:dark:text-primary',
            message.error && 'text-destructive'
          )}>
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Mesajınızı düzenleyin..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="İptal"
                  >
                    <X className="h-3.5 w-3.5 stroke-[1.5px]" />
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                    title="Kaydet"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[1.5px]" />
                  </button>
                </div>
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {displayedContent}
              </ReactMarkdown>
            )}
          </div>
          
          <AnimatePresence>
            {isBot && showFeedback && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4 mt-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFeedback('like')}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      feedback === 'like'
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    title="Yararlı"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 stroke-[1.5px]" />
                  </button>
                  <button
                    onClick={() => handleFeedback('dislike')}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      feedback === 'dislike'
                        ? "bg-destructive/10 text-destructive"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    title="Yararlı değil"
                  >
                    <ThumbsDown className="h-3.5 w-3.5 stroke-[1.5px]" />
                  </button>
                </div>

                {isTruncated && !isGenerating && (
                  <button
                    onClick={() => continueGeneration(message.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg",
                      "bg-primary/10 hover:bg-primary/20",
                      "text-primary text-sm font-medium",
                      "transition-all duration-200",
                      "group"
                    )}
                  >
                    <span>Devam Ettir</span>
                    <ArrowRight className={cn(
                      "h-4 w-4 stroke-[1.5px]",
                      "transform group-hover:translate-x-1",
                      "transition-transform duration-200"
                    )} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}