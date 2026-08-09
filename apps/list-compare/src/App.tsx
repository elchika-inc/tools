import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { compareLists } from '@/utils/listCompare';
import { toast, ToastToaster } from "@/components/ui/toast";

const VIEW_OPTIONS = [
  { value: 'onlyInA', label: 'Aのみ', color: 'text-red-600' },
  { value: 'onlyInB', label: 'Bのみ', color: 'text-blue-600' },
  { value: 'common', label: '共通', color: 'text-green-600' },
  { value: 'union', label: '和集合', color: 'text-foreground' },
] as const;

type ViewType = (typeof VIEW_OPTIONS)[number]['value'];

export default function App() {
  const [listA, setListA] = useState('');
  const [listB, setListB] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [view, setView] = useState<ViewType>('common');
  const result = useMemo(
    () => compareLists(listA, listB, caseSensitive),
    [listA, listB, caseSensitive]
  );

  const currentList = result[view];

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(currentList.join('\n'));
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">List Compare</h1>
            <p className="text-muted-foreground">2つのリストの差分/共通/和集合を表示します。</p>
          </header>

          <main className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">List A</CardTitle>
              </CardHeader>
              <CardContent>
                <label htmlFor="list-a" className="sr-only">List A</label>
                <textarea
                  id="list-a"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="1行1項目..."
                  value={listA}
                  onChange={(e) => setListA(e.target.value)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">List B</CardTitle>
              </CardHeader>
              <CardContent>
                <label htmlFor="list-b" className="sr-only">List B</label>
                <textarea
                  id="list-b"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="1行1項目..."
                  value={listB}
                  onChange={(e) => setListB(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              {VIEW_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setView(opt.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted border'
                  }`}
                >
                  {opt.label} ({result[opt.value].length})
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="caseSensitive"
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="caseSensitive">大文字小文字を区別</Label>
            </div>
            <Button type="button" variant="outline" onClick={copyResult} disabled={currentList.length === 0}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {VIEW_OPTIONS.find((o) => o.value === view)?.label} ({currentList.length})
              </CardTitle>
              <CardDescription>選択した表示モードの結果です。</CardDescription>
            </CardHeader>
            <CardContent>
              {currentList.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {currentList.map((item, i) => {
                    const key = `${item}-${i}`;
                    return (
                      <div key={key} className="text-sm font-mono py-0.5 px-2 rounded hover:bg-muted">
                        {item}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">結果なし</div>
              )}
            </CardContent>
          </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
