import React, { useState } from 'react';
import { Bot, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sun, Trash2 } from 'lucide-react';
import { useChatStore } from '../store/chat';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '../lib/utils';

interface HeaderProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  onOpenSettings: () => void;
}

export function Header({ showSidebar, setShowSidebar, onOpenSettings }: HeaderProps) {
  const { theme, toggleTheme, clearMessages, activeChat, deleteChat } = useChatStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const isDarkMode = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleDelete = () => {
    if (activeChat) {
      deleteChat(activeChat);
    }
    setShowConfirmDialog(false);
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border">
        <div className="bg-background/80 backdrop-blur-sm">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                    "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                  title={showSidebar ? "Kenar çubuğunu gizle" : "Kenar çubuğunu göster"}
                >
                  {showSidebar ? (
                    <PanelLeftClose className="h-5 w-5 stroke-[1.5px]" />
                  ) : (
                    <PanelLeftOpen className="h-5 w-5 stroke-[1.5px]" />
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-5 w-5 stroke-[1.5px]" />
                  </div>
                  <div className="hidden md:block">
                    <h1 className="text-lg font-semibold leading-none mb-1">ToGPT</h1>
                    <p className="text-sm text-muted-foreground">AI Asistanınız</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeChat && (
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                      "hover:bg-destructive/10 text-destructive"
                    )}
                    title="Sohbeti sil"
                  >
                    <Trash2 className="h-5 w-5 stroke-[1.5px]" />
                  </button>
                )}

                <button
                  onClick={handleThemeToggle}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                    "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                  title={isDarkMode ? "Açık tema" : "Koyu tema"}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 stroke-[1.5px]" />
                  ) : (
                    <Moon className="h-5 w-5 stroke-[1.5px]" />
                  )}
                </button>

                <button
                  onClick={onOpenSettings}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2",
                    "bg-primary/10 hover:bg-primary/20 text-primary"
                  )}
                >
                  <Settings className="h-4 w-4 stroke-[1.5px]" />
                  <span className="text-sm font-medium">Ayarlar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Sohbeti Sil"
        message="Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
}