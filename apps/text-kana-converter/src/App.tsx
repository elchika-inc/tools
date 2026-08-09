import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { convertKana, KANA_MODE_OPTIONS, type KanaMode } from '@/utils/kanaConverter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<KanaMode>('toKatakana');
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return convertKana(input, mode);
    } catch {
      return '';
    }
  }, [input, mode]);

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
            <h1 className="text-3xl font-bold tracking-tight">ひらがな / カタカナ変換</h1>
            <p className="text-muted-foreground">ひらがなとカタカナを相互変換します。</p>
          </header>

          <main className="grid gap-4 md:grid-cols-[200px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">変換モード</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {KANA_MODE_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setMode(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      mode === option.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div
                      className={`text-xs ${mode === option.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                    >
                      {option.description}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>テキストを入力すると、リアルタイムで変換されます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="ここにテキストを入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="変換結果がここに表示されます..."
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
