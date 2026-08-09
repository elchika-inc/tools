import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  CONVERT_MODE_OPTIONS,
  type ConvertOptions,
  convert,
  DEFAULT_OPTIONS,
} from '@/utils/fullwidthHalfwidth';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<ConvertOptions>(DEFAULT_OPTIONS);
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return convert(input, options);
    } catch {
      return '';
    }
  }, [input, options]);

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
            <h1 className="text-3xl font-bold tracking-tight">全角半角変換</h1>
            <p className="text-muted-foreground">全角文字と半角文字を相互変換します。</p>
          </header>

          <main className="grid gap-4 md:grid-cols-[220px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>変換方向</Label>
                  {CONVERT_MODE_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setOptions((p) => ({ ...p, mode: option.value }))}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        options.mode === option.value
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div
                        className={`text-xs ${options.mode === option.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                      >
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>対象</Label>
                  {(
                    [
                      ['alphanumeric', '英数字'],
                      ['katakana', 'カタカナ'],
                      ['symbol', '記号'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        id={key}
                        type="checkbox"
                        checked={options[key]}
                        onChange={(e) => setOptions((p) => ({ ...p, [key]: e.target.checked }))}
                        className="h-4 w-4 rounded border-input"
                      />
                      <Label htmlFor={key}>{label}</Label>
                    </div>
                  ))}
                </div>
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
