import { Copy, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { generateLoremIpsum, UNIT_OPTIONS, type UnitType } from '@/utils/loremIpsum';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<UnitType>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');
  const generate = useCallback(() => {
    try {
      const text = generateLoremIpsum({ count, unit, startWithLorem });
      setOutput(text);
    } catch (error) {
      console.error('Lorem Ipsum generation failed:', error);
      toast.add({ title: '生成に失敗しました', type: "error" });
    }
  }, [count, unit, startWithLorem, toast]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const clearAll = () => {
    setOutput('');
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
            <h1 className="text-3xl font-bold tracking-tight">Lorem Ipsum Generator</h1>
            <p className="text-muted-foreground">ダミーテキスト(Lorem Ipsum)を生成します。</p>
          </header>

          <main className="grid gap-4 md:grid-cols-[280px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="count">生成数</Label>
                  <input
                    id="count"
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label>単位</Label>
                  <div className="space-y-1">
                    {UNIT_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => setUnit(option.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          unit === option.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="startWithLorem"
                    type="checkbox"
                    checked={startWithLorem}
                    onChange={(e) => setStartWithLorem(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="startWithLorem">&quot;Lorem ipsum...&quot; から開始</Label>
                </div>

                <Button type="button" onClick={generate} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" /> 生成
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
                <CardDescription>生成ボタンを押すとダミーテキストが出力されます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  readOnly
                  aria-label="生成されたダミーテキスト"
                  className="flex min-h-[400px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                  placeholder="ここに生成結果が表示されます..."
                  value={output}
                />

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={clearAll}>
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
