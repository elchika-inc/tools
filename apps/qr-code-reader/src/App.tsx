import { Copy, ImageIcon, Trash2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { QrReadResult } from '@/utils/qrReader';
import { imageFileToImageData, readQrFromImageData } from '@/utils/qrReader';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [result, setResult] = useState<QrReadResult | null>(null);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        toast.add({ title: 'Invalid file type', type: "error" });
        return;
      }

      setError('');
      setResult(null);
      setIsProcessing(true);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      try {
        const imageData = await imageFileToImageData(file);
        const qrResult = readQrFromImageData(imageData);

        if (qrResult) {
          setResult(qrResult);
          toast.add({ title: 'QR code decoded successfully' });
        } else {
          setError('No QR code found in the image.');
          toast.add({
            title: 'No QR code found',
            description: 'Try a clearer image.',
            type: "error",
          });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to process image';
        setError(message);
        toast.add({ title: 'Processing failed', type: "error" });
      } finally {
        setIsProcessing(false);
      }
    },
    [toast]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.data);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const clearAll = () => {
    setResult(null);
    setError('');
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">QR Code Reader</h1>
            <p className="text-muted-foreground">
              Upload an image containing a QR code to decode its content.
            </p>
          </header>

          <main>
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Drag & drop an image or click to select a file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop zone */}
              <button
                type="button"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center w-full min-h-[200px] rounded-md border-2 border-dashed transition-colors cursor-pointer ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-1">Drag & drop your image here</p>
                <p className="text-xs text-muted-foreground">or click to select a file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </button>

              {/* Preview */}
              {preview && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex justify-center rounded-md border bg-muted p-4">
                    <img
                      src={preview}
                      alt="Uploaded QR code"
                      className="max-h-[300px] max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm text-muted-foreground">Processing...</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div role="alert" className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4">
                  <ImageIcon className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="space-y-2">
                  <Label htmlFor="result">Decoded Data</Label>
                  <textarea
                    id="result"
                    readOnly
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    value={result.data}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button type="button" onClick={copyToClipboard} disabled={!result}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Result
                </Button>
              </div>
            </CardContent>
          </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
