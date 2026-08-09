import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  searchAriaEntries,
  getCategories,
  getCategoryLabel,
  type AriaCategory,
  type AriaEntry,
} from '@/utils/ariaReference';
import { ToastToaster } from "@/components/ui/toast";

const TYPE_BADGE_COLORS: Record<string, string> = {
  role: 'bg-blue-100 text-blue-800',
  state: 'bg-purple-100 text-purple-800',
  property: 'bg-green-100 text-green-800',
};

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AriaCategory | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<AriaEntry['type'] | undefined>(undefined);

  const categories = useMemo(() => getCategories(), []);
  const results = useMemo(
    () => searchAriaEntries(query, selectedCategory, selectedType),
    [query, selectedCategory, selectedType],
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">ARIA Reference</h1>
            <p className="text-muted-foreground">
              Searchable reference for WAI-ARIA roles, states, and properties.
            </p>
          </header>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles, states, properties..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={selectedCategory === undefined ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(undefined)}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSelectedCategory(selectedCategory === cat ? undefined : cat)
                      }
                    >
                      {getCategoryLabel(cat)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedType === undefined ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(undefined)}
                  >
                    All
                  </Button>
                  {(['role', 'state', 'property'] as const).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant={selectedType === t ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(selectedType === t ? undefined : t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {results.map((entry) => (
              <Card key={entry.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="font-mono text-lg">{entry.name}</CardTitle>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${TYPE_BADGE_COLORS[entry.type]}`}
                    >
                      {entry.type}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {getCategoryLabel(entry.category)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{entry.description}</p>

                  {entry.allowedValues && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Allowed Values
                      </span>
                      <p className="text-sm font-mono mt-1">{entry.allowedValues}</p>
                    </div>
                  )}

                  {entry.htmlEquivalent && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        HTML Equivalent
                      </span>
                      <p className="text-sm font-mono mt-1">{entry.htmlEquivalent}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {results.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No matching entries found.
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
