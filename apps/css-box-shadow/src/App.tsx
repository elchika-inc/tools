import { Copy, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DEFAULT_SHADOW, generateCSS, generateFullCSS, type ShadowLayer } from '@/utils/boxShadow';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [layers, setLayers] = useState<ShadowLayer[]>([{ ...DEFAULT_SHADOW }]);
  const css = useMemo(() => generateCSS(layers), [layers]);
  const fullCSS = useMemo(() => generateFullCSS(layers), [layers]);

  const updateLayer = (idx: number, field: keyof ShadowLayer, value: number | string | boolean) => {
    setLayers((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLayer = () => setLayers((prev) => [...prev, { ...DEFAULT_SHADOW }]);
  const removeLayer = (idx: number) => {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((_, i) => i !== idx));
  };

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(fullCSS);
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
            <h1 className="text-3xl font-bold tracking-tight">CSS Box Shadow Generator</h1>
            <p className="text-muted-foreground">CSS box-shadowをGUIで作成します。</p>
          </header>

          <main className="space-y-6">
            <div className="flex items-center justify-center p-16 bg-muted rounded-lg">
              <div
                className="w-48 h-48 bg-background rounded-lg"
                style={{ boxShadow: css }}
                aria-label="ボックスシャドウプレビュー"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr,300px]">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Shadow Layers</CardTitle>
                    <Button type="button" size="sm" variant="outline" onClick={addLayer}>
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {layers.map((layer, idx) => {
                    const key = `layer-${idx}`;
                    return (
                      <div key={key} className="p-3 rounded border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Layer {idx + 1}</span>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={layer.inset}
                                onChange={(e) => updateLayer(idx, 'inset', e.target.checked)}
                                className="h-3 w-3"
                              />{' '}
                              Inset
                            </label>
                            {layers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLayer(idx)}
                                className="text-xs text-red-500"
                                aria-label={`レイヤー ${idx + 1} を削除`}
                              >
                                x
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(
                            [
                              ['x', 'X', -50, 50],
                              ['y', 'Y', -50, 50],
                              ['blur', 'Blur', 0, 100],
                              ['spread', 'Spread', -50, 50],
                            ] as const
                          ).map(([field, label, min, max]) => (
                            <div key={field} className="space-y-1">
                              <Label className="text-xs">
                                {label}: {layer[field]}px
                              </Label>
                              <input
                                type="range"
                                min={min}
                                max={max}
                                value={layer[field]}
                                onChange={(e) => updateLayer(idx, field, Number(e.target.value))}
                                className="w-full"
                                aria-label={`レイヤー ${idx + 1} ${label}`}
                                aria-valuetext={`${layer[field]}px`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={layer.color}
                            onChange={(e) => updateLayer(idx, 'color', e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                            aria-label={`レイヤー ${idx + 1} の色`}
                          />
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">Opacity: {layer.opacity}%</Label>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={layer.opacity}
                              onChange={(e) => updateLayer(idx, 'opacity', Number(e.target.value))}
                              className="w-full"
                              aria-label={`レイヤー ${idx + 1} 不透明度`}
                              aria-valuetext={`${layer.opacity}%`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CSS Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <code className="block bg-muted rounded p-3 text-xs font-mono break-all">
                    {fullCSS}
                  </code>
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
