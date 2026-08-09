import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { addLineNumbers, DEFAULT_OPTIONS, type LineNumberOptions } from '@/utils/lineNumber';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<LineNumberOptions>(DEFAULT_OPTIONS);
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return addLineNumbers(input, options);
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
            <h1 className="text-3xl font-bold tracking-tight">Line Number</h1>
            <p className="text-muted-foreground">テキストの各行に行番号を付与します。</p>
          </header>

          <main className="grid gap-4 md:grid-cols-[240px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startNumber">開始番号</Label>
                  <input
                    id="startNumber"
                    type="number"
                    min={0}
                    value={options.startNumber}
                    onChange={(e) =>
                      setOptions((p) => ({ ...p, startNumber: Number(e.target.value) || 0 }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
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
                <div className="flex items-center gap-2">
                  <input
                    id="zeroPadding"
                    type="checkbox"
                    checked={options.zeroPadding}
                    onChange={(e) => setOptions((p) => ({ ...p, zeroPadding: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="zeroPadding">ゼロパディング</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="skipEmpty"
                    type="checkbox"
                    checked={options.skipEmpty}
                    onChange={(e) => setOptions((p) => ({ ...p, skipEmpty: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="skipEmpty">空行をスキップ</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Line Numberer</CardTitle>
                <CardDescription>
                  テキストを入力すると、リアルタイムで行番号が付与されます。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
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
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="行番号付きテキストがここに表示されます..."
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
