import { Download, FileUp, RotateCw, Trash2 } from 'lucide-react';
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
import {
  downloadPdf,
  getPageCount,
  ROTATION_ANGLES,
  type RotationAngle,
  rotatePdf,
} from '@/utils/pdfRotate';
import { toast, ToastToaster } from "@/components/ui/toast";

type PageTarget = 'all' | 'specific';

function parseRange(part: string, maxPage: number): number[] {
  const trimmed = part.trim();
  if (trimmed.includes('-')) {
    const [startStr, endStr] = trimmed.split('-');
    const start = Number.parseInt(startStr, 10);
    const end = Number.parseInt(endStr, 10);
    if (Number.isNaN(start) || Number.isNaN(end)) return [];
    const result: number[] = [];
    for (let i = start; i <= end; i++) {
      if (i >= 1 && i <= maxPage) {
        result.push(i - 1);
      }
    }
    return result;
  }
  const num = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= maxPage) {
    return [num - 1];
  }
  return [];
}

function parsePageInput(input: string, maxPage: number): number[] | undefined {
  if (!input.trim()) return undefined;
  const indices: number[] = [];
  for (const part of input.split(',')) {
    indices.push(...parseRange(part, maxPage));
  }
  return indices.length > 0 ? [...new Set(indices)].sort((a, b) => a - b) : undefined;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [angle, setAngle] = useState<RotationAngle>(90);
  const [pageTarget, setPageTarget] = useState<PageTarget>('all');
  const [specificPages, setSpecificPages] = useState('');
  const [rotatedData, setRotatedData] = useState<Uint8Array | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (selectedFile.type !== 'application/pdf') {
        toast.add({ title: 'PDF file only', type: "error" });
        return;
      }

      setFile(selectedFile);
      setRotatedData(null);

      try {
        const count = await getPageCount(selectedFile);
        setPageCount(count);
        toast.add({ title: `PDF loaded (${count} pages)` });
      } catch {
        toast.add({ title: 'Failed to load PDF', type: "error" });
        setFile(null);
        setPageCount(0);
      }
    },
    [toast]
  );

  const handleRotate = useCallback(async () => {
    if (!file || angle === 0) return;

    setIsProcessing(true);
    try {
      const pageIndices =
        pageTarget === 'all' ? undefined : parsePageInput(specificPages, pageCount);
      const result = await rotatePdf(file, angle, pageIndices);
      setRotatedData(result);
      toast.add({ title: 'PDF rotated successfully' });
    } catch {
      toast.add({ title: 'Failed to rotate PDF', type: "error" });
    } finally {
      setIsProcessing(false);
    }
  }, [file, angle, pageTarget, specificPages, pageCount, toast]);

  const handleDownload = useCallback(() => {
    if (!rotatedData || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadPdf(rotatedData, `${baseName}_rotated.pdf`);
    toast.add({ title: 'Download started' });
  }, [rotatedData, file, toast]);

  const handleClear = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setAngle(90);
    setPageTarget('all');
    setSpecificPages('');
    setRotatedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">PDF Rotate</h1>
            <p className="text-muted-foreground">
              Rotate PDF pages by a specified angle. All processing is done in your browser.
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>Select a PDF file to rotate its pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="pdf-file">PDF File</Label>
                <div className="flex gap-2">
                  <Input
                    id="pdf-file"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {file && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Clear file"
                      onClick={handleClear}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {file && (
                  <p className="text-sm text-muted-foreground">
                    <FileUp className="inline h-4 w-4 mr-1" />
                    {file.name} - {pageCount} page{pageCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Rotation Settings */}
              {file && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Angle */}
                    <div className="space-y-2">
                      <Label htmlFor="angle">Rotation Angle</Label>
                      <Select
                        value={String(angle)}
                        onValueChange={(v) => setAngle(Number(v) as RotationAngle)}
                      >
                        <SelectTrigger id="angle">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROTATION_ANGLES.filter((a) => a !== 0).map((a) => (
                            <SelectItem key={a} value={String(a)}>
                              {a} degrees
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Page Target */}
                    <div className="space-y-2">
                      <Label htmlFor="page-target">Apply To</Label>
                      <Select
                        value={pageTarget}
                        onValueChange={(v) => setPageTarget(v as PageTarget)}
                      >
                        <SelectTrigger id="page-target">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Pages</SelectItem>
                          <SelectItem value="specific">Specific Pages</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Specific Pages Input */}
                  {pageTarget === 'specific' && (
                    <div className="space-y-2">
                      <Label htmlFor="specific-pages">Page Numbers</Label>
                      <Input
                        id="specific-pages"
                        placeholder="e.g. 1, 3, 5-8"
                        value={specificPages}
                        onChange={(e) => setSpecificPages(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter page numbers separated by commas. Use hyphens for ranges (e.g. 1-3).
                        Pages: 1 to {pageCount}.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleClear}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button
                      type="button"
                      onClick={handleRotate}
                      disabled={!file || angle === 0 || isProcessing}
                    >
                      <RotateCw className="mr-2 h-4 w-4" />
                      {isProcessing ? 'Processing...' : 'Rotate'}
                    </Button>
                    {rotatedData && (
                      <Button type="button" variant="secondary" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
        </div>
        
      </div>
  </ToastToaster>;
}
