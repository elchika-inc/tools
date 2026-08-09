import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Search } from 'lucide-react';
import { searchHeaders, type CategoryFilterType } from '@/utils/headerDatabase';
import { toast, ToastToaster } from "@/components/ui/toast";

const CATEGORY_COLORS: Record<string, string> = {
  Request: 'bg-blue-100 text-blue-800',
  Response: 'bg-green-100 text-green-800',
  General: 'bg-purple-100 text-purple-800',
  Entity: 'bg-orange-100 text-orange-800',
};

export default function App() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('All');
  const [expandedHeader, setExpandedHeader] = useState<string | null>(null);
  const results = useMemo(
    () => searchHeaders(query, categoryFilter),
    [query, categoryFilter],
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">HTTP Header Viewer</h1>
            <p className="text-muted-foreground">
              HTTPヘッダーのリファレンス。ヘッダー名で検索し、カテゴリでフィルタリングできます。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Header name or keyword..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-[180px] space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(v) => setCategoryFilter(v as CategoryFilterType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Request">Request</SelectItem>
                      <SelectItem value="Response">Response</SelectItem>
                      <SelectItem value="Entity">Entity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Headers</CardTitle>
              <CardDescription>{results.length} header(s) found</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No headers found matching your search.</p>
              ) : (
                <div className="space-y-2">
                  {results.map((header) => (
                    <div
                      key={header.name}
                      className="border rounded-md overflow-hidden"
                    >
                      <button
                        type="button"
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 text-left"
                        onClick={() =>
                          setExpandedHeader(expandedHeader === header.name ? null : header.name)
                        }
                      >
                        <code className="font-mono font-semibold text-sm flex-1">
                          {header.name}
                        </code>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            CATEGORY_COLORS[header.category] || ''
                          }`}
                        >
                          {header.category}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(header.name);
                          }}
                          aria-label="Copy header name"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </button>
                      {expandedHeader === header.name && (
                        <div className="px-4 pb-4 pt-0 space-y-3 border-t bg-muted/10">
                          <div className="pt-3">
                            <p className="text-sm text-muted-foreground">{header.description}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Example</Label>
                            <div className="flex gap-2 items-center">
                              <code className="flex-1 px-3 py-2 bg-muted rounded-md text-xs font-mono break-all">
                                {header.example}
                              </code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(header.example)}
                                aria-label="Copy header example"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Reference</Label>
                            <p className="text-sm text-muted-foreground">{header.rfc}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
