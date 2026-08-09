import { Copy, RefreshCw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { generateBlobSVG } from '@/utils/svgBlob';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [size, setSize] = useState(300);
  const [color, setColor] = useState('#3b82f6');
  const [points, setPoints] = useState(6);
  const [irregularity, setIrregularity] = useState(0.3);
  const [_seed, setSeed] = useState(0);
  const svg = useMemo(
    () => generateBlobSVG(size, color, points, irregularity),
    [size, color, points, irregularity]
  );
  const dataUri = useMemo(() => `data:image/svg+xml,${encodeURIComponent(svg)}`, [svg]);

  const regenerate = useCallback(() => setSeed((s) => s + 1), []);

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
            <h1 className="text-3xl font-bold tracking-tight">SVG Blob Generator</h1>
            <p className="text-muted-foreground">ランダムなSVG Blob形状を生成します。</p>
          </header>

          <main>
            <div className="flex justify-center p-8 bg-muted rounded-lg">
              <img src={dataUri} alt="生成されたBlob形状" width={size} height={size} />
            </div>

            <div className="grid gap-4 md:grid-cols-[280px,1fr] mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label>Points: {points}</Label>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      className="w-full"
                      aria-label={`Points: ${points}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Irregularity: {(irregularity * 100).toFixed(0)}%</Label>
                    <input
                      type="range"
                      min={0}
                      max={0.8}
                      step={0.05}
                      value={irregularity}
                      onChange={(e) => setIrregularity(Number(e.target.value))}
                      className="w-full"
                      aria-label={`Irregularity: ${(irregularity * 100).toFixed(0)}%`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Size: {size}</Label>
                    <input
                      type="range"
                      min={100}
                      max={600}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full"
                      aria-label={`Size: ${size}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Color</Label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                      aria-label="Blob color"
                    />
                  </div>
                  <Button type="button" onClick={regenerate} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                  </Button>
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
