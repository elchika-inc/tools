import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_CONFIG,
  generateLoaderCSS,
  LOADER_TEMPLATES,
  type LoaderConfig,
  type LoaderType,
} from '@/utils/cssLoader';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [type, setType] = useState<LoaderType>('spinner');
  const [config, setConfig] = useState<LoaderConfig>(DEFAULT_CONFIG);
  const css = useMemo(() => generateLoaderCSS(type, config), [type, config]);

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
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CSS Loader Generator</h1>
            <p className="text-muted-foreground">CSSアニメーションのローダーを作成します。</p>
          </header>
          <main className="space-y-6">
            <div className="flex gap-2">
              {LOADER_TEMPLATES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`px-4 py-2 rounded-md text-sm ${type === t.id ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div
              className="flex items-center justify-center p-12 bg-muted rounded-lg"
              aria-label="ローダープレビュー"
            >
              <style>{css}</style>
              {type === 'dots' ? (
                <div className="loader" aria-label="ローディングアニメーション">
                  <div />
                  <div />
                  <div />
                </div>
              ) : (
                <div className="loader" aria-label="ローディングアニメーション" />
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-[280px,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(
                    [
                      ['size', 'Size', 16, 96],
                      ['speed', 'Speed (s)', 0.3, 3],
                      ['borderWidth', 'Border', 1, 12],
                    ] as const
                  ).map(([key, label, min, max]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs">
                        {label}: {config[key]}
                      </Label>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={key === 'speed' ? 0.1 : 1}
                        value={config[key]}
                        onChange={(e) => setConfig((p) => ({ ...p, [key]: Number(e.target.value) }))}
                        className="w-full"
                        aria-label={label}
                        aria-valuetext={String(config[key])}
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Label>Color</Label>
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) => setConfig((p) => ({ ...p, color: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                      aria-label="ローダーカラーピッカー"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CSS Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="bg-muted rounded p-3 text-xs font-mono whitespace-pre-wrap">
                    {css}
                  </pre>
                  <Button type="button" onClick={copyCSS}>
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
