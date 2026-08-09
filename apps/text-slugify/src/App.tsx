import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DEFAULT_OPTIONS, type SlugifyOptions, slugify } from '@/utils/slugify';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<SlugifyOptions>(DEFAULT_OPTIONS);
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return slugify(input, options);
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
            <h1 className="text-3xl font-bold tracking-tight">Slugify</h1>
            <p className="text-muted-foreground">
              テキストをURL用スラッグに変換します。日本語ローマ字変換対応。
            </p>
          </header>

          <main className="grid gap-4 md:grid-cols-[240px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="separator">区切り文字</Label>
                  <input
                    id="separator"
                    type="text"
                    value={options.separator}
                    onChange={(e) => setOptions((p) => ({ ...p, separator: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLength">最大文字数 (0=無制限)</Label>
                  <input
                    id="maxLength"
                    type="number"
                    min={0}
                    value={options.maxLength}
                    onChange={(e) =>
                      setOptions((p) => ({ ...p, maxLength: Number(e.target.value) || 0 }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                {(
                  [
                    ['lowercase', '小文字に変換'],
                    ['removeSpecialChars', '特殊文字を除去'],
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>
                  テキストを入力すると、リアルタイムでスラッグに変換されます。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Hello World, こんにちは..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <div className="flex min-h-[60px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono break-all">
                    {output || <span className="text-muted-foreground">slug-will-appear-here</span>}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setInput('')}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!output}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
