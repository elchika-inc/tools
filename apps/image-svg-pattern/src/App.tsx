import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_CONFIG,
  generatePatternSVG,
  PATTERNS,
  type PatternConfig,
} from '@/utils/svgPattern';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [config, setConfig] = useState<PatternConfig>(DEFAULT_CONFIG);
  const svg = useMemo(() => generatePatternSVG(config), [config]);
  const dataUri = useMemo(() => `data:image/svg+xml,${encodeURIComponent(svg)}`, [svg]);

  const copySVG = async () => {
    try {
      await navigator.clipboard.writeText(svg);
      toast.add({ title: 'SVG copied' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">SVG Pattern Generator</h1>
            <p className="text-muted-foreground">SVGパターン(背景用)を生成します。</p>
          </header>
          <main>
            <div
              className="h-48 rounded-lg border overflow-hidden"
              style={{ backgroundImage: `url("${dataUri}")`, backgroundSize: 'auto' }}
              role="img"
              aria-label="生成されたSVGパターンプレビュー"
            />
            <div className="grid gap-4 md:grid-cols-[280px,1fr] mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label>Pattern</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {PATTERNS.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => setConfig((c) => ({ ...c, type: p.id }))}
                          className={`px-2 py-1 rounded text-xs ${config.type === p.id ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(
                    [
                      ['size', 'Size', 5, 50],
                      ['strokeWidth', 'Stroke', 1, 8],
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
                        onChange={(e) => setConfig((c) => ({ ...c, [key]: Number(e.target.value) }))}
                        className="w-full"
                        aria-label={`${label}: ${config[key]}`}
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Color</Label>
                      <input
                        type="color"
                        value={config.color}
                        onChange={(e) => setConfig((c) => ({ ...c, color: e.target.value }))}
                        className="w-full h-8 rounded cursor-pointer border-0"
                        aria-label="Pattern color"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">BG</Label>
                      <input
                        type="color"
                        value={config.bgColor}
                        onChange={(e) => setConfig((c) => ({ ...c, bgColor: e.target.value }))}
                        className="w-full h-8 rounded cursor-pointer border-0"
                        aria-label="Background color"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SVG Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    readOnly
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-xs font-mono resize-none"
                    value={svg}
                    aria-label="生成されたSVGコード"
                  />
                  <Button type="button" onClick={copySVG}>
                    <Copy className="mr-2 h-4 w-4" /> Copy SVG
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
