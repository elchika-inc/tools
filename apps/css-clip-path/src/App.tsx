import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CLIP_PRESETS, generateCSS } from '@/utils/clipPath';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [clipPath, setClipPath] = useState(CLIP_PRESETS[0].value);
  const css = useMemo(() => generateCSS(clipPath), [clipPath]);

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(css);
      toast.add({ title: 'Copied' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CSS Clip Path Generator</h1>
            <p className="text-muted-foreground">CSS clip-pathをGUIで作成します。</p>
          </header>

          <main className="space-y-6">
            <div className="flex justify-center p-8 bg-muted rounded-lg">
              <div
                className="w-48 h-48 bg-primary"
                style={{ clipPath }}
                aria-label="クリップパスプレビュー"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr,300px]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Presets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {CLIP_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setClipPath(p.value)}
                        className="text-center p-2 rounded border hover:bg-muted transition-colors"
                        aria-label={`${p.name} を選択`}
                      >
                        <div className="w-12 h-12 bg-primary mx-auto" style={{ clipPath: p.value }} />
                        <div className="text-[10px] mt-1">{p.name}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CSS Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>clip-path</Label>
                    <input
                      type="text"
                      value={clipPath}
                      onChange={(e) => setClipPath(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                    />
                  </div>
                  <pre className="bg-muted rounded p-3 text-xs font-mono whitespace-pre-wrap">
                    {css}
                  </pre>
                  <Button type="button" onClick={copyCSS} className="w-full">
                    <Copy className="mr-2 h-4 w-4" /> Copy CSS
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
