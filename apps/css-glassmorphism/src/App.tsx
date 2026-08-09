import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DEFAULT_CONFIG, type GlassConfig, generateCSS } from '@/utils/glassmorphism';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [config, setConfig] = useState<GlassConfig>(DEFAULT_CONFIG);
  const css = useMemo(() => generateCSS(config), [config]);

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(css);
      toast.add({ title: 'Copied' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const bgStyle = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' };
  const glassStyle = {
    background: `rgba(255, 255, 255, ${config.transparency / 100})`,
    backdropFilter: `blur(${config.blur}px) saturate(${config.saturation}%)`,
    WebkitBackdropFilter: `blur(${config.blur}px) saturate(${config.saturation}%)`,
    borderRadius: `${config.borderRadius}px`,
    border: config.border ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
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
            <h1 className="text-3xl font-bold tracking-tight">Glassmorphism Generator</h1>
            <p className="text-muted-foreground">Glassmorphism効果をGUIで作成します。</p>
          </header>

          <main className="space-y-6">
            <div className="rounded-xl p-12" style={bgStyle}>
              <div
                className="w-64 h-48 mx-auto p-6"
                style={glassStyle}
                aria-label="Glassmorphismプレビュー"
              >
                <div className="text-white font-bold text-lg">Glass Card</div>
                <div className="text-white/80 text-sm mt-2">Glassmorphism effect preview</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[300px,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(
                    [
                      ['blur', 'Blur', 0, 40],
                      ['transparency', 'Opacity %', 0, 100],
                      ['saturation', 'Saturation %', 100, 300],
                      ['borderRadius', 'Border Radius', 0, 50],
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
                        value={config[key]}
                        onChange={(e) => setConfig((p) => ({ ...p, [key]: Number(e.target.value) }))}
                        className="w-full"
                        aria-label={label}
                        aria-valuetext={String(config[key])}
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.border}
                      onChange={(e) => setConfig((p) => ({ ...p, border: e.target.checked }))}
                      className="h-4 w-4 rounded border-input"
                      id="border"
                    />
                    <Label htmlFor="border">Border</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Color</Label>
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) => setConfig((p) => ({ ...p, color: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                      aria-label="ガラスカラーピッカー"
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
