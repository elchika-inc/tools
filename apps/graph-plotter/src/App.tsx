import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { type FunctionDef, getColor, renderGraph } from '@/utils/graphRenderer';
import { parse } from '@/utils/expressionParser';
import { ToastToaster } from "@/components/ui/toast";

const DEFAULT_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function App() {
  const [functions, setFunctions] = useState<FunctionDef[]>([
    { expression: 'x^2', color: getColor(0), label: 'f(x)' },
  ]);
  const [xMin, setXMin] = useState(DEFAULT_RANGE.xMin);
  const [xMax, setXMax] = useState(DEFAULT_RANGE.xMax);
  const [yMin, setYMin] = useState(DEFAULT_RANGE.yMin);
  const [yMax, setYMax] = useState(DEFAULT_RANGE.yMax);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setError('');

    // Validate expressions
    for (const fn of functions) {
      if (fn.expression.trim()) {
        try {
          parse(fn.expression);
        } catch (e) {
          setError(
            `Invalid expression "${fn.expression}": ${e instanceof Error ? e.message : 'Parse error'}`
          );
        }
      }
    }

    renderGraph(ctx, functions, {
      xMin,
      xMax,
      yMin,
      yMax,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    });
  }, [functions, xMin, xMax, yMin, yMax]);

  useEffect(() => {
    draw();
  }, [draw]);

  const addFunction = () => {
    const idx = functions.length;
    setFunctions([
      ...functions,
      { expression: '', color: getColor(idx), label: `g${idx}(x)` },
    ]);
  };

  const removeFunction = (index: number) => {
    if (functions.length <= 1) return;
    setFunctions(functions.filter((_, i) => i !== index));
  };

  const updateExpression = (index: number, expression: string) => {
    setFunctions(functions.map((fn, i) => (i === index ? { ...fn, expression } : fn)));
  };

  const updateColor = (index: number, color: string) => {
    setFunctions(functions.map((fn, i) => (i === index ? { ...fn, color } : fn)));
  };

  const zoomBy = useCallback(
    (factor: number) => {
      const cx = (xMin + xMax) / 2;
      const cy = (yMin + yMax) / 2;
      const xHalf = ((xMax - xMin) / 2) * factor;
      const yHalf = ((yMax - yMin) / 2) * factor;
      setXMin(cx - xHalf);
      setXMax(cx + xHalf);
      setYMin(cy - yHalf);
      setYMax(cy + yHalf);
    },
    [xMin, xMax, yMin, yMax]
  );

  const resetRange = () => {
    setXMin(DEFAULT_RANGE.xMin);
    setXMax(DEFAULT_RANGE.xMax);
    setYMin(DEFAULT_RANGE.yMin);
    setYMax(DEFAULT_RANGE.yMax);
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      zoomBy(factor);
    },
    [zoomBy]
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Graph Plotter</h1>
            <p className="text-muted-foreground">
              Plot mathematical functions. Enter y=f(x) expressions like x^2, sin(x), 2*x+1.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Functions</CardTitle>
                  <CardDescription>Add expressions to plot.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {functions.map((fn, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={fn.color}
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                        aria-label={`Function ${i + 1} color`}
                      />
                      <Input
                        placeholder="e.g. x^2"
                        value={fn.expression}
                        onChange={(e) => updateExpression(i, e.target.value)}
                        className="flex-1"
                      />
                      {functions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFunction(i)}
                          aria-label={`Remove function ${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFunction}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Function
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="xmin" className="text-xs">
                        X Min
                      </Label>
                      <Input
                        id="xmin"
                        type="number"
                        value={xMin}
                        onChange={(e) => setXMin(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="xmax" className="text-xs">
                        X Max
                      </Label>
                      <Input
                        id="xmax"
                        type="number"
                        value={xMax}
                        onChange={(e) => setXMax(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ymin" className="text-xs">
                        Y Min
                      </Label>
                      <Input
                        id="ymin"
                        type="number"
                        value={yMin}
                        onChange={(e) => setYMin(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ymax" className="text-xs">
                        Y Max
                      </Label>
                      <Input
                        id="ymax"
                        type="number"
                        value={yMax}
                        onChange={(e) => setYMax(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => zoomBy(0.5)}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => zoomBy(2)}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={resetRange}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                {error && <p className="text-sm text-destructive mb-2" role="alert">{error}</p>}
                <div className="border rounded-md overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="w-full h-auto"
                    onWheel={handleWheel}
                  />
                </div>
                <div className="flex gap-4 mt-3 flex-wrap">
                  {functions.map((fn, i) =>
                    fn.expression.trim() ? (
                      <div key={i} className="flex items-center gap-1 text-sm">
                        <span
                          className="inline-block w-4 h-1 rounded"
                          style={{ backgroundColor: fn.color }}
                        />
                        <span className="text-muted-foreground">y = {fn.expression}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
