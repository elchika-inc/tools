import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { hexToRgb, hslToCss, rgbToCss, rgbToHex, rgbToHsl } from '@/utils/colorConverter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [hex, setHex] = useState('#3b82f6');
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null), [rgb]);

  const formats = useMemo(() => {
    if (!rgb || !hsl) return [];
    return [
      { label: 'HEX', value: rgbToHex(rgb.r, rgb.g, rgb.b) },
      { label: 'RGB', value: rgbToCss(rgb.r, rgb.g, rgb.b) },
      { label: 'HSL', value: hslToCss(hsl.h, hsl.s, hsl.l) },
      { label: 'R', value: String(rgb.r) },
      { label: 'G', value: String(rgb.g) },
      { label: 'B', value: String(rgb.b) },
    ];
  }, [rgb, hsl]);

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.add({ title: 'Copied to clipboard' });
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
            <h1 className="text-3xl font-bold tracking-tight">Color Converter</h1>
            <p className="text-muted-foreground">HEX/RGB/HSL の相互変換を行います。</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Color Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : '#000000'}
                    onChange={(e) => setHex(e.target.value)}
                    className="w-16 h-16 rounded cursor-pointer border-0"
                    aria-label="カラーピッカー"
                  />
                  <div
                    className="w-32 h-16 rounded-md border"
                    style={{ backgroundColor: rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : '#000' }}
                    aria-label="カラープレビュー"
                  />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="hex">HEX</Label>
                    <input
                      id="hex"
                      type="text"
                      value={hex}
                      onChange={(e) => setHex(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>

                {formats.length > 0 && (
                  <div className="grid gap-2 pt-4 border-t">
                    {formats.map((f) => (
                      <div key={f.label} className="flex items-center gap-2">
                        <span className="w-12 text-sm text-muted-foreground">{f.label}</span>
                        <code className="flex-1 text-sm font-mono bg-muted rounded px-2 py-1">
                          {f.value}
                        </code>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => copyValue(f.value)}
                          aria-label={`${f.label} をコピー`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
