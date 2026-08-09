import { Download, FileUp, GripVertical, Loader2, Trash2, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadPdf, formatFileSize, mergePdfs } from '@/utils/pdfMerge';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const pdfFiles = Array.from(newFiles).filter((f) => f.type === 'application/pdf');
      if (pdfFiles.length === 0) {
        toast.add({ title: 'PDF files only', type: "error" });
        return;
      }
      setFiles((prev) => [...prev, ...pdfFiles]);
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
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

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
        e.target.value = '';
      }
    },
    [addFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  // Drag-to-reorder handlers
  const handleItemDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleItemDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex === null) return;
      e.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    },
    [dragIndex]
  );

  const handleItemDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragIndex === null || dragIndex === targetIndex) {
        setDragIndex(null);
        setDragOverIndex(null);
        return;
      }
      setFiles((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(targetIndex, 0, moved);
        return updated;
      });
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex]
  );

  const handleItemDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      toast.add({
        title: 'At least 2 files required',
        description: 'Please add more PDF files to merge.',
        type: "error",
      });
      return;
    }

    setMerging(true);
    try {
      const merged = await mergePdfs(files);
      downloadPdf(merged, 'merged.pdf');
      toast.add({ title: 'PDF merged successfully' });
    } catch {
      toast.add({
        title: 'Merge failed',
        description: 'One or more files could not be processed.',
        type: "error",
      });
    } finally {
      setMerging(false);
    }
  }, [files, toast]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">PDF Merge</h1>
            <p className="text-muted-foreground">
              Merge multiple PDF files into one. Drag to reorder before merging.
            </p>
          </header>

          <main>
          <Card>
            <CardHeader>
              <CardTitle>Upload PDFs</CardTitle>
              <CardDescription>
                Drop PDF files here or click to select. All processing is done in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop zone */}
              <button
                type="button"
                className={`w-full border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">Drop PDF files here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </button>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {files.length} file{files.length !== 1 ? 's' : ''} selected
                    </p>
                    <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                      <Trash2 className="mr-1 h-3 w-3" />
                      Clear all
                    </Button>
                  </div>

                  <ul className="border rounded-lg divide-y list-none m-0 p-0">
                    {files.map((file, index) => (
                      <li
                        key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                        draggable
                        onDragStart={(e) => handleItemDragStart(e, index)}
                        onDragOver={(e) => handleItemDragOver(e, index)}
                        onDrop={(e) => handleItemDrop(e, index)}
                        onDragEnd={handleItemDragEnd}
                        className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                          dragIndex === index ? 'opacity-50' : ''
                        } ${dragOverIndex === index && dragIndex !== index ? 'bg-primary/5' : ''}`}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab shrink-0" />
                        <span className="text-sm text-muted-foreground w-6 text-right shrink-0">
                          {index + 1}.
                        </span>
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatFileSize(file.size)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          aria-label={`Remove ${file.name}`}
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" onClick={handleMerge} disabled={files.length < 2 || merging}>
                  {merging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Merge & Download
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
