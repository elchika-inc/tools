import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { parseExifInfo, removeExif, isJPEG, type ExifInfo } from '@/utils/exifEditor';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [fileData, setFileData] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState('');
  const [exifInfo, setExifInfo] = useState<ExifInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    if (!isJPEG(data)) {
      toast.add({ title: 'Please upload a JPEG file', type: "error" });
      return;
    }

    setFileData(data);
    setFileName(file.name);

    const info = parseExifInfo(data);
    setExifInfo(info);

    const blob = new Blob([data], { type: 'image/jpeg' });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));

    toast.add({
      title: `Loaded ${file.name}`,
      description: info.hasExif ? 'EXIF data found' : 'No EXIF data',
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExif = () => {
    if (!fileData) return;

    const cleaned = removeExif(fileData);
    setFileData(cleaned);

    const info = parseExifInfo(cleaned);
    setExifInfo(info);

    const blob = new Blob([cleaned], { type: 'image/jpeg' });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));

    toast.add({ title: 'EXIF data removed' });
  };

  const handleDownload = () => {
    if (!fileData) return;

    const blob = new Blob([fileData], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cleaned_${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.add({ title: 'File downloaded' });
  };

  const handleClear = () => {
    setFileData(null);
    setFileName('');
    setExifInfo(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  const infoFields: { label: string; value: string }[] = [];
  if (exifInfo?.hasExif) {
    infoFields.push({ label: 'APP1 Offset', value: `${exifInfo.app1Offset}` });
    infoFields.push({ label: 'APP1 Size', value: `${exifInfo.app1Length} bytes` });
    if (exifInfo.make) infoFields.push({ label: 'Make', value: exifInfo.make });
    if (exifInfo.model) infoFields.push({ label: 'Model', value: exifInfo.model });
    if (exifInfo.dateTime) infoFields.push({ label: 'Date/Time', value: exifInfo.dateTime });
    if (exifInfo.software) infoFields.push({ label: 'Software', value: exifInfo.software });
    if (exifInfo.orientation) infoFields.push({ label: 'Orientation', value: `${exifInfo.orientation}` });
    if (exifInfo.imageWidth && exifInfo.imageHeight) {
      infoFields.push({ label: 'Dimensions', value: `${exifInfo.imageWidth} x ${exifInfo.imageHeight}` });
    }
  }

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">EXIF Editor</h1>
            <p className="text-muted-foreground">
              Upload a JPEG file to view and remove EXIF metadata.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload JPEG</CardTitle>
              <CardDescription>Select a JPEG image to inspect its EXIF data.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  {fileName || 'Upload a JPEG file'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,image/jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {fileData && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      EXIF Info {exifInfo?.hasExif ? `(${infoFields.length} fields)` : '(None)'}
                    </CardTitle>
                    <div className="flex gap-2">
                      {exifInfo?.hasExif && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveExif}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove EXIF
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!exifInfo?.hasExif ? (
                    <p className="text-sm text-muted-foreground">No EXIF data found in this file.</p>
                  ) : (
                    <div className="space-y-1 max-h-[500px] overflow-y-auto">
                      {infoFields.map((field, i) => (
                        <div key={`${field.label}-${i}`} className="flex gap-2 p-2 rounded-md bg-muted text-sm">
                          <span className="font-medium min-w-[120px] shrink-0">{field.label}</span>
                          <span className="text-muted-foreground font-mono break-all">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Preview</CardTitle>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleClear}>
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="JPEG Preview"
                      className="max-w-full max-h-[400px] object-contain rounded-md mx-auto"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
