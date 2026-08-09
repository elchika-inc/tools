import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  parseInput,
  squarify,
  renderTreemapToCanvas,
  downloadCanvasAsPng,
} from '@/utils/treemap';
import { ToastToaster } from "@/components/ui/toast";

const SAMPLE_DATA = `JavaScript, 65
Python, 48
TypeScript, 42
Java, 35
C#, 30
Rust, 28
Go, 25
PHP, 20
Swift, 18
Kotlin, 15`;

export default function App() {
  const [input, setInput] = useState(SAMPLE_DATA);
  const [title, setTitle] = useState('Programming Languages by Popularity');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const items = useMemo(() => parseInput(input), [input]);

  const canvasWidth = 700;
  const canvasHeight = 480;

  const rects = useMemo(
    () => squarify(items, 0, 0, canvasWidth, canvasHeight - (title ? 40 : 0)),
    [items, title]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    renderTreemapToCanvas(ctx, rects, canvasWidth, canvasHeight, title);
  }, [rects, title]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvasAsPng(canvas, 'treemap.png');
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Treemap Generator</h1>
            <p className="text-muted-foreground">
              Generate treemap visualizations from name-value data
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Data Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data (name, value per line)</Label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Name, Value"
                    className="font-mono min-h-[300px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {items.length} items parsed
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                    Download PNG
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-white flex items-center justify-center overflow-auto">
                  <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
