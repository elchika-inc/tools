import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createGrid, floodFill, exportToPng, type Tool } from '@/utils/pixelArt';
import { toast, ToastToaster } from "@/components/ui/toast";

const PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  '#008800', '#880000', '#000088', '#888888', '#cccccc',
  '#ffcccc',
];

const GRID_SIZES = [8, 16, 32];

export default function App() {
  const [gridSize, setGridSize] = useState(16);
  const [grid, setGrid] = useState(() => createGrid(16));
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState<Tool>('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleGridSizeChange = useCallback((value: string) => {
    const size = Number(value);
    setGridSize(size);
    setGrid(createGrid(size));
  }, []);

  const applyTool = useCallback((row: number, col: number) => {
    if (tool === 'fill') {
      setGrid((prev) => floodFill(prev, row, col, color));
    } else {
      setGrid((prev) => {
        const newGrid = prev.map((r) => [...r]);
        newGrid[row][col] = tool === 'eraser' ? '#ffffff' : color;
        return newGrid;
      });
    }
  }, [tool, color]);

  const handleCellDown = useCallback((row: number, col: number) => {
    setIsDrawing(true);
    applyTool(row, col);
  }, [applyTool]);

  const handleCellEnter = useCallback((row: number, col: number) => {
    if (isDrawing && tool !== 'fill') {
      applyTool(row, col);
    }
  }, [isDrawing, tool, applyTool]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleExport = useCallback(() => {
    const dataUrl = exportToPng(grid);
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = dataUrl;
    link.click();
    toast.add({ title: 'PNG saved' });
  }, [grid, toast]);

  const handleClear = useCallback(() => {
    setGrid(createGrid(gridSize));
    toast.add({ title: 'Canvas cleared' });
  }, [gridSize, toast]);

  const cellSize = Math.min(Math.floor(512 / gridSize), 40);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8" onMouseUp={handleMouseUp}>
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Pixel Art Editor</h1>
            <p className="text-muted-foreground">
              Grid size, color palette, drawing tools, PNG export
            </p>
          </header>

          <div className="flex flex-col lg:flex-row gap-6">
            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle>Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Grid Size</Label>
                  <Select value={String(gridSize)} onValueChange={handleGridSizeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRID_SIZES.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s} x {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tool</Label>
                  <div className="flex gap-2">
                    {(['pencil', 'eraser', 'fill'] as Tool[]).map((t) => (
                      <Button
                        key={t}
                        type="button"
                        variant={tool === t ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTool(t)}
                      >
                        {t === 'pencil' ? 'Pencil' : t === 'eraser' ? 'Eraser' : 'Fill'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`w-8 h-8 rounded border-2 ${color === c ? 'border-ring' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={handleExport} className="flex-1">
                    Export PNG
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardContent className="p-4 flex justify-center">
                <div
                  ref={gridRef}
                  className="inline-grid border border-border select-none"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                  }}
                  onMouseLeave={() => setIsDrawing(false)}
                >
                  {grid.map((row, r) =>
                    row.map((cellColor, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="border border-border/30 cursor-crosshair"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: cellColor,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCellDown(r, c);
                        }}
                        onMouseEnter={() => handleCellEnter(r, c)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
