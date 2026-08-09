import { useState, useRef, useEffect, useCallback } from 'react';
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
import {
  generatePng,
  generateSvg,
  downloadBlob,
  getDisplayText,
  calculateFontSize,
  DEFAULT_OPTIONS,
  PRESETS,
  type PlaceholderOptions,
} from '@/utils/placeholderGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

type Format = 'png' | 'svg';

export default function App() {
  const [options, setOptions] = useState<PlaceholderOptions>({ ...DEFAULT_OPTIONS });
  const [format, setFormat] = useState<Format>('png');
  const [previewUrl, setPreviewUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updatePreview = useCallback(() => {
    if (format === 'svg') {
      const svg = generateSvg(options);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      setPreviewUrl(URL.createObjectURL(blob));
    } else if (canvasRef.current) {
      const dataUrl = generatePng(canvasRef.current, options);
      setPreviewUrl(dataUrl);
    }
  }, [options, format]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleDownload = () => {
    if (format === 'svg') {
      const svg = generateSvg(options);
      downloadBlob(svg, `placeholder-${options.width}x${options.height}.svg`, 'image/svg+xml');
      toast.add({ title: 'SVG downloaded' });
    } else if (canvasRef.current) {
      const dataUrl = generatePng(canvasRef.current, options);
      downloadBlob(dataUrl, `placeholder-${options.width}x${options.height}.png`, 'image/png');
      toast.add({ title: 'PNG downloaded' });
    }
  };

  const applyPreset = (width: number, height: number) => {
    setOptions((prev) => ({ ...prev, width, height }));
  };

  const updateOption = <K extends keyof PlaceholderOptions>(key: K, value: PlaceholderOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
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
            <h1 className="text-3xl font-bold tracking-tight">Image Placeholder Generator</h1>
            <p className="text-muted-foreground">
              Generate placeholder images with custom dimensions, colors, and text.
            </p>
          </header>

          <canvas ref={canvasRef} className="hidden" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Customize your placeholder image.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={4096}
                        value={options.width}
                        onChange={(e) => updateOption('width', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={4096}
                        value={options.height}
                        onChange={(e) => updateOption('height', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <input
                        type="color"
                        value={options.backgroundColor}
                        onChange={(e) => updateOption('backgroundColor', e.target.value)}
                        className="h-10 w-full cursor-pointer rounded-md border border-input"
                        aria-label="Background Color"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <input
                        type="color"
                        value={options.textColor}
                        onChange={(e) => updateOption('textColor', e.target.value)}
                        className="h-10 w-full cursor-pointer rounded-md border border-input"
                        aria-label="Text Color"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Text</Label>
                    <Input
                      value={options.text}
                      onChange={(e) => updateOption('text', e.target.value)}
                      placeholder={`${options.width} x ${options.height}`}
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label>Font Size (px)</Label>
                      <Input
                        type="number"
                        min={8}
                        max={200}
                        value={options.fontSize}
                        onChange={(e) => updateOption('fontSize', parseInt(e.target.value) || 24)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select value={format} onValueChange={(v) => setFormat(v as Format)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="svg">SVG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="button" className="w-full" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download {format.toUpperCase()}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Presets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 grid-cols-2">
                    {PRESETS.map((preset) => (
                      <Button
                        type="button"
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs"
                        onClick={() => applyPreset(preset.width, preset.height)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {options.width} x {options.height} - {format.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center bg-muted rounded-md p-4 min-h-[300px]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={`Placeholder ${options.width}x${options.height}`}
                      className="max-w-full max-h-[400px] object-contain border"
                    />
                  ) : (
                    <p className="text-muted-foreground">Generating preview...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
