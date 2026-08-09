import { Download, FileUp, ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
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
  type ConversionOptions,
  DEFAULT_OPTIONS,
  downloadImage,
  formatFileSize,
  IMAGE_FORMATS,
  type ImageFormat,
  pdfToImages,
} from '@/utils/pdfToImage';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setImages([]);
      setProgress({ current: 0, total: 0 });
    } else if (selected) {
      toast.add({
        title: 'Invalid file',
        description: 'Please select a PDF file.',
        type: "error",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setImages([]);
      setProgress({ current: 0, total: 0 });
    } else {
      toast.add({
        title: 'Invalid file',
        description: 'Please drop a PDF file.',
        type: "error",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setImages([]);
    setProgress({ current: 0, total: 0 });

    try {
      const result = await pdfToImages(file, options, (current, total) => {
        setProgress({ current, total });
      });
      setImages(result);
      toast.add({ title: 'Conversion complete', description: `${result.length} page(s) converted.` });
    } catch (err) {
      toast.add({
        title: 'Conversion failed',
        description: err instanceof Error ? err.message : 'An error occurred.',
        type: "error",
      });
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const baseName = file?.name?.replace(/\.pdf$/i, '') ?? 'page';
    const ext = options.format === 'jpeg' ? 'jpg' : 'png';
    downloadImage(dataUrl, `${baseName}_page${index + 1}.${ext}`);
  };

  const handleDownloadAll = () => {
    for (let i = 0; i < images.length; i++) {
      handleDownload(images[i], i);
    }
  };

  const handleClear = () => {
    setFile(null);
    setImages([]);
    setProgress({ current: 0, total: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">PDF to Image</h1>
            <p className="text-muted-foreground">
              Convert PDF pages to PNG or JPEG images. All processing happens in your browser.
            </p>
          </header>

          <main className="space-y-6">
          {/* Upload & Options */}
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>Select or drag & drop a PDF file to convert.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drop zone */}
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-input p-8 cursor-pointer hover:border-primary/50 transition-colors w-full bg-transparent"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <FileUp className="h-10 w-10 text-muted-foreground" />
                {file ? (
                  <div className="text-center">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-medium">Click or drag & drop a PDF file</p>
                    <p className="text-sm text-muted-foreground">Supports .pdf files</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>

              {/* Options */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={options.format}
                    onValueChange={(value) =>
                      setOptions((prev) => ({ ...prev, format: value as ImageFormat }))
                    }
                  >
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_FORMATS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scale">Scale (x{options.scale})</Label>
                  <Input
                    id="scale"
                    type="number"
                    min={0.5}
                    max={5}
                    step={0.5}
                    value={options.scale}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        scale: Number.parseFloat(e.target.value) || 1,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality">Quality ({Math.round(options.quality * 100)}%)</Label>
                  <Input
                    id="quality"
                    type="number"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={options.quality}
                    disabled={options.format === 'png'}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        quality: Number.parseFloat(e.target.value) || 0.9,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button type="button" onClick={handleConvert} disabled={!file || converting}>
                  {converting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting... {progressPercent}%
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Convert
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleClear} disabled={converting}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                {images.length > 1 && (
                  <Button type="button" variant="secondary" onClick={handleDownloadAll}>
                    <Download className="mr-2 h-4 w-4" /> Download All ({images.length})
                  </Button>
                )}
              </div>

              {/* Progress bar */}
              {converting && progress.total > 0 && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Processing page {progress.current} of {progress.total}
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Converted Images</CardTitle>
                <CardDescription>
                  {images.length} page(s) converted to {options.format.toUpperCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((dataUrl, index) => (
                    <div
                      key={`page-${index + 1}`}
                      className="group relative rounded-lg border bg-muted overflow-hidden"
                    >
                      <img src={dataUrl} alt={`Page ${index + 1}`} className="w-full h-auto" />
                      <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3">
                        <span className="text-white text-sm font-medium">Page {index + 1}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          aria-label={`Download page ${index + 1}`}
                          onClick={() => handleDownload(dataUrl, index)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        </div>
        
      </div>
  </ToastToaster>;
}
