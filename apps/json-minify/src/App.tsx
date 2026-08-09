import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { minifyJSON } from '@/utils/jsonMinify';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => minifyJSON(input), [input]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.result);
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
            <h1 className="text-3xl font-bold tracking-tight">JSON Minify</h1>
            <p className="text-muted-foreground">JSONの空白・改行を除去してミニファイします。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Minifier</CardTitle>
                <CardDescription>JSONを入力するとリアルタイムでミニファイされます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="input">Input ({input.length} bytes)</Label>
                    <textarea
                      id="input"
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder='{\n  "key": "value"\n}'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="output">
                      Output ({result.result.length} bytes
                      {result.savedBytes > 0 ? `, -${result.savedBytes} bytes saved` : ''})
                    </Label>
                    <textarea
                      id="output"
                      readOnly
                      aria-label="Minified JSON output"
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      value={result.result}
                    />
                  </div>
                </div>
                {result.error && (
                  <div role="alert" className="text-sm text-destructive bg-destructive-subtle dark:bg-destructive-subtle rounded p-2">
                    {result.error}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setInput('')}>
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!result.result}>
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
