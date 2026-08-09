import { useState, useMemo } from 'react';
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
import { Copy } from 'lucide-react';
import {
  calculate,
  fromRatio,
  formatRatio,
  formatDecimal,
  PRESETS,
} from '@/utils/aspectRatio';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  const [ratioW, setRatioW] = useState(16);
  const [ratioH, setRatioH] = useState(9);
  const [knownDimension, setKnownDimension] = useState<'width' | 'height'>('width');
  const [knownValue, setKnownValue] = useState(1920);
  const calculated = useMemo(() => calculate(width, height), [width, height]);
  const fromRatioResult = useMemo(
    () => fromRatio(ratioW, ratioH, knownDimension, knownValue),
    [ratioW, ratioH, knownDimension, knownValue]
  );

  const applyPreset = (ratioWidth: number, ratioHeight: number) => {
    setRatioW(ratioWidth);
    setRatioH(ratioHeight);
  };

  const copyRatio = async () => {
    try {
      const text = formatRatio(calculated.ratioWidth, calculated.ratioHeight);
      await navigator.clipboard.writeText(text);
      toast.add({ title: `Copied: ${text}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const copyDimensions = async () => {
    try {
      const text = `${fromRatioResult.width} x ${fromRatioResult.height}`;
      await navigator.clipboard.writeText(text);
      toast.add({ title: `Copied: ${text}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const previewMaxWidth = 300;
  const previewAspect = width > 0 && height > 0 ? width / height : 1;
  const previewWidth = previewAspect >= 1 ? previewMaxWidth : previewMaxWidth * previewAspect;
  const previewHeight = previewAspect >= 1 ? previewMaxWidth / previewAspect : previewMaxWidth;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Aspect Ratio Calculator</h1>
            <p className="text-muted-foreground">
              Calculate aspect ratios from dimensions, or dimensions from ratios.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Ratio</CardTitle>
                <CardDescription>Enter width and height to find the aspect ratio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="calc-width">Width</Label>
                    <Input
                      id="calc-width"
                      type="number"
                      min={1}
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calc-height">Height</Label>
                    <Input
                      id="calc-height"
                      type="number"
                      min={1}
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ratio</span>
                    <span className="font-mono font-medium">
                      {formatRatio(calculated.ratioWidth, calculated.ratioHeight)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Decimal</span>
                    <span className="font-mono font-medium">
                      {formatDecimal(calculated.decimal)}
                    </span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={copyRatio}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Ratio
                </Button>

                <div className="flex items-center justify-center pt-2">
                  <div
                    className="border-2 border-primary rounded-md bg-primary/10 flex items-center justify-center text-xs text-muted-foreground"
                    style={{
                      width: `${previewWidth}px`,
                      height: `${previewHeight}px`,
                      maxWidth: '100%',
                    }}
                  >
                    {width} x {height}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculate from Ratio</CardTitle>
                <CardDescription>
                  Enter a ratio and one dimension to find the other.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Ratio Width</Label>
                    <Input
                      type="number"
                      min={1}
                      value={ratioW}
                      onChange={(e) => setRatioW(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ratio Height</Label>
                    <Input
                      type="number"
                      min={1}
                      value={ratioH}
                      onChange={(e) => setRatioH(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Known Dimension</Label>
                    <Select
                      value={knownDimension}
                      onValueChange={(v) => setKnownDimension(v as 'width' | 'height')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="width">Width</SelectItem>
                        <SelectItem value="height">Height</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value (px)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={knownValue}
                      onChange={(e) => setKnownValue(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Width</span>
                    <span className="font-mono font-medium">{fromRatioResult.width}px</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Height</span>
                    <span className="font-mono font-medium">{fromRatioResult.height}px</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={copyDimensions}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Dimensions
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Common Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                {PRESETS.map((preset) => (
                  <Button
                    type="button"
                    key={preset.label}
                    variant="outline"
                    className="justify-start"
                    onClick={() => applyPreset(preset.ratioWidth, preset.ratioHeight)}
                  >
                    <span className="font-mono mr-2">
                      {preset.ratioWidth}:{preset.ratioHeight}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {preset.label.split('(')[1]?.replace(')', '')}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
