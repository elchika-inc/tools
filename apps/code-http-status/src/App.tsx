import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { filterStatusCodes, getCategories, HTTP_STATUS_CODES } from '@/utils/httpStatus';
import { ToastToaster } from "@/components/ui/toast";

const CATEGORIES = ['', ...getCategories(HTTP_STATUS_CODES)];
const CATEGORY_COLORS: Record<string, string> = {
  '1xx Informational': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  '2xx Success': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  '3xx Redirection': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  '4xx Client Error': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  '5xx Server Error': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(
    () => filterStatusCodes(HTTP_STATUS_CODES, query, category),
    [query, category]
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">HTTP Status Codes</h1>
            <p className="text-muted-foreground">HTTPステータスコードの一覧と詳細です。</p>
          </header>

          <main className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1 flex-1 min-w-48">
                <Label htmlFor="search">検索</Label>
                <input
                  id="search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="コード番号またはキーワード..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-1 flex-wrap" role="group" aria-label="Filter by category">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat || 'all'}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-md text-xs transition-colors ${category === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'}`}
                  >
                    {cat || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status Codes ({filtered.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filtered.map((status) => (
                    <div
                      key={status.code}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-muted"
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-sm font-mono font-bold ${CATEGORY_COLORS[status.category] ?? 'bg-muted'}`}
                      >
                        {status.code}
                      </span>
                      <div>
                        <div className="font-medium text-sm">{status.name}</div>
                        <div className="text-xs text-muted-foreground">{status.description}</div>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-muted-foreground text-sm">該当なし</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
