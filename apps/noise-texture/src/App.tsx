import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';
import { generateNoise, renderToCanvas, type ColorMode } from '@/utils/perlinNoise';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [scale, setScale] = useState(50);
  const [octaves, setOctaves] = useState(4);
  const [persistence, setPersistence] = useState(0.5);
  const [seed, setSeed] = useState(42);
  const [colorMode, setColorMode] = useState<ColorMode>('grayscale');
  const [color1, setColor1] = useState('#1e3a5f');
  const [color2, setColor2] = useState('#f0c040');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 512;

  useEffect(() => {
    if (!canvasRef.current) return;
    const noiseData = generateNoise(size, size, scale, octaves, persistence, seed);
    renderToCanvas(canvasRef.current, noiseData, size, size, colorMode, color1, color2);
  }, [scale, octaves, persistence, seed, colorMode, color1, color2]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `noise-${seed}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    toast.add({ title: 'Downloaded PNG' });
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Noise Texture Generator</h1>
            <p className="text-muted-foreground">
              Generate Perlin noise textures with customizable parameters.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr,auto]">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Adjust noise parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Scale: {scale}</Label>
                  <Input
                    type="range"
                    min={5}
                    max={200}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Octaves: {octaves}</Label>
                  <Input
                    type="range"
                    min={1}
                    max={8}
                    value={octaves}
                    onChange={(e) => setOctaves(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Persistence: {persistence.toFixed(2)}</Label>
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    value={persistence * 100}
                    onChange={(e) => setPersistence(Number(e.target.value) / 100)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Input
                    id="seed"
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color Mode</Label>
                  <Select value={colorMode} onValueChange={(v) => setColorMode(v as ColorMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grayscale">Grayscale</SelectItem>
                      <SelectItem value="gradient">Gradient Mapped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {colorMode === 'gradient' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Color 1</Label>
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="w-full h-10 rounded border cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color 2</Label>
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="w-full h-10 rounded border cursor-pointer"
                      />
                    </div>
                  </div>
                )}
                <Button type="button" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Download PNG
                </Button>
              </CardContent>
            </Card>

            <Card className="flex items-center justify-center p-4">
              <canvas
                ref={canvasRef}
                className="border rounded-lg"
                style={{ width: 320, height: 320 }}
              />
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
