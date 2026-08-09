import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Download, FileText, FolderOpen } from 'lucide-react';
import { extractZip, downloadEntry, formatSize } from '@/utils/zipExtractor';
import type { ZipFileEntry } from '@/utils/zipExtractor';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [entries, setEntries] = useState<ZipFileEntry[]>([]);
  const [zipName, setZipName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setZipName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = extractZip(buffer);
      setEntries(parsed);
      toast.add({ title: `${parsed.length} entries found in ${file.name}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse ZIP file');
      setEntries([]);
      toast.add({ title: 'Failed to parse ZIP', type: "error" });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtract = (entry: ZipFileEntry) => {
    if (entry.data.length === 0) {
      toast.add({ title: 'Cannot extract: compressed or empty file', type: "error" });
      return;
    }
    downloadEntry(entry);
    toast.add({ title: `Extracted ${entry.name}` });
  };

  const isDirectory = (name: string) => name.endsWith('/');
  const totalSize = entries.reduce((s, e) => s + e.uncompressedSize, 0);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ZIP Extractor</h1>
            <p className="text-muted-foreground">
              Upload a ZIP file to view and extract its contents.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload ZIP</CardTitle>
              <CardDescription>Select a .zip file to inspect.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  {zipName || 'Upload a ZIP file'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose ZIP File
                </Button>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive mt-2">{error}</p>
              )}
            </CardContent>
          </Card>

          {entries.length > 0 && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>
                    Contents ({entries.length} entries)
                  </CardTitle>
                  <CardDescription>
                    Total uncompressed: {formatSize(totalSize)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {entries.map((entry, i) => (
                    <div
                      key={`${entry.name}-${i}`}
                      className="flex items-center gap-3 p-3 rounded-md bg-muted"
                    >
                      {isDirectory(entry.name) ? (
                        <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono truncate">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(entry.uncompressedSize)}
                        </p>
                      </div>
                      {!isDirectory(entry.name) && entry.data.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExtract(entry)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
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
