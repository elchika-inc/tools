import JsBarcode from 'jsbarcode';
import { Copy, Download, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type BarcodeFormat,
  type BarcodeOptions,
  DEFAULT_OPTIONS,
  FORMATS,
  validateInput,
} from '@/utils/barcode';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<BarcodeOptions>(DEFAULT_OPTIONS);
  const [error, setError] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const isValid = value.length > 0 && validateInput(value, options.format);

  useEffect(() => {
    if (!svgRef.current || !isValid) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: options.format,
        width: options.width,
        height: options.height,
        displayValue: options.displayValue,
        lineColor: options.lineColor,
        background: options.background,
      });
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Barcode generation failed');
    }
  }, [value, options, isValid]);

  const handleFormatChange = (format: string) => {
    setOptions((prev) => ({ ...prev, format: format as BarcodeFormat }));
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barcode-${options.format}-${value}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.add({ title: 'Downloaded SVG' });
  };

  const handleCopy = async () => {
    if (!svgRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      await navigator.clipboard.writeText(svgData);
      toast.add({ title: 'Copied SVG to clipboard' });
    } catch (_e) {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const handleClear = () => {
    setValue('');
    setOptions(DEFAULT_OPTIONS);
    setError('');
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Barcode Generator</h1>
            <p className="text-muted-foreground">
              Generate barcodes in various formats and download as SVG.
            </p>
          </header>

          <main>
          <div className="grid gap-6 md:grid-cols-[1fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure barcode format and appearance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    placeholder="Enter barcode value..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                  {value.length > 0 && !isValid && (
                    <p role="alert" className="text-sm text-destructive">
                      Invalid value for {options.format} format.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select value={options.format} onValueChange={handleFormatChange}>
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Bar Width</Label>
                    <Input
                      id="width"
                      type="number"
                      min={1}
                      max={4}
                      value={options.width}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, width: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      min={10}
                      max={300}
                      value={options.height}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, height: Number(e.target.value) }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lineColor">Line Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="lineColor"
                        type="color"
                        className="w-12 h-10 p-1 cursor-pointer"
                        value={options.lineColor}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, lineColor: e.target.value }))
                        }
                      />
                      <Input
                        value={options.lineColor}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, lineColor: e.target.value }))
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="background">Background</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background"
                        type="color"
                        className="w-12 h-10 p-1 cursor-pointer"
                        value={options.background}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, background: e.target.value }))
                        }
                      />
                      <Input
                        value={options.background}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, background: e.target.value }))
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="displayValue"
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={options.displayValue}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, displayValue: e.target.checked }))
                    }
                  />
                  <Label htmlFor="displayValue">Show text below barcode</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Generated barcode preview.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center min-h-[200px] rounded-md border border-dashed border-border p-4">
                  {isValid ? (
                    <svg ref={svgRef} />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {value.length === 0
                        ? 'Enter a value to generate barcode.'
                        : 'Invalid value for selected format.'}
                    </p>
                  )}
                </div>

                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleClear}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={handleCopy} disabled={!isValid}>
                    <Copy className="mr-2 h-4 w-4" /> Copy SVG
                  </Button>
                  <Button type="button" onClick={handleDownload} disabled={!isValid}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
