import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { addPrefixSuffix } from '@/utils/prefixSuffix';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [skipEmpty, setSkipEmpty] = useState(true);
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return addPrefixSuffix(input, { prefix, suffix, skipEmpty });
    } catch {
      return '';
    }
  }, [input, prefix, suffix, skipEmpty]);

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
            <h1 className="text-3xl font-bold tracking-tight">Prefix / Suffix</h1>
            <p className="text-muted-foreground">
              テキストの各行にプレフィックスやサフィックスを追加します。
            </p>
          </header>

          <main className="grid gap-4 md:grid-cols-[240px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prefix">プレフィックス</Label>
                  <input
                    id="prefix"
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="例: - "
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suffix">サフィックス</Label>
                  <input
                    id="suffix"
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="例: ;"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="skipEmpty"
                    type="checkbox"
                    checked={skipEmpty}
                    onChange={(e) => setSkipEmpty(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="skipEmpty">空行をスキップ</Label>
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
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
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
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
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
