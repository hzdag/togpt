import React, { useEffect, useRef, useState } from 'react';
import { Code, Lightbulb, MessageSquare, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Toast } from './components/Toast';
import { SettingsModal } from './components/SettingsModal';
import { useChatStore } from './store/chat';
import { usePreferences } from './store/preferences';
import { useMediaQuery } from './hooks/useMediaQuery';
import { cn } from './lib/utils';
import { AVAILABLE_MODELS } from './lib/config/models';

const SUGGESTIONS = [
  {
    icon: '🤖',
    title: 'Yapay Zeka',
    description: 'Yapay zeka ve geleceği hakkında bilgi al',
    prompts: [
      'Yapay zeka teknolojisinin günümüzdeki durumu ve gelecekteki potansiyel etkileri hakkında bilgi verir misin?',
      'Yapay zekanın sağlık sektöründeki uygulamaları nelerdir?',
      'Yapay zeka ve etik konusunda neler düşünüyorsun?',
      'Yapay zekanın eğitim alanındaki potansiyel kullanımları nelerdir?',
      'Yapay zeka destekli robotların gelecekteki rolü ne olabilir?'
    ]
  },
  {
    icon: '💻',
    title: 'Kod Yardımı',
    description: 'Programlama konusunda destek al',
    prompts: [
      'React ve TypeScript kullanarak modern bir web uygulaması geliştirmek için en iyi pratikler nelerdir?',
      'JavaScript promise ve async/await kullanımı hakkında bilgi verir misin?',
      'React hooks kullanarak state yönetimi nasıl yapılır?',
      'TypeScript ile tip güvenliği nasıl sağlanır?',
      'Modern web geliştirme için önerilen araçlar nelerdir?'
    ]
  },
  {
    icon: '💡',
    title: 'İş Fikirleri',
    description: 'Yenilikçi iş fikirleri keşfet',
    prompts: [
      'Yapay zeka teknolojilerini kullanarak geliştirebileceğim yenilikçi bir iş fikri önerir misin?',
      'Sürdürülebilir ve çevre dostu bir iş modeli için önerilerin neler?',
      'E-ticaret alanında yeni trendler ve fırsatlar nelerdir?',
      'Dijital pazarlama alanında yenilikçi bir iş fikri önerir misin?',
      'Mobil uygulama pazarında henüz doyurulmamış hangi ihtiyaçlar var?'
    ]
  }
];

export default function App() {
  const { 
    activeChat,
    chats, 
    loading,
    sendMessage,
    theme,
    createChat,
    showModelChangeToast,
    hideModelChangeToast,
    activeModel
  } = useChatStore();
  
  const { preferences } = usePreferences();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const activeMessages = activeChat ? chats[activeChat]?.messages : [];
  const currentModel = AVAILABLE_MODELS.find(model => model.id === activeModel);

  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  useEffect(() => {
    if (activeMessages?.length) {
      scrollToBottom();
    }
  }, [activeMessages?.length]);

  const getRandomPrompt = (prompts: string[]) => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  };

  const handleSuggestionClick = (suggestion: typeof SUGGESTIONS[0]) => {
    if (!activeChat) {
      createChat();
    }
    const randomPrompt = getRandomPrompt(suggestion.prompts);
    sendMessage(randomPrompt);
  };

  return (
    <>
      {showToast && (
        <Toast
          message="AI Yanıt hızı değişti"
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}

      {showModelChangeToast && (
        <Toast
          message={`AI Modeli ${currentModel?.name} olarak değiştirildi`}
          type="info"
          duration={3000}
          onClose={hideModelChangeToast}
        />
      )}
      
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <div className={cn(
          "transition-all duration-300 relative",
          showSidebar ? 'w-[260px] md:w-[300px]' : 'w-0'
        )}>
          {showSidebar && (
            <div className="h-full">
              <ChatSidebar onSpeedChange={() => setShowToast(true)} />
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col relative max-h-screen">
          <Header 
            showSidebar={showSidebar} 
            setShowSidebar={setShowSidebar}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
            <div className="h-full">
              {!activeChat || activeMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-start px-4 py-8 max-w-4xl mx-auto w-full">
                  <div className="space-y-6 text-center">
                    <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                      ToGPT'ye Hoş Geldiniz
                    </h2>
                    <p className="text-base text-muted-foreground">
                      Size nasıl yardımcı olabilirim?
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8 w-full">
                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2 hover:bg-secondary/70 transition-colors group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-4 w-4 stroke-[1.5px]" />
                      </div>
                      <h3 className="text-base font-medium">Akıllı Sohbet</h3>
                      <p className="text-sm text-muted-foreground">Her konuda derin ve anlamlı konuşmalar yapın</p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2 hover:bg-secondary/70 transition-colors group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Code className="h-4 w-4 stroke-[1.5px]" />
                      </div>
                      <h3 className="text-base font-medium">Kod Asistanı</h3>
                      <p className="text-sm text-muted-foreground">Programlama ve teknik konularda uzman yardımı alın</p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50 space-y-2 hover:bg-secondary/70 transition-colors group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Lightbulb className="h-4 w-4 stroke-[1.5px]" />
                      </div>
                      <h3 className="text-base font-medium">Yaratıcı Fikirler</h3>
                      <p className="text-sm text-muted-foreground">Projeleriniz için yeni perspektifler keşfedin</p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-8 w-full">
                    <div className="flex items-center gap-2 justify-center">
                      <Sparkles className="w-4 h-4 text-primary stroke-[1.5px]" />
                      <h3 className="text-base font-medium">Önerilen Sorular</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {SUGGESTIONS.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={cn(
                            "p-4 rounded-xl transition-all duration-300",
                            "bg-gradient-to-r from-secondary/50 to-secondary/30",
                            "hover:from-primary/20 hover:to-primary/10",
                            "flex items-center gap-4",
                            "group relative overflow-hidden"
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-xl">{suggestion.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="text-sm font-medium mb-1">{suggestion.title}</h4>
                            <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  'max-w-3xl mx-auto px-4 py-4 space-y-6',
                  preferences.messageStyle === 'compact' && 'space-y-1'
                )}>
                  {activeMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onTypingComplete={scrollToBottom}
                    />
                  ))}
                  <div ref={messagesEndRef} className="h-32" />
                </div>
              )}
            </div>
          </main>

          <div className="relative">
            <div className="absolute bottom-full left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSpeedChange={() => setShowToast(true)}
      />
    </>
  );
}