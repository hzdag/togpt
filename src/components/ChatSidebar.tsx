import React, { useState } from 'react';
import { MessageSquare, Search, Trash2, XCircle } from 'lucide-react';
import { useChatStore } from '../store/chat';
import { cn } from '../lib/utils';
import { ConfirmDialog } from './ConfirmDialog';
import { ModelSelector } from './ModelSelector';

interface ChatSidebarProps {
  onSpeedChange: () => void;
}

export function ChatSidebar({ onSpeedChange }: ChatSidebarProps) {
  const {
    chats,
    activeChat,
    setActiveChat,
    createChat,
    deleteChat,
    searchTerm,
    setSearchTerm,
    clearAllChats
  } = useChatStore();

  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredChats = Object.values(chats)
    .filter((chat) =>
      chat.title.toLowerCase().includes((searchTerm || '').toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    setChatToDelete(null);
  };

  const handleClearAllChats = () => {
    clearAllChats();
    setShowClearConfirm(false);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex-shrink-0 space-y-2 p-4 border-b border-border">
          <button
            onClick={() => createChat()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Yeni Sohbet
          </button>
          
          {Object.keys(chats).length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full px-4 py-2 text-destructive hover:text-destructive-foreground bg-destructive/10 hover:bg-destructive rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Tüm Sohbetleri Sil</span>
            </button>
          )}
        </div>
        
        <ModelSelector />

        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Sohbetlerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  'p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground',
                  'transition-colors duration-200',
                  activeChat === chat.id && 'bg-accent text-accent-foreground'
                )}
                onClick={() => setActiveChat(chat.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 stroke-[1.5px]" />
                    <span className="truncate text-sm">{chat.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat.id);
                    }}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                    title="Sohbeti sil"
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-[1.5px]" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {searchTerm ? 'Sonuç bulunamadı' : 'Henüz sohbet yok'}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!chatToDelete}
        title="Sohbeti Sil"
        message="Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        onConfirm={() => chatToDelete && handleDeleteChat(chatToDelete)}
        onCancel={() => setChatToDelete(null)}
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Tüm Sohbetleri Sil"
        message="Tüm sohbetleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        onConfirm={handleClearAllChats}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
}