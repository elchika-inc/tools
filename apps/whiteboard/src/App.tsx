import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Pen,
  Eraser,
  Minus,
  Square,
  Circle,
  Undo2,
  Redo2,
  Trash2,
  Download,
} from 'lucide-react';
import {
  type Tool,
  type Point,
  type Stroke,
  type WhiteboardState,
  createInitialState,
  addStroke,
  undo,
  redo,
  clearAll,
  redrawCanvas,
  drawStroke,
  getCanvasPoint,
  saveAsPng,
} from '@/utils/whiteboardEngine';
import { toast, ToastToaster } from "@/components/ui/toast";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'pen', icon: <Pen className="h-4 w-4" />, label: 'Pen' },
  { id: 'eraser', icon: <Eraser className="h-4 w-4" />, label: 'Eraser' },
  { id: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line' },
  { id: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
  { id: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
];

const COLORS = [
  '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ffffff',
];

const STROKE_WIDTHS = [1, 2, 4, 6, 10];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wbState, setWbState] = useState<WhiteboardState>(createInitialState);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    redrawCanvas(ctx, wbState, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, [wbState]);

  const startDrawing = useCallback(
    (point: Point) => {
      setIsDrawing(true);
      currentStrokeRef.current = {
        tool: currentTool,
        points: [point],
        color: currentColor,
        width: currentWidth,
      };
    },
    [currentTool, currentColor, currentWidth]
  );

  const continueDrawing = useCallback(
    (point: Point) => {
      if (!isDrawing || !currentStrokeRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      currentStrokeRef.current.points.push(point);
      redrawCanvas(ctx, wbState, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawStroke(ctx, currentStrokeRef.current);
    },
    [isDrawing, wbState]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !currentStrokeRef.current) return;
    if (currentStrokeRef.current.points.length >= 2) {
      setWbState((prev) => addStroke(prev, currentStrokeRef.current!));
    }
    currentStrokeRef.current = null;
    setIsDrawing(false);
  }, [isDrawing]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      startDrawing(getCanvasPoint(canvas, e.clientX, e.clientY));
    },
    [startDrawing]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      continueDrawing(getCanvasPoint(canvas, e.clientX, e.clientY));
    },
    [continueDrawing]
  );

  const handleMouseUp = useCallback(() => stopDrawing(), [stopDrawing]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas || e.touches.length === 0) return;
      const touch = e.touches[0];
      startDrawing(getCanvasPoint(canvas, touch.clientX, touch.clientY));
    },
    [startDrawing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas || e.touches.length === 0) return;
      const touch = e.touches[0];
      continueDrawing(getCanvasPoint(canvas, touch.clientX, touch.clientY));
    },
    [continueDrawing]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      stopDrawing();
    },
    [stopDrawing]
  );

  const handleUndo = () => setWbState((prev) => undo(prev));
  const handleRedo = () => setWbState((prev) => redo(prev));

  const handleClear = () => {
    setWbState(clearAll());
    toast.add({ title: 'Canvas cleared' });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveAsPng(canvas);
    toast.add({ title: 'Saved as PNG' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4">
        <main className="max-w-7xl mx-auto space-y-4">
          <header className="space-y-1">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Whiteboard</h1>
            <p className="text-sm text-muted-foreground">
              Draw, sketch, and save your ideas. Touch supported.
            </p>
          </header>

          <Card>
            <CardContent className="pt-3 pb-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-1">
                  {TOOLS.map((tool) => (
                    <Button
                      key={tool.id}
                      type="button"
                      variant={currentTool === tool.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentTool(tool.id)}
                      title={tool.label}
                      aria-label={tool.label}
                    >
                      {tool.icon}
                    </Button>
                  ))}
                </div>

                <div className="w-px h-8 bg-border" />

                <div className="flex gap-1">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`w-7 h-7 rounded-md border-2 ${
                        currentColor === c ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setCurrentColor(c)}
                      title={c}
                    />
                  ))}
                </div>

                <div className="w-px h-8 bg-border" />

                <div className="flex items-center gap-2">
                  <Label className="text-xs">Width:</Label>
                  <div className="flex gap-1">
                    {STROKE_WIDTHS.map((w) => (
                      <Button
                        key={w}
                        type="button"
                        variant={currentWidth === w ? 'default' : 'outline'}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentWidth(w)}
                      >
                        {w}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="w-px h-8 bg-border" />

                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={wbState.strokes.length === 0}
                    title="Undo (Ctrl+Z)"
                    aria-label="Undo"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={wbState.undoneStrokes.length === 0}
                    title="Redo (Ctrl+Shift+Z)"
                    aria-label="Redo"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleClear} aria-label="Clear canvas">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleSave}>
                    <Download className="h-4 w-4 mr-1" /> PNG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="border rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
