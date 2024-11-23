import React, { useState } from 'react';
import { Search, X, ExternalLink, Loader2 } from 'lucide-react';
import { searchGoogle } from '../lib/search';
import { cn } from '../lib/utils';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ title: string; link: string; snippet: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchGoogle(query);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Arama yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50">
      <div className="bg-background rounded-lg w-full max-w-2xl mt-16 shadow-lg overflow-hidden">
        <form onSubmit={handleSearch} className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="İnternette ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2",
                "bg-secondary/50 dark:bg-secondary/30",
                "border border-input rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
          </div>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="space-y-2">
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "block group",
                      "hover:bg-secondary/50 rounded-lg p-2 -mx-2",
                      "transition-colors"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-primary group-hover:underline">
                        {result.title}
                      </h3>
                      <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.snippet}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {result.link}
                    </p>
                  </a>
                </div>
              ))}
            </div>
          ) : query && (
            <div className="text-center py-8 text-muted-foreground">
              Sonuç bulunamadı
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className={cn(
              "w-full px-4 py-2 rounded-lg",
              "bg-secondary/50 hover:bg-secondary/80",
              "transition-colors text-sm"
            )}
          >
            Kapat
          </button>
        </div>

        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4",
            "p-2 rounded-lg",
            "hover:bg-secondary/80",
            "transition-colors"
          )}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}