import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  addWatermark,
  DEFAULT_OPTIONS,
  downloadPdf,
  type WatermarkOptions,
} from '@/utils/pdfWatermark';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkedPdf, setWatermarkedPdf] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<WatermarkOptions>({ ...DEFAULT_OPTIONS });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setWatermarkedPdf(null);
    } else if (selected) {
      toast.add({
        title: 'Invalid file type',
        description: 'Please select a PDF file.',
        type: "error",
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setWatermarkedPdf(null);
    } else {
      toast.add({
        title: 'Invalid file type',
        description: 'Please drop a PDF file.',
        type: "error",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const result = await addWatermark(file, options);
      setWatermarkedPdf(result);
      toast.add({ title: 'Watermark applied successfully' });
    } catch {
      toast.add({ title: 'Failed to apply watermark', type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedPdf || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadPdf(watermarkedPdf, `${baseName}_watermarked.pdf`);
    toast.add({ title: 'Download started' });
  };

  const handleClear = () => {
    setFile(null);
    setWatermarkedPdf(null);
    setOptions({ ...DEFAULT_OPTIONS });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0.5, g: 0.5, b: 0.5 };
    return {
      r: Number.parseInt(result[1], 16) / 255,
      g: Number.parseInt(result[2], 16) / 255,
      b: Number.parseInt(result[3], 16) / 255,
    };
  };

  const rgbToHex = (color: { r: number; g: number; b: number }): string => {
    const toHex = (v: number) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">PDF Watermark</h1>
            <p className="text-muted-foreground">Add a text watermark to your PDF documents.</p>
          </header>

          <main className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload PDF</CardTitle>
                <CardDescription>Select or drag & drop a PDF file.</CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  type="button"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="flex flex-col items-center justify-center min-h-[200px] w-full rounded-md border-2 border-dashed border-input bg-muted/50 p-6 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <FileText className="h-10 w-10 text-primary" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm font-medium">Click or drag & drop</p>
                      <p className="text-xs text-muted-foreground">PDF files only</p>
                    </div>
                  )}
                </button>
              </CardContent>
            </Card>

            {/* Watermark Options */}
            <Card>
              <CardHeader>
                <CardTitle>Watermark Settings</CardTitle>
                <CardDescription>Configure your watermark appearance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="watermark-text">Text</Label>
                  <Input
                    id="watermark-text"
                    value={options.text}
                    onChange={(e) => setOptions({ ...options, text: e.target.value })}
                    placeholder="Watermark text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size: {options.fontSize}px</Label>
                  <input
                    id="font-size"
                    type="range"
                    min="12"
                    max="120"
                    value={options.fontSize}
                    onChange={(e) => setOptions({ ...options, fontSize: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opacity">Opacity: {Math.round(options.opacity * 100)}%</Label>
                  <input
                    id="opacity"
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(options.opacity * 100)}
                    onChange={(e) =>
                      setOptions({ ...options, opacity: Number(e.target.value) / 100 })
                    }
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rotation">Rotation: {options.rotation} degrees</Label>
                  <input
                    id="rotation"
                    type="range"
                    min="-180"
                    max="180"
                    value={options.rotation}
                    onChange={(e) => setOptions({ ...options, rotation: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="color"
                      type="color"
                      value={rgbToHex(options.color)}
                      onChange={(e) => setOptions({ ...options, color: hexToRgb(e.target.value) })}
                      className="h-10 w-14 rounded-md border border-input cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      {rgbToHex(options.color).toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardContent className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="outline" onClick={handleClear}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                disabled={!file || !options.text || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Apply Watermark'}
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                disabled={!watermarkedPdf}
                variant="secondary"
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </CardContent>
          </Card>
        </main>
        </div>

      </div>
  </ToastToaster>;
}
