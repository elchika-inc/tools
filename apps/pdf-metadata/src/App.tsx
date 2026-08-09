import { Download, FileUp, Save, Trash2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  downloadPdf,
  getPdfMetadata,
  type PdfMetadata,
  updatePdfMetadata,
} from '@/utils/pdfMetadata';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [editableFields, setEditableFields] = useState({
    title: '',
    author: '',
    subject: '',
    creator: '',
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setLoading(true);
      try {
        const meta = await getPdfMetadata(selectedFile);
        setFile(selectedFile);
        setMetadata(meta);
        setEditableFields({
          title: meta.title,
          author: meta.author,
          subject: meta.subject,
          creator: meta.creator,
        });
        toast.add({ title: 'PDF loaded successfully' });
      } catch {
        toast.add({
          title: 'Failed to read PDF',
          description: 'The file may be corrupted or password-protected.',
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const handleSaveAndDownload = useCallback(async () => {
    if (!file) return;

    setLoading(true);
    try {
      const updatedPdf = await updatePdfMetadata(file, editableFields);
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadPdf(updatedPdf, `${baseName}_updated.pdf`);
      toast.add({ title: 'PDF saved and downloaded' });
    } catch {
      toast.add({
        title: 'Failed to save PDF',
        description: 'An error occurred while updating metadata.',
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [file, editableFields, toast]);

  const handleClear = useCallback(() => {
    setFile(null);
    setMetadata(null);
    setEditableFields({ title: '', author: '', subject: '', creator: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile) return;

      if (droppedFile.type !== 'application/pdf') {
        toast.add({
          title: 'Invalid file type',
          description: 'Please drop a PDF file.',
          type: "error",
        });
        return;
      }

      setLoading(true);
      try {
        const meta = await getPdfMetadata(droppedFile);
        setFile(droppedFile);
        setMetadata(meta);
        setEditableFields({
          title: meta.title,
          author: meta.author,
          subject: meta.subject,
          creator: meta.creator,
        });
        toast.add({ title: 'PDF loaded successfully' });
      } catch {
        toast.add({
          title: 'Failed to read PDF',
          description: 'The file may be corrupted or password-protected.',
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const readonlyFields: { label: string; key: keyof PdfMetadata }[] = [
    { label: 'Producer', key: 'producer' },
    { label: 'Creation Date', key: 'creationDate' },
    { label: 'Modification Date', key: 'modificationDate' },
    { label: 'Page Count', key: 'pageCount' },
    { label: 'Page Size', key: 'pageSize' },
    { label: 'File Size', key: 'fileSize' },
  ];

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">PDF Metadata Preview</h1>
            <p className="text-muted-foreground">
              View and edit PDF metadata. All processing happens in your browser.
            </p>
          </header>

          <main className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>Select or drag and drop a PDF file to inspect.</CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                className="flex w-full flex-col items-center justify-center border-2 border-dashed border-input rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors bg-transparent"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : 'Click or drag a PDF file here'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>
            </CardContent>
          </Card>

          {/* Metadata Display */}
          {metadata && (
            <>
              {/* Editable Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Editable Metadata</CardTitle>
                  <CardDescription>
                    Edit the fields below and save to download an updated PDF.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="meta-title">Title</Label>
                      <Input
                        id="meta-title"
                        value={editableFields.title}
                        onChange={(e) =>
                          setEditableFields((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="Document title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta-author">Author</Label>
                      <Input
                        id="meta-author"
                        value={editableFields.author}
                        onChange={(e) =>
                          setEditableFields((prev) => ({ ...prev, author: e.target.value }))
                        }
                        placeholder="Author name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta-subject">Subject</Label>
                      <Input
                        id="meta-subject"
                        value={editableFields.subject}
                        onChange={(e) =>
                          setEditableFields((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        placeholder="Document subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta-creator">Creator</Label>
                      <Input
                        id="meta-creator"
                        value={editableFields.creator}
                        onChange={(e) =>
                          setEditableFields((prev) => ({ ...prev, creator: e.target.value }))
                        }
                        placeholder="Creator application"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Read-only Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Info</CardTitle>
                  <CardDescription>Read-only metadata from the PDF document.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <tbody>
                        {readonlyFields.map(({ label, key }) => (
                          <tr key={key} className="border-b last:border-b-0">
                            <td className="px-4 py-3 font-medium text-muted-foreground w-1/3">
                              {label}
                            </td>
                            <td className="px-4 py-3">{String(metadata[key]) || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClear} disabled={loading}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button type="button" onClick={handleSaveAndDownload} disabled={loading || !file}>
                  {loading ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" /> Save & Download
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </main>
        </div>
        
      </div>
  </ToastToaster>;
}
