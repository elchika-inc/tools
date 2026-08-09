import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import { createZip, formatSize } from '@/utils/zipCreator';
import { toast, ToastToaster } from "@/components/ui/toast";

interface FileEntry {
  file: File;
  name: string;
  size: number;
}

export default function App() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [creating, setCreating] = useState(false);
  const [compress, setCompress] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    const entries: FileEntry[] = Array.from(uploaded).map((file) => ({
      file,
      name: file.name,
      size: file.size,
    }));
    setFiles((prev) => [...prev, ...entries]);
    toast.add({ title: `${entries.length} file(s) added` });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateZip = async () => {
    if (files.length === 0) return;

    setCreating(true);
    try {
      const blob = await createZip(files.map((f) => f.file), compress);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'archive.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.add({ title: `ZIP created with ${files.length} file(s)` });
    } catch {
      toast.add({ title: 'Failed to create ZIP', type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ZIP Creator</h1>
            <p className="text-muted-foreground">
              Upload files and create a ZIP archive for download.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Add Files</CardTitle>
              <CardDescription>Select files to include in the ZIP archive.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  Drop files or click to upload
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Files ({files.length})</CardTitle>
                    <CardDescription>Total: {formatSize(totalSize)}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compress}
                        onChange={(e) => setCompress(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Compress
                    </label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setFiles([])}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All
                    </Button>
                    <Button type="button" size="sm" onClick={handleCreateZip} disabled={creating}>
                      <Download className="mr-2 h-4 w-4" />
                      {creating ? 'Creating...' : 'Create ZIP'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {files.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-3 p-3 rounded-md bg-muted"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
