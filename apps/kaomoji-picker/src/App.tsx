import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Clock } from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  searchKaomojis,
  filterByCategory,
  getRecentKaomojis,
  addRecentKaomoji,
  type KaomojiCategory,
} from '@/utils/kaomojiData';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<KaomojiCategory | 'All' | 'Recent'>('All');
  const [recentKaomojis, setRecentKaomojis] = useState<string[]>(getRecentKaomojis());
  const filteredKaomojis = useMemo(() => {
    if (query.trim()) {
      return searchKaomojis(query);
    }
    if (activeCategory === 'All') {
      return searchKaomojis('');
    }
    if (activeCategory === 'Recent') {
      return [];
    }
    return filterByCategory(activeCategory);
  }, [query, activeCategory]);

  const handleKaomojiClick = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        addRecentKaomoji(text);
        setRecentKaomojis(getRecentKaomojis());
        toast.add({ title: 'Copied!' });
      } catch {
        toast.add({ title: 'Copy failed', type: "error" });
      }
    },
    [toast]
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Kaomoji Picker</h1>
            <p className="text-muted-foreground">
              Browse and search Japanese emoticons (kaomoji). Click to copy.
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
                  placeholder="Search by keyword (happy, cat, music...)"
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
                    {CATEGORY_LABELS[cat]}
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
                {recentKaomojis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recently used kaomojis yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {recentKaomojis.map((text, i) => (
                      <button
                        key={`${text}-${i}`}
                        type="button"
                        onClick={() => handleKaomojiClick(text)}
                        className="p-3 text-sm rounded-md border hover:bg-accent transition-colors cursor-pointer text-center break-all"
                        title="Click to copy"
                      >
                        {text}
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
                  {query
                    ? `Results for "${query}"`
                    : activeCategory === 'All'
                      ? 'All Kaomojis'
                      : CATEGORY_LABELS[activeCategory]}
                </CardTitle>
                <CardDescription>{filteredKaomojis.length} kaomojis found</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredKaomojis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No kaomojis found.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {filteredKaomojis.map((item, i) => (
                      <button
                        key={`${item.text}-${i}`}
                        type="button"
                        onClick={() => handleKaomojiClick(item.text)}
                        className="p-3 text-sm rounded-md border hover:bg-accent transition-colors cursor-pointer text-center break-all"
                        title={item.keywords.join(', ')}
                      >
                        {item.text}
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
