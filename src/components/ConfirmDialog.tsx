import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-md w-full p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}