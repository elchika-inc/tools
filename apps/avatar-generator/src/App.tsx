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
import { Download, RefreshCw } from 'lucide-react';
import { generate, downloadPng, type AvatarStyle } from '@/utils/avatarGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [seed, setSeed] = useState('hello');
  const [style, setStyle] = useState<AvatarStyle>('identicon');
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState('#f0f0f0');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      generate(canvasRef.current, style, seed, size, bgColor);
    }
  }, [seed, style, size, bgColor]);

  const handleRandomSeed = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setSeed(result);
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadPng(canvasRef.current, `avatar-${seed}.png`);
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
            <h1 className="text-3xl font-bold tracking-tight">Avatar Generator</h1>
            <p className="text-muted-foreground">
              Generate random avatars from text seeds. Deterministic output for the same seed.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr,auto]">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your avatar generation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed Text</Label>
                  <div className="flex gap-2">
                    <Input
                      id="seed"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="Enter seed text..."
                    />
                    <Button type="button" variant="outline" size="icon" onClick={handleRandomSeed}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={(v) => setStyle(v as AvatarStyle)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geometric">Geometric Patterns</SelectItem>
                      <SelectItem value="pixel">Pixel Art</SelectItem>
                      <SelectItem value="identicon">Identicon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Size: {size}px</Label>
                  <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="64">64px</SelectItem>
                      <SelectItem value="128">128px</SelectItem>
                      <SelectItem value="256">256px</SelectItem>
                      <SelectItem value="512">512px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      id="bgColor"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-28"
                    />
                  </div>
                </div>

                <Button type="button" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Download PNG
                </Button>
              </CardContent>
            </Card>

            <Card className="flex items-center justify-center p-8">
              <div className="space-y-4 text-center">
                <canvas
                  ref={canvasRef}
                  className="border rounded-lg mx-auto"
                  style={{ width: Math.min(size, 256), height: Math.min(size, 256) }}
                />
                <p className="text-sm text-muted-foreground">
                  {size}x{size}px - {style}
                </p>
              </div>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
