import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  analyzeWordFrequency,
  DEFAULT_OPTIONS,
  type FrequencyOptions,
} from '@/utils/wordFrequency';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<FrequencyOptions>(DEFAULT_OPTIONS);
  const items = useMemo(() => {
    if (!input) return [];
    try {
      return analyzeWordFrequency(input, options);
    } catch {
      return [];
    }
  }, [input, options]);

  const outputText = useMemo(() => {
    return items
      .map((item) => `${item.word}\t${item.count}\t${item.percentage.toFixed(1)}%`)
      .join('\n');
  }, [items]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
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
            <h1 className="text-3xl font-bold tracking-tight">Word Frequency</h1>
            <p className="text-muted-foreground">テキスト内の単語出現頻度を集計します。</p>
          </header>

          <main className="grid gap-4 md:grid-cols-[240px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    id="caseSensitive"
                    type="checkbox"
                    checked={options.caseSensitive}
                    onChange={(e) => setOptions((p) => ({ ...p, caseSensitive: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="caseSensitive">大文字小文字を区別</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minLength">最小文字数</Label>
                  <input
                    id="minLength"
                    type="number"
                    min={1}
                    value={options.minLength}
                    onChange={(e) =>
                      setOptions((p) => ({ ...p, minLength: Math.max(1, Number(e.target.value)) }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-1">
                  <Label>ソート順</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOptions((p) => ({ ...p, sortBy: 'count' }))}
                      className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${options.sortBy === 'count' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'}`}
                    >
                      出現数
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptions((p) => ({ ...p, sortBy: 'alphabetical' }))}
                      className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${options.sortBy === 'alphabetical' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'}`}
                    >
                      ABC順
                    </button>
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="text-sm text-muted-foreground">{items.length} 種類の単語</div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Input</CardTitle>
                  <CardDescription>テキストを入力してください。</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    aria-label="解析するテキスト"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="ここにテキストを入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.length > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-background">
                          <tr className="border-b">
                            <th className="text-left py-2 px-2">単語</th>
                            <th className="text-right py-2 px-2">回数</th>
                            <th className="text-right py-2 px-2">割合</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.word} className="border-b">
                              <td className="py-1.5 px-2 font-mono">{item.word}</td>
                              <td className="py-1.5 px-2 text-right">{item.count}</td>
                              <td className="py-1.5 px-2 text-right">
                                {item.percentage.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">結果がここに表示されます...</div>
                  )}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setInput('')}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button type="button" onClick={copyToClipboard} disabled={items.length === 0}>
                      <Copy className="mr-2 h-4 w-4" /> Copy TSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
