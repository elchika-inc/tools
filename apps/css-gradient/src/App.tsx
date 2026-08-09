import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_CONFIG,
  type GradientConfig,
  type GradientType,
  generateCSS,
  generateFullCSS,
  PRESETS,
} from '@/utils/gradient';
import { toast, ToastToaster } from "@/components/ui/toast";

const TYPES: GradientType[] = ['linear', 'radial', 'conic'];

export default function App() {
  const [config, setConfig] = useState<GradientConfig>(DEFAULT_CONFIG);
  const css = useMemo(() => generateCSS(config), [config]);
  const fullCSS = useMemo(() => generateFullCSS(config), [config]);

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(fullCSS);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const updateStop = (index: number, field: 'color' | 'position', value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      stops: prev.stops.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const addStop = () => {
    setConfig((prev) => ({
      ...prev,
      stops: [...prev.stops, { color: '#ffffff', position: 50 }],
    }));
  };

  const removeStop = (index: number) => {
    if (config.stops.length <= 2) return;
    setConfig((prev) => ({ ...prev, stops: prev.stops.filter((_, i) => i !== index) }));
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
            <h1 className="text-3xl font-bold tracking-tight">CSS Gradient Generator</h1>
            <p className="text-muted-foreground">CSSグラデーションをGUIで作成します。</p>
          </header>

          <main className="space-y-6">
            <div
              className="h-48 rounded-lg border"
              style={{ background: css }}
              aria-label="グラデーションプレビュー"
            />

            <div className="grid gap-4 md:grid-cols-[300px,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label>Type</Label>
                    <div className="flex gap-1">
                      {TYPES.map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setConfig((p) => ({ ...p, type: t }))}
                          className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${config.type === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {config.type !== 'radial' && (
                    <div className="space-y-1">
                      <Label>Angle: {config.angle}deg</Label>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={config.angle}
                        onChange={(e) => setConfig((p) => ({ ...p, angle: Number(e.target.value) }))}
                        className="w-full"
                        aria-label="グラデーション角度"
                        aria-valuetext={`${config.angle}度`}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Color Stops</Label>
                      <button
                        type="button"
                        onClick={addStop}
                        className="text-xs text-primary hover:underline"
                      >
                        + Add
                      </button>
                    </div>
                    {config.stops.map((stop, i) => {
                      const key = `stop-${i}`;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={stop.color}
                            onChange={(e) => updateStop(i, 'color', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                            aria-label={`カラーストップ ${i + 1} の色`}
                          />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={stop.position}
                            onChange={(e) => updateStop(i, 'position', Number(e.target.value))}
                            className="w-16 h-8 rounded border border-input bg-background px-2 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                          {config.stops.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeStop(i)}
                              className="text-xs text-red-500 hover:text-red-700"
                              aria-label={`カラーストップ ${i + 1} を削除`}
                            >
                              x
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Presets</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {PRESETS.map((p, i) => {
                        const key = `preset-${i}`;
                        return (
                          <button
                            type="button"
                            key={key}
                            onClick={() => setConfig(p)}
                            className="h-8 rounded border"
                            style={{ background: generateCSS(p) }}
                            aria-label={`プリセット ${i + 1} を選択`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CSS Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <code className="block bg-muted rounded p-3 text-sm font-mono break-all">
                    {fullCSS}
                  </code>
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
