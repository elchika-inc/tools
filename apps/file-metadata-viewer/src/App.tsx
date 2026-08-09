import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import {
  extractMetadata,
  getImageDimensions,
  formatFileSize,
  type FileMetadata,
  type ImageMetadata,
} from '@/utils/fileMetadata';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const meta = extractMetadata(file);
    setMetadata(meta);
    setImageMeta(null);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      try {
        const imgMeta = await getImageDimensions(file);
        setImageMeta(imgMeta);
        toast.add({ title: 'Image metadata loaded' });
      } catch {
        toast.add({ title: 'File metadata loaded' });
      }
    } else {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
      toast.add({ title: 'File metadata loaded' });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    setMetadata(null);
    setImageMeta(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">File Metadata Viewer</h1>
            <p className="text-muted-foreground">
              Upload a file to view its metadata including name, size, type, and image dimensions.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>Select any file to inspect its metadata.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  Drop a file or click to upload
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {metadata && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {metadata.type.startsWith('image/') ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                    File Metadata
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleClear}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">File Name</Label>
                    <p className="font-mono text-sm break-all">{metadata.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Extension</Label>
                    <p className="font-mono text-sm">{metadata.extension ? `.${metadata.extension}` : '(none)'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Size</Label>
                    <p className="font-mono text-sm">
                      {metadata.sizeFormatted} ({metadata.size.toLocaleString()} bytes)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">MIME Type</Label>
                    <p className="font-mono text-sm">{metadata.type}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Last Modified</Label>
                    <p className="font-mono text-sm">{metadata.lastModified}</p>
                  </div>
                  {imageMeta && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Dimensions</Label>
                        <p className="font-mono text-sm">
                          {imageMeta.width} x {imageMeta.height} px
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
                        <p className="font-mono text-sm">{imageMeta.aspectRatio}</p>
                      </div>
                    </>
                  )}
                </div>

                {previewUrl && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Preview</Label>
                    <div className="flex justify-center bg-muted rounded-md p-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
