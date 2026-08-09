import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { generatePalette } from '@/utils/colorShade';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [color, setColor] = useState('#3b82f6');
  const [count, setCount] = useState(10);
  const palette = useMemo(() => generatePalette(color, count), [color, count]);

  const copyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast.add({ title: `${hex} copied` });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Color Shade Generator</h1>
            <p className="text-muted-foreground">
              指定色のシェード(暗色)とティント(明色)を生成します。
            </p>
          </header>

          <main className="space-y-6">
            <div className="flex items-end gap-4">
              <div className="space-y-1">
                <Label>ベースカラー</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                    aria-label="ベースカラーピッカー"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-28 h-10 rounded-md border border-input bg-background px-3 text-sm font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>段階数</Label>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(Math.max(3, Number(e.target.value)))}
                  className="w-20 h-10 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tints (明色)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex rounded-lg overflow-hidden">
                  {palette.tints.map((hex) => (
                    <button
                      type="button"
                      key={`tint-${hex}`}
                      onClick={() => copyColor(hex)}
                      className="flex-1 h-16 relative group"
                      style={{ backgroundColor: hex }}
                      aria-label={`ティント ${hex} をコピー`}
                    >
                      <span className="absolute bottom-0 left-0 right-0 text-[9px] font-mono text-center opacity-0 group-hover:opacity-100 bg-black/50 text-white py-0.5">
                        {hex}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shades (暗色)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex rounded-lg overflow-hidden">
                  {palette.shades.map((hex) => (
                    <button
                      type="button"
                      key={`shade-${hex}`}
                      onClick={() => copyColor(hex)}
                      className="flex-1 h-16 relative group"
                      style={{ backgroundColor: hex }}
                      aria-label={`シェード ${hex} をコピー`}
                    >
                      <span className="absolute bottom-0 left-0 right-0 text-[9px] font-mono text-center opacity-0 group-hover:opacity-100 bg-black/50 text-white py-0.5">
                        {hex}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              type="button"
              variant="outline"
              onClick={() => copyColor(palette.tints.concat(palette.shades).join('\n'))}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy All Colors
            </Button>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
