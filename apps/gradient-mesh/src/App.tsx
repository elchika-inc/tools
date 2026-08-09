import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Download, Plus, Trash2 } from 'lucide-react';
import {
  renderMesh,
  generateCSS,
  downloadPng,
  parseHexColor,
  toHex,
  type ColorPoint,
} from '@/utils/gradientMesh';
import { toast, ToastToaster } from "@/components/ui/toast";

const DEFAULT_POINTS: ColorPoint[] = [
  { x: 0.2, y: 0.2, color: [255, 100, 100] },
  { x: 0.8, y: 0.2, color: [100, 100, 255] },
  { x: 0.2, y: 0.8, color: [100, 255, 100] },
  { x: 0.8, y: 0.8, color: [255, 200, 50] },
];

export default function App() {
  const [points, setPoints] = useState<ColorPoint[]>(DEFAULT_POINTS);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 512;

  useEffect(() => {
    if (canvasRef.current) {
      renderMesh(canvasRef.current, size, size, points);
    }
  }, [points]);

  const addPoint = () => {
    setPoints((prev) => [
      ...prev,
      {
        x: 0.5,
        y: 0.5,
        color: [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
        ],
      },
    ]);
  };

  const removePoint = (idx: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== idx));
    if (selectedIdx === idx) setSelectedIdx(null);
  };

  const updatePointColor = (idx: number, hex: string) => {
    const rgb = parseHexColor(hex);
    setPoints((prev) => prev.map((p, i) => (i === idx ? { ...p, color: rgb } : p)));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Find nearest point
    let minDist = Infinity;
    let nearest = -1;
    points.forEach((p, i) => {
      const d = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    });

    if (minDist < 0.05) {
      setSelectedIdx(nearest);
    }
  };

  const handleCanvasDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedIdx === null || e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setPoints((prev) => prev.map((p, i) => (i === selectedIdx ? { ...p, x, y } : p)));
  };

  const handleCopyCSS = async () => {
    try {
      await navigator.clipboard.writeText(generateCSS(points));
      toast.add({ title: 'CSS copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadPng(canvasRef.current);
      toast.add({ title: 'Downloaded PNG' });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Gradient Mesh Generator</h1>
            <p className="text-muted-foreground">
              Create mesh gradients by placing color control points. Drag points to adjust.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr,300px]">
            <Card className="p-4">
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-lg border cursor-crosshair"
                    style={{ aspectRatio: '1' }}
                    onMouseDown={handleCanvasClick}
                    onMouseMove={handleCanvasDrag}
                    onMouseUp={() => setSelectedIdx(null)}
                  />
                  {points.map((p, i) => (
                    <div
                      key={i}
                      className={`absolute w-4 h-4 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 pointer-events-none ${
                        selectedIdx === i ? 'border-white ring-2 ring-ring' : 'border-white'
                      }`}
                      style={{
                        left: `${p.x * 100}%`,
                        top: `${p.y * 100}%`,
                        backgroundColor: toHex(p.color),
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Points</CardTitle>
                <CardDescription>Click on canvas to select, drag to move.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {points.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={toHex(p.color)}
                      onChange={(e) => updatePointColor(i, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                      aria-label={`Point ${i + 1} color`}
                    />
                    <span className="text-xs text-muted-foreground flex-1">
                      ({(p.x * 100).toFixed(0)}%, {(p.y * 100).toFixed(0)}%)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePoint(i)}
                      className="h-6 w-6"
                      aria-label={`Remove point ${i + 1}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={addPoint}>
                  <Plus className="mr-1 h-3 w-3" /> Add Point
                </Button>

                <div className="border-t pt-3 space-y-2">
                  <Label>Export</Label>
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleCopyCSS}>
                    <Copy className="mr-1 h-3 w-3" /> Copy CSS
                  </Button>
                  <Button type="button" size="sm" className="w-full" onClick={handleDownload}>
                    <Download className="mr-1 h-3 w-3" /> Download PNG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
