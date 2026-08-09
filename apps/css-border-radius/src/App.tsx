import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type BorderRadiusConfig, DEFAULT_CONFIG, generateCSS } from '@/utils/borderRadius';
import { toast, ToastToaster } from "@/components/ui/toast";

const CORNERS = [
  { key: 'topLeft', label: 'Top Left' },
  { key: 'topRight', label: 'Top Right' },
  { key: 'bottomRight', label: 'Bottom Right' },
  { key: 'bottomLeft', label: 'Bottom Left' },
] as const;

export default function App() {
  const [config, setConfig] = useState<BorderRadiusConfig>(DEFAULT_CONFIG);
  const css = useMemo(() => generateCSS(config), [config]);

  const updateCorner = (key: string, value: number) => {
    if (config.linked) {
      setConfig((p) => ({
        ...p,
        topLeft: value,
        topRight: value,
        bottomRight: value,
        bottomLeft: value,
      }));
    } else {
      setConfig((p) => ({ ...p, [key]: value }));
    }
  };

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(css);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const borderRadiusStyle = `${config.topLeft}${config.unit} ${config.topRight}${config.unit} ${config.bottomRight}${config.unit} ${config.bottomLeft}${config.unit}`;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">CSS Border Radius Generator</h1>
            <p className="text-muted-foreground">CSS border-radiusをGUIで作成します。</p>
          </header>

          <main className="space-y-6">
            <div className="flex items-center justify-center p-16 bg-muted rounded-lg">
              <div
                className="w-48 h-48 bg-primary"
                style={{ borderRadius: borderRadiusStyle }}
                aria-label="ボーダーラジウスプレビュー"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={config.linked}
                      onChange={(e) => setConfig((p) => ({ ...p, linked: e.target.checked }))}
                      className="h-4 w-4 rounded border-input"
                    />
                    全角統一
                  </label>
                  <div className="flex gap-1">
                    {(['px', '%'] as const).map((u) => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => setConfig((p) => ({ ...p, unit: u }))}
                        className={`px-3 py-1 rounded text-xs ${config.unit === u ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {CORNERS.map((c) => (
                    <div key={c.key} className="space-y-1">
                      <Label className="text-xs">
                        {c.label}: {config[c.key]}
                        {config.unit}
                      </Label>
                      <input
                        type="range"
                        min={0}
                        max={config.unit === '%' ? 50 : 200}
                        value={config[c.key]}
                        onChange={(e) => updateCorner(c.key, Number(e.target.value))}
                        className="w-full"
                        aria-label={c.label}
                        aria-valuetext={`${config[c.key]}${config.unit}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-4 border-t">
                  <code className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono">{css}</code>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={copyCSS}
                    aria-label="CSSをコピー"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
