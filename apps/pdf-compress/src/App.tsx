import { FileDown, Loader2, Trash2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { calculateSavings, compressPdf, downloadPdf, formatFileSize } from '@/utils/pdfCompress';
import { toast, ToastToaster } from "@/components/ui/toast";

interface CompressionResult {
  data: Uint8Array;
  originalSize: number;
  compressedSize: number;
  filename: string;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (selectedFile.type !== 'application/pdf') {
        toast.add({
          title: 'Invalid file type',
          description: 'Please select a PDF file.',
          type: "error",
        });
        return;
      }

      setFile(selectedFile);
      setResult(null);
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile) return;

      if (droppedFile.type !== 'application/pdf') {
        toast.add({
          title: 'Invalid file type',
          description: 'Please select a PDF file.',
          type: "error",
        });
        return;
      }

      setFile(droppedFile);
      setResult(null);
    },
    [toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedData = await compressPdf(file);
      const compressedSize = compressedData.length;
      const originalSize = file.size;

      setResult({
        data: compressedData,
        originalSize,
        compressedSize,
        filename: file.name.replace(/\.pdf$/i, '_compressed.pdf'),
      });

      const { percent } = calculateSavings(originalSize, compressedSize);
      if (percent > 0) {
        toast.add({ title: 'Compression complete', description: `Reduced by ${percent}%` });
      } else {
        toast.add({
          title: 'Compression complete',
          description: 'File size could not be reduced further.',
        });
      }
    } catch {
      toast.add({
        title: 'Compression failed',
        description: 'An error occurred while compressing the PDF.',
        type: "error",
      });
    } finally {
      setIsCompressing(false);
    }
  }, [file, toast]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadPdf(result.data, result.filename);
    toast.add({ title: 'Download started' });
  }, [result, toast]);

  const handleClear = useCallback(() => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const savings = result ? calculateSavings(result.originalSize, result.compressedSize) : null;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">PDF Compress</h1>
            <p className="text-muted-foreground">
              Compress PDF files by removing unused objects and optimizing structure.
            </p>
          </header>

          <main>
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>Select or drag and drop a PDF file to compress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <button
                type="button"
                className="w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-transparent"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload PDF file"
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : 'Click or drag and drop a PDF file here'}
                </p>
                {file && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Size: {formatFileSize(file.size)}
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </button>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCompress}
                  disabled={!file || isCompressing}
                  className="flex-1"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    'Compress PDF'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={isCompressing}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>

              {/* Results */}
              {result && savings && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Compression Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Original Size</Label>
                      <p className="text-xl font-mono">{formatFileSize(result.originalSize)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Compressed Size</Label>
                      <p className="text-xl font-mono">{formatFileSize(result.compressedSize)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Saved</Label>
                      <p className="text-xl font-mono">
                        {formatFileSize(Math.max(0, savings.saved))}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Reduction</Label>
                      <p
                        className={`text-xl font-mono ${
                          savings.percent > 0 ? 'text-green-600' : 'text-muted-foreground'
                        }`}
                      >
                        {savings.percent > 0 ? `${savings.percent}%` : 'No reduction'}
                      </p>
                    </div>
                  </div>

                  <Button type="button" onClick={handleDownload} className="w-full">
                    <FileDown className="mr-2 h-4 w-4" /> Download Compressed PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        </div>

      </div>
  </ToastToaster>;
}
