import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_CONFIG,
  generateSVG,
  type PlaceholderConfig,
  svgToDataUri,
} from '@/utils/svgPlaceholder';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [config, setConfig] = useState<PlaceholderConfig>(DEFAULT_CONFIG);
  const svg = useMemo(() => generateSVG(config), [config]);
  const dataUri = useMemo(() => svgToDataUri(svg), [svg]);

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.add({ title: 'Copied' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const cls = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SVG Placeholder Generator</h1>
            <p className="text-muted-foreground">指定サイズのSVGプレースホルダー画像を生成します。</p>
          </header>

          <main>
            <div className="flex justify-center p-8 bg-muted rounded-lg">
              <img src={dataUri} alt="プレースホルダー画像プレビュー" className="border" />
            </div>

            <div className="grid gap-4 md:grid-cols-[280px,1fr] mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label>Width</Label>
                      <input
                        type="number"
                        min={1}
                        value={config.width}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, width: Number(e.target.value) || 1 }))
                        }
                        className={cls}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Height</Label>
                      <input
                        type="number"
                        min={1}
                        value={config.height}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, height: Number(e.target.value) || 1 }))
                        }
                        className={cls}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Text</Label>
                    <input
                      type="text"
                      value={config.text}
                      onChange={(e) => setConfig((p) => ({ ...p, text: e.target.value }))}
                      placeholder="auto"
                      className={cls}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Font Size</Label>
                    <input
                      type="number"
                      min={8}
                      value={config.fontSize}
                      onChange={(e) => setConfig((p) => ({ ...p, fontSize: Number(e.target.value) }))}
                      className={cls}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="space-y-1 flex-1">
                      <Label>BG</Label>
                      <input
                        type="color"
                        value={config.bgColor}
                        onChange={(e) => setConfig((p) => ({ ...p, bgColor: e.target.value }))}
                        className="w-full h-10 rounded cursor-pointer border-0"
                        aria-label="Background color"
                      />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label>Text</Label>
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => setConfig((p) => ({ ...p, textColor: e.target.value }))}
                        className="w-full h-10 rounded cursor-pointer border-0"
                        aria-label="Text color"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Output</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'SVG Code', value: svg },
                    { label: 'Data URI', value: dataUri },
                    {
                      label: 'IMG Tag',
                      value: `<img src="${dataUri}" alt="placeholder" width="${config.width}" height="${config.height}" />`,
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{item.label}</Label>
                        <Button type="button" size="sm" variant="ghost" onClick={() => copyValue(item.value)}>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      </div>
                      <textarea
                        readOnly
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-muted px-3 py-2 text-xs font-mono resize-none"
                        value={item.value}
                        aria-label={item.label}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
