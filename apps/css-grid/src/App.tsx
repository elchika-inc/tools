import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DEFAULT_CONFIG, type GridConfig, generateCSS } from '@/utils/grid';
import { toast, ToastToaster } from "@/components/ui/toast";

const ALIGN_OPTIONS = ['stretch', 'start', 'end', 'center'] as const;

export default function App() {
  const [config, setConfig] = useState<GridConfig>(DEFAULT_CONFIG);
  const css = useMemo(() => generateCSS(config), [config]);

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(css);
      toast.add({ title: 'Copied' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: config.columnSizes,
    gridTemplateRows: config.rowSizes,
    gap: `${config.gap}px`,
    justifyItems: config.justifyItems as React.CSSProperties['justifyItems'],
    alignItems: config.alignItems as React.CSSProperties['alignItems'],
    minHeight: 200,
  };

  const cls =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono';

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">CSS Grid Playground</h1>
            <p className="text-muted-foreground">CSS Gridのプロパティを視覚的に確認します。</p>
          </header>
          <main className="space-y-6">
            <div
              className="border rounded-lg p-4 bg-muted"
              style={gridStyle}
              aria-label="CSS Gridプレビュー"
            >
              {Array.from({ length: config.itemCount }, (_, i) => (
                <div
                  key={`grid-${i + 1}`}
                  className="bg-primary text-primary-foreground rounded px-4 py-3 text-sm font-medium text-center"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr,300px]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">grid-template-columns</Label>
                    <input
                      type="text"
                      value={config.columnSizes}
                      onChange={(e) => setConfig((p) => ({ ...p, columnSizes: e.target.value }))}
                      className={cls}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">grid-template-rows</Label>
                    <input
                      type="text"
                      value={config.rowSizes}
                      onChange={(e) => setConfig((p) => ({ ...p, rowSizes: e.target.value }))}
                      className={cls}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">gap: {config.gap}px</Label>
                    <input
                      type="range"
                      min={0}
                      max={32}
                      value={config.gap}
                      onChange={(e) => setConfig((p) => ({ ...p, gap: Number(e.target.value) }))}
                      className="w-full"
                      aria-label="gap"
                      aria-valuetext={`${config.gap}px`}
                    />
                  </div>
                  {(['justifyItems', 'alignItems'] as const).map((key) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs">{key}</Label>
                      <div className="flex gap-1">
                        {ALIGN_OPTIONS.map((v) => (
                          <button
                            type="button"
                            key={v}
                            onClick={() => setConfig((p) => ({ ...p, [key]: v }))}
                            className={`px-2 py-1 rounded text-[10px] font-mono ${config[key] === v ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs">Items: {config.itemCount}</Label>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={config.itemCount}
                      onChange={(e) => setConfig((p) => ({ ...p, itemCount: Number(e.target.value) }))}
                      className="w-full"
                      aria-label="アイテム数"
                      aria-valuetext={String(config.itemCount)}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CSS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="bg-muted rounded p-3 text-xs font-mono whitespace-pre-wrap">
                    {css}
                  </pre>
                  <Button type="button" onClick={copyCSS} className="w-full">
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
