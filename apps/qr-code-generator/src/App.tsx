import { Download, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
  DEFAULT_OPTIONS,
  type ErrorCorrectionLevel,
  generateQrDataUrl,
  generateQrSvg,
  type QrOptions,
} from '@/utils/qrCode';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [text, setText] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [options, setOptions] = useState<QrOptions>(DEFAULT_OPTIONS);
  const generateQr = useCallback(async () => {
    if (!text.trim()) {
      setQrDataUrl('');
      return;
    }
    try {
      const dataUrl = await generateQrDataUrl(text, options);
      setQrDataUrl(dataUrl);
    } catch (_e) {
      toast.add({
        title: 'QR code generation failed',
        type: "error",
      });
    }
  }, [text, options, toast]);

  useEffect(() => {
    generateQr();
  }, [generateQr]);

  const downloadPng = async () => {
    if (!text.trim()) return;
    try {
      const dataUrl = await generateQrDataUrl(text, options);
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = dataUrl;
      link.click();
      toast.add({ title: 'PNG downloaded' });
    } catch (_e) {
      toast.add({
        title: 'Download failed',
        type: "error",
      });
    }
  };

  const downloadSvg = async () => {
    if (!text.trim()) return;
    try {
      const svgString = await generateQrSvg(text, options);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'qrcode.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.add({ title: 'SVG downloaded' });
    } catch (_e) {
      toast.add({
        title: 'Download failed',
        type: "error",
      });
    }
  };

  const clearAll = () => {
    setText('');
    setQrDataUrl('');
    setOptions(DEFAULT_OPTIONS);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
            <p className="text-muted-foreground">
              Generate QR codes from text or URLs with customizable options.
            </p>
          </header>

          <main>
          <div className="grid gap-6 md:grid-cols-[1fr,1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Input</CardTitle>
                  <CardDescription>Enter text or URL to generate a QR code.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-text">Text / URL</Label>
                    <textarea
                      id="qr-text"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Enter text or URL here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                  <CardDescription>Customize QR code appearance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="error-correction">Error Correction Level</Label>
                    <Select
                      value={options.errorCorrectionLevel}
                      onValueChange={(value: ErrorCorrectionLevel) =>
                        setOptions((prev) => ({ ...prev, errorCorrectionLevel: value }))
                      }
                    >
                      <SelectTrigger id="error-correction">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">L - Low (7%)</SelectItem>
                        <SelectItem value="M">M - Medium (15%)</SelectItem>
                        <SelectItem value="Q">Q - Quartile (25%)</SelectItem>
                        <SelectItem value="H">H - High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        min={64}
                        max={1024}
                        value={options.width}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            width: Number.parseInt(e.target.value, 10) || 256,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="margin">Margin</Label>
                      <Input
                        id="margin"
                        type="number"
                        min={0}
                        max={20}
                        value={options.margin}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            margin: Number.parseInt(e.target.value, 10) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color-dark">Foreground Color</Label>
                      <div className="flex gap-2">
                        <input
                          id="color-dark"
                          type="color"
                          value={options.color.dark}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              color: { ...prev.color, dark: e.target.value },
                            }))
                          }
                          className="h-10 w-10 rounded-md border border-input cursor-pointer"
                        />
                        <Input
                          value={options.color.dark}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              color: { ...prev.color, dark: e.target.value },
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color-light">Background Color</Label>
                      <div className="flex gap-2">
                        <input
                          id="color-light"
                          type="color"
                          value={options.color.light}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              color: { ...prev.color, light: e.target.value },
                            }))
                          }
                          className="h-10 w-10 rounded-md border border-input cursor-pointer"
                        />
                        <Input
                          value={options.color.light}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              color: { ...prev.color, light: e.target.value },
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Generated QR code preview.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-center w-full min-h-[280px] rounded-md border border-input bg-muted/30">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Generated QR Code" className="max-w-full h-auto" />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Enter text to generate a QR code
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 w-full">
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={downloadPng}
                      disabled={!qrDataUrl}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download PNG
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={downloadSvg}
                      disabled={!qrDataUrl}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download SVG
                    </Button>
                  </div>

                  <Button type="button" variant="outline" className="w-full" onClick={clearAll}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
