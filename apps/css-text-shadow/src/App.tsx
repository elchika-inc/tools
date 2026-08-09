import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Plus, Trash2 } from 'lucide-react';
import {
  generateTextShadowValue,
  generateTextShadowCss,
  hexToRgba,
  parseRgbaAlpha,
  parseRgbaHex,
  createShadowId,
  type ShadowLayer,
} from '@/utils/textShadowGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    {
      id: createShadowId(),
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.5)',
    },
  ]);
  const [previewText, setPreviewText] = useState('Text Shadow Preview');
  const [previewFontSize, setPreviewFontSize] = useState(48);
  const [previewColor, setPreviewColor] = useState('#333333');
  const shadowCss = generateTextShadowCss(layers);
  const shadowValue = generateTextShadowValue(layers);

  const addLayer = () => {
    setLayers((prev) => [
      ...prev,
      {
        id: createShadowId(),
        offsetX: 2,
        offsetY: 2,
        blur: 4,
        color: 'rgba(0, 0, 0, 0.3)',
      },
    ]);
  };

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLayer = (id: string, key: keyof Omit<ShadowLayer, 'id'>, value: number | string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [key]: value } : l))
    );
  };

  const updateLayerColor = (id: string, hex: string, alpha: number) => {
    const rgba = hexToRgba(hex, alpha);
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, color: rgba } : l))
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shadowCss);
      toast.add({ title: 'CSS copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CSS Text Shadow Generator</h1>
            <p className="text-muted-foreground">
              Create CSS text-shadow effects with multiple layers and live preview.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Edit the text, font size, and color to preview your shadow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Preview Text</Label>
                  <Input
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Enter preview text"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font Size (px)</Label>
                  <Input
                    type="number"
                    min={12}
                    max={120}
                    value={previewFontSize}
                    onChange={(e) => setPreviewFontSize(parseInt(e.target.value) || 48)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <input
                    type="color"
                    value={previewColor}
                    onChange={(e) => setPreviewColor(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-md border border-input"
                    aria-label="Text Color"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center min-h-[160px] bg-muted rounded-md p-8">
                <p
                  className="font-bold text-center break-all"
                  style={{
                    fontSize: `${previewFontSize}px`,
                    color: previewColor,
                    textShadow: shadowValue,
                  }}
                >
                  {previewText}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shadow Layers</CardTitle>
                <CardDescription>
                  Add multiple shadow layers and adjust each one individually.
                </CardDescription>
              </div>
              <Button type="button" size="sm" onClick={addLayer}>
                <Plus className="mr-1 h-4 w-4" /> Add Layer
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {layers.map((layer, index) => {
                const hex = parseRgbaHex(layer.color);
                const alpha = parseRgbaAlpha(layer.color);

                return (
                  <div key={layer.id} className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Layer {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLayer(layer.id)}
                        disabled={layers.length <= 1}
                        aria-label="Remove layer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Offset X (px)</Label>
                        <div className="space-y-1">
                          <input
                            type="range"
                            min={-50}
                            max={50}
                            value={layer.offsetX}
                            onChange={(e) =>
                              updateLayer(layer.id, 'offsetX', parseInt(e.target.value))
                            }
                            className="w-full accent-primary"
                            aria-label={`Layer ${index + 1} Offset X (px)`}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {layer.offsetX}px
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Offset Y (px)</Label>
                        <div className="space-y-1">
                          <input
                            type="range"
                            min={-50}
                            max={50}
                            value={layer.offsetY}
                            onChange={(e) =>
                              updateLayer(layer.id, 'offsetY', parseInt(e.target.value))
                            }
                            className="w-full accent-primary"
                            aria-label={`Layer ${index + 1} Offset Y (px)`}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {layer.offsetY}px
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Blur (px)</Label>
                        <div className="space-y-1">
                          <input
                            type="range"
                            min={0}
                            max={50}
                            value={layer.blur}
                            onChange={(e) =>
                              updateLayer(layer.id, 'blur', parseInt(e.target.value))
                            }
                            className="w-full accent-primary"
                            aria-label={`Layer ${index + 1} Blur (px)`}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {layer.blur}px
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Color</Label>
                        <input
                          type="color"
                          value={hex}
                          onChange={(e) => updateLayerColor(layer.id, e.target.value, alpha)}
                          className="h-10 w-full cursor-pointer rounded-md border border-input"
                          aria-label={`Layer ${index + 1} Color`}
                        />
                        <div className="space-y-1">
                          <Label className="text-xs">Opacity</Label>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={alpha}
                            onChange={(e) =>
                              updateLayerColor(layer.id, hex, parseFloat(e.target.value))
                            }
                            className="w-full accent-primary"
                            aria-label={`Layer ${index + 1} Opacity`}
                          />
                          <span className="text-xs text-muted-foreground font-mono">
                            {alpha.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated CSS</CardTitle>
              <Button type="button" size="sm" onClick={copyToClipboard}>
                <Copy className="mr-1 h-4 w-4" /> Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-md bg-muted text-sm overflow-auto">
                <code>{shadowCss}</code>
              </pre>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
