import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Clock } from 'lucide-react';
import {
  CATEGORIES,
  searchEmojis,
  filterByCategory,
  getRecentEmojis,
  addRecentEmoji,
  type EmojiCategory,
} from '@/utils/emojiData';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<EmojiCategory | 'All' | 'Recent'>('All');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(getRecentEmojis());
  const filteredEmojis = useMemo(() => {
    if (query.trim()) {
      return searchEmojis(query);
    }
    if (activeCategory === 'All') {
      return searchEmojis('');
    }
    if (activeCategory === 'Recent') {
      return [];
    }
    return filterByCategory(activeCategory);
  }, [query, activeCategory]);

  const handleEmojiClick = useCallback(
    async (emoji: string) => {
      try {
        await navigator.clipboard.writeText(emoji);
        addRecentEmoji(emoji);
        setRecentEmojis(getRecentEmojis());
        toast.add({ title: `${emoji} copied!` });
      } catch {
        toast.add({ title: 'Copy failed', type: "error" });
      }
    },
    [toast]
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Emoji Search</h1>
            <p className="text-muted-foreground">
              Search and copy emojis. Click any emoji to copy it to clipboard.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emoji by name or keyword..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value) setActiveCategory('All');
                  }}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant={activeCategory === 'All' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveCategory('All');
                    setQuery('');
                  }}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={activeCategory === 'Recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveCategory('Recent');
                    setQuery('');
                  }}
                >
                  <Clock className="mr-1 h-3 w-3" /> Recent
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    type="button"
                    key={cat}
                    variant={activeCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setActiveCategory(cat);
                      setQuery('');
                    }}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {activeCategory === 'Recent' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Recently Used
                </CardTitle>
                <CardDescription>Click to copy again.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentEmojis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recently used emojis yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {recentEmojis.map((emoji, i) => (
                      <button
                        key={`${emoji}-${i}`}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                        title="Click to copy"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeCategory !== 'Recent' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {query ? `Results for "${query}"` : activeCategory === 'All' ? 'All Emojis' : activeCategory}
                </CardTitle>
                <CardDescription>{filteredEmojis.length} emojis found</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEmojis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No emojis found.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {filteredEmojis.map((item, i) => (
                      <button
                        key={`${item.emoji}-${i}`}
                        type="button"
                        onClick={() => handleEmojiClick(item.emoji)}
                        className="text-2xl p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                        title={item.name}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
