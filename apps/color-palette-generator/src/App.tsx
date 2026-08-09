import { useState } from 'react';
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
import { Copy, Download } from 'lucide-react';
import {
  generatePalette,
  exportAsCssVariables,
  isValidHex,
  type PaletteColor,
  type PaletteType,
} from '@/utils/paletteGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

const PALETTE_TYPES: { value: PaletteType; label: string }[] = [
  { value: 'complementary', label: 'Complementary' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'split-complementary', label: 'Split-Complementary' },
  { value: 'tetradic', label: 'Tetradic' },
];

export default function App() {
  const [baseColor, setBaseColor] = useState('#3366cc');
  const [hexInput, setHexInput] = useState('#3366cc');
  const [paletteType, setPaletteType] = useState<PaletteType>('complementary');
  const palette = isValidHex(baseColor) ? generatePalette(baseColor, paletteType) : [];

  const handleColorPickerChange = (value: string) => {
    setBaseColor(value);
    setHexInput(value);
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      setBaseColor(value);
    }
  };

  const copyColor = async (color: PaletteColor) => {
    try {
      await navigator.clipboard.writeText(color.hex);
      toast.add({ title: `Copied ${color.hex}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const copyAllColors = async () => {
    try {
      const text = palette.map((c) => c.hex).join('\n');
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'All colors copied' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const exportCss = async () => {
    try {
      const css = exportAsCssVariables(palette);
      await navigator.clipboard.writeText(css);
      toast.add({ title: 'CSS variables copied' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const getContrastColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Color Palette Generator</h1>
            <p className="text-muted-foreground">
              Generate color palettes from a base color using color theory harmonies.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Base Color</CardTitle>
              <CardDescription>Pick a base color and choose a palette type.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="colorPicker">Color Picker</Label>
                  <input
                    id="colorPicker"
                    type="color"
                    value={baseColor}
                    onChange={(e) => handleColorPickerChange(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-md border border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hexInput">Hex Value</Label>
                  <Input
                    id="hexInput"
                    value={hexInput}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Palette Type</Label>
                  <Select value={paletteType} onValueChange={(v) => setPaletteType(v as PaletteType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PALETTE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {palette.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Palette</CardTitle>
                <CardDescription>
                  {PALETTE_TYPES.find((t) => t.value === paletteType)?.label} palette ({palette.length}{' '}
                  colors)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {palette.map((color, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => copyColor(color)}
                      className="group rounded-lg border overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
                    >
                      <div
                        className="h-24 flex items-center justify-center"
                        style={{ backgroundColor: color.hex }}
                      >
                        <Copy
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: getContrastColor(color.hex) }}
                        />
                      </div>
                      <div className="p-3 space-y-1 text-left">
                        <p className="font-mono text-sm font-medium">{color.hex}</p>
                        <p className="text-xs text-muted-foreground">
                          rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={copyAllColors}>
                    <Copy className="mr-2 h-4 w-4" /> Copy All
                  </Button>
                  <Button type="button" onClick={exportCss}>
                    <Download className="mr-2 h-4 w-4" /> Export CSS Variables
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
