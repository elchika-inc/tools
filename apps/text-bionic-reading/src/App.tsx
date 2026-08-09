import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DEFAULT_OPTIONS, toBionicHTML, toBionicMarkdown } from '@/utils/bionicReading';
import { toast, ToastToaster } from "@/components/ui/toast";

function BionicPreview({ text, ratio }: { text: string; ratio: number }) {
  if (!text) {
    return <span className="text-muted-foreground">プレビューがここに表示されます...</span>;
  }
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static text split, order never changes
        <span key={lineIdx}>
          {lineIdx > 0 && <br />}
          {line.split(/(\S+)/g).map((part, partIdx) =>
            /^\S+$/.test(part) ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: static text split
              <span key={partIdx}>
                <b>{part.slice(0, Math.max(1, Math.ceil(part.length * ratio)))}</b>
                {part.slice(Math.max(1, Math.ceil(part.length * ratio)))}
              </span>
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: static text split
              <span key={partIdx}>{part}</span>
            )
          )}
        </span>
      ))}
    </>
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const [ratio, setRatio] = useState(DEFAULT_OPTIONS.fixationRatio);
  const [format, setFormat] = useState<'html' | 'markdown'>('html');
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return format === 'html'
        ? toBionicHTML(input, { fixationRatio: ratio })
        : toBionicMarkdown(input, { fixationRatio: ratio });
    } catch {
      return '';
    }
  }, [input, ratio, format]);

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
            <h1 className="text-3xl font-bold tracking-tight">Bionic Reading</h1>
            <p className="text-muted-foreground">
              テキストをBionic Reading形式に変換して速読を支援します。
            </p>
          </header>

          <main className="grid gap-4 md:grid-cols-[240px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ratio">太字比率: {Math.round(ratio * 100)}%</Label>
                  <input
                    id="ratio"
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.1}
                    value={ratio}
                    onChange={(e) => setRatio(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label>出力形式</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormat('html')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${format === 'html' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'}`}
                    >
                      HTML
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('markdown')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${format === 'markdown' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'}`}
                    >
                      Markdown
                    </button>
                  </div>
                </div>
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
                    aria-label="変換するテキストを入力"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    placeholder="Enter text to convert..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[80px] rounded-md border border-input bg-muted p-3 text-sm leading-relaxed">
                    <BionicPreview text={input} ratio={ratio} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Output ({format.toUpperCase()})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    readOnly
                    aria-label="Bionic Reading形式の出力"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    value={output}
                  />
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
            </div>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
