import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DEFAULT_SORT_OPTIONS, type SortOptions, sortText } from '@/utils/textSort';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<SortOptions>(DEFAULT_SORT_OPTIONS);
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return sortText(input, options);
    } catch {
      return '';
    }
  }, [input, options]);

  const toggle = (key: keyof SortOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
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
            <h1 className="text-3xl font-bold tracking-tight">Text Sort</h1>
            <p className="text-muted-foreground">テキストの各行をソートします。</p>
          </header>

          <main className="grid gap-4 md:grid-cols-[220px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">オプション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>ソート順</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOptions((p) => ({ ...p, order: 'asc' }))}
                      className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${options.order === 'asc' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'}`}
                    >
                      昇順
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptions((p) => ({ ...p, order: 'desc' }))}
                      className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${options.order === 'desc' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'}`}
                    >
                      降順
                    </button>
                  </div>
                </div>
                {(
                  [
                    ['numeric', '数値ソート'],
                    ['caseSensitive', '大文字小文字を区別'],
                    ['removeDuplicates', '重複行を削除'],
                    ['trimLines', '行の前後空白を除去'],
                    ['removeEmpty', '空行を除去'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      id={key}
                      type="checkbox"
                      checked={options[key] as boolean}
                      onChange={() => toggle(key)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor={key}>{label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sorter</CardTitle>
                <CardDescription>
                  テキストを入力すると、リアルタイムでソートされます。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    placeholder="1行に1項目ずつ入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    placeholder="ソート結果がここに表示されます..."
                    value={output}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setInput('')}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!output}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
