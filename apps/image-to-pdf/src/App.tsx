import {
  ArrowDown,
  ArrowUp,
  Download,
  FileImage,
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
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
import type { ConversionOptions, FitMode, PageSize } from '@/utils/imageToPdf';
import {
  DEFAULT_OPTIONS,
  downloadPdf,
  FIT_MODES,
  formatFileSize,
  imagesToPdf,
  PAGE_SIZES,
} from '@/utils/imageToPdf';
import { toast, ToastToaster } from "@/components/ui/toast";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

let fileIdCounter = 0;

function createImageFile(file: File): ImageFile {
  fileIdCounter += 1;
  return {
    id: `file-${fileIdCounter}`,
    file,
    preview: URL.createObjectURL(file),
  };
}

export default function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newImages: ImageFile[] = [];
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          newImages.push(createImageFile(file));
        }
      }
      if (newImages.length === 0) {
        toast.add({
          title: 'No valid images',
          description: 'Please select image files (PNG, JPEG, etc.)',
          type: "error",
        });
        return;
      }
      setImages((prev) => [...prev, ...newImages]);
      setPdfData(null);
    },
    [toast]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
    setPdfData(null);
  }, []);

  const moveImage = useCallback((index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const newImages = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newImages.length) return prev;
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      return newImages;
    });
    setPdfData(null);
  }, []);

  const clearAll = useCallback(() => {
    for (const img of images) {
      URL.revokeObjectURL(img.preview);
    }
    setImages([]);
    setPdfData(null);
  }, [images]);

  const handleConvert = useCallback(async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    setPdfData(null);
    try {
      const files = images.map((img) => img.file);
      const data = await imagesToPdf(files, options);
      setPdfData(data);
      toast.add({ title: 'PDF created successfully' });
    } catch (e) {
      toast.add({
        title: 'Conversion failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setIsConverting(false);
    }
  }, [images, options, toast]);

  const handleDownload = useCallback(() => {
    if (!pdfData) return;
    downloadPdf(pdfData, 'images.pdf');
    toast.add({ title: 'PDF downloaded' });
  }, [pdfData, toast]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Image to PDF</h1>
            <p className="text-muted-foreground">
              Convert images to PDF. Supports multiple images, page size and fit mode options.
            </p>
          </header>

          <main className="space-y-6">
          {/* Upload area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
              <CardDescription>
                Drag & drop images or click to select. Supports PNG and JPEG.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop images here, or click to select files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </button>
            </CardContent>
          </Card>

          {/* Image list */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileImage className="h-5 w-5" />
                      Images ({images.length})
                    </CardTitle>
                    <CardDescription>Reorder or remove images before conversion.</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-3 p-2 rounded-md border bg-card"
                    >
                      <img
                        src={img.preview}
                        alt={img.file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{img.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(img.file.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Move ${img.file.name} up`}
                          onClick={() => moveImage(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Move ${img.file.name} down`}
                          onClick={() => moveImage(index, 'down')}
                          disabled={index === images.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${img.file.name}`}
                          onClick={() => removeImage(img.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Configure page size, fit mode, and margin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="page-size">Page Size</Label>
                  <Select
                    value={options.pageSize}
                    onValueChange={(value: PageSize) => {
                      setOptions((prev) => ({ ...prev, pageSize: value }));
                      setPdfData(null);
                    }}
                  >
                    <SelectTrigger id="page-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fit-mode">Fit Mode</Label>
                  <Select
                    value={options.fitMode}
                    onValueChange={(value: FitMode) => {
                      setOptions((prev) => ({ ...prev, fitMode: value }));
                      setPdfData(null);
                    }}
                  >
                    <SelectTrigger id="fit-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIT_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin">Margin (pt)</Label>
                  <Input
                    id="margin"
                    type="number"
                    min={0}
                    max={200}
                    value={options.margin}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value, 10);
                      if (!Number.isNaN(value) && value >= 0) {
                        setOptions((prev) => ({ ...prev, margin: value }));
                        setPdfData(null);
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={handleConvert}
              disabled={images.length === 0 || isConverting}
              className="flex-1"
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" /> Convert to PDF
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={!pdfData}
              variant="secondary"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
              {pdfData && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({formatFileSize(pdfData.length)})
                </span>
              )}
            </Button>
          </div>
        </main>
        </div>

      </div>
  </ToastToaster>;
}
