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
  generateCSS,
  generateSVG,
  type PatternType,
  type PatternConfig,
} from '@/utils/patternGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [type, setType] = useState<PatternType>('stripes');
  const [size, setSize] = useState(20);
  const [color1, setColor1] = useState('#e2e8f0');
  const [color2, setColor2] = useState('#3b82f6');
  const [angle, setAngle] = useState(45);
  const [outputMode, setOutputMode] = useState<'css' | 'svg'>('css');
  const config: PatternConfig = useMemo(
    () => ({ type, size, color1, color2, angle }),
    [type, size, color1, color2, angle]
  );

  const cssOutput = useMemo(() => generateCSS(config), [config]);
  const svgOutput = useMemo(() => generateSVG(config), [config]);

  const previewStyle = useMemo(() => {
    const lines = cssOutput.split('\n');
    const styleObj: Record<string, string> = {};
    for (const line of lines) {
      const cleaned = line.trim().replace(/;$/, '');
      const colonIdx = cleaned.indexOf(':');
      if (colonIdx > 0) {
        const prop = cleaned.slice(0, colonIdx).trim();
        const val = cleaned.slice(colonIdx + 1).trim();
        const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        styleObj[camelProp] = val;
      }
    }
    return styleObj;
  }, [cssOutput]);

  const handleCopy = async () => {
    try {
      const text = outputMode === 'css' ? cssOutput : svgOutput;
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Pattern Generator</h1>
            <p className="text-muted-foreground">
              Generate CSS/SVG background patterns with customizable options.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure the pattern.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pattern Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as PatternType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripes">Stripes</SelectItem>
                      <SelectItem value="dots">Dots</SelectItem>
                      <SelectItem value="checkers">Checkers</SelectItem>
                      <SelectItem value="diagonal">Diagonal Lines</SelectItem>
                      <SelectItem value="zigzag">Zigzag</SelectItem>
                      <SelectItem value="waves">Waves</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size: {size}px</Label>
                  <Input
                    id="size"
                    type="range"
                    min={5}
                    max={60}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Color 1</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <Input value={color1} onChange={(e) => setColor1(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color 2</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <Input value={color2} onChange={(e) => setColor2(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="angle">Angle: {angle} deg</Label>
                  <Input
                    id="angle"
                    type="range"
                    min={0}
                    max={360}
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 rounded-lg border" style={previewStyle} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
              <CardDescription>
                <span className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={outputMode === 'css' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOutputMode('css')}
                  >
                    CSS
                  </Button>
                  <Button
                    type="button"
                    variant={outputMode === 'svg' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOutputMode('svg')}
                  >
                    SVG
                  </Button>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                {outputMode === 'css' ? cssOutput : svgOutput}
              </pre>
              <Button type="button" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" /> Copy {outputMode.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
