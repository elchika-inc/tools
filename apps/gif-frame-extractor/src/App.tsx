import { Download, Image, Loader2, Trash2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  downloadFrame,
  extractGifFrames,
  formatFileSize,
  type GifFrame,
} from '@/utils/gifExtractor';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [frames, setFrames] = useState<GifFrame[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/gif')) {
        toast.add({
          title: 'GIF file only',
          description: 'Please select a GIF file.',
          type: "error",
        });
        return;
      }

      setIsLoading(true);
      setFileName(file.name);
      setFileSize(file.size);

      try {
        const extractedFrames = await extractGifFrames(file);
        setFrames(extractedFrames);
        toast.add({ title: `${extractedFrames.length} frame(s) extracted` });
      } catch {
        toast.add({
          title: 'Extraction failed',
          description: 'Could not extract frames from this GIF.',
          type: "error",
        });
        setFrames([]);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDownloadFrame = useCallback(
    (frame: GifFrame) => {
      const baseName = fileName.replace(/\.gif$/i, '');
      downloadFrame(frame, `${baseName}_frame_${frame.index}.png`);
    },
    [fileName]
  );

  const handleDownloadAll = useCallback(async () => {
    const baseName = fileName.replace(/\.gif$/i, '');
    for (const frame of frames) {
      downloadFrame(frame, `${baseName}_frame_${frame.index}.png`);
      // Small delay to avoid browser blocking multiple downloads
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    toast.add({ title: `${frames.length} frame(s) downloaded` });
  }, [frames, fileName, toast]);

  const handleCopyFrame = useCallback(
    async (frame: GifFrame) => {
      try {
        const res = await fetch(frame.dataUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.add({ title: 'Frame copied to clipboard' });
      } catch {
        toast.add({
          title: 'Copy failed',
          description: 'Could not copy frame to clipboard.',
          type: "error",
        });
      }
    },
    [toast]
  );

  const handleClear = useCallback(() => {
    setFrames([]);
    setFileName('');
    setFileSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">GIF Frame Extractor</h1>
            <p className="text-muted-foreground">
              Extract individual frames from animated GIF files.
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload GIF</CardTitle>
              <CardDescription>Drop a GIF file or click to select one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                type="button"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-full border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  {isLoading ? (
                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {isLoading ? 'Extracting frames...' : 'Drop GIF here or click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Supports animated GIF files</p>
                  </div>
                </div>
              </button>

              {fileName && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{fileName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(fileSize)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {frames.length} frame(s)
                      {frames.length > 0 && ` | ${frames[0].width} x ${frames[0].height}px`}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {frames.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Extracted Frames</CardTitle>
                    <CardDescription>
                      {frames.length} frame(s) extracted. Click on a frame to copy it.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleClear}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button type="button" onClick={handleDownloadAll}>
                      <Download className="mr-2 h-4 w-4" /> Download All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {frames.map((frame) => (
                    <div
                      key={frame.index}
                      className="group relative border rounded-lg overflow-hidden bg-muted/50"
                    >
                      <img
                        src={frame.dataUrl}
                        alt={`Frame ${frame.index}`}
                        className="w-full h-auto aspect-square object-contain bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => handleCopyFrame(frame)}
                            aria-label={`Copy frame ${frame.index}`}
                          >
                            <Image className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => handleDownloadFrame(frame)}
                            aria-label={`Download frame ${frame.index}`}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="px-2 py-1 text-xs text-center text-muted-foreground border-t">
                        #{frame.index}
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
