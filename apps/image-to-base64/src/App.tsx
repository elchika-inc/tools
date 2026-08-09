import { Copy, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { fileToBase64, formatDataUri } from '@/utils/imageToBase64';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [result, setResult] = useState<{
    base64Only: string;
    dataUri: string;
    mimeType: string;
    sizeKB: number;
  } | null>(null);
  const [preview, setPreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(
    async (file: File) => {
      try {
        const dataUri = await fileToBase64(file);
        const formatted = formatDataUri(dataUri);
        setResult(formatted);
        setPreview(dataUri);
      } catch {
        toast.add({ title: '読み込みに失敗しました', type: "error" });
      }
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
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
            <h1 className="text-3xl font-bold tracking-tight">Image to Base64</h1>
            <p className="text-muted-foreground">画像をBase64文字列に変換します。</p>
          </header>

          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload</CardTitle>
                <CardDescription>画像をドロップまたはクリックして選択してください。</CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  type="button"
                  className="w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => fileRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">ドラッグ&ドロップ または クリック</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="画像ファイルを選択"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFile(e.target.files[0]);
                    }}
                  />
                </button>
              </CardContent>
            </Card>

            {result && (
              <>
                {preview && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img src={preview} alt="アップロード画像プレビュー" className="max-h-48 rounded border" />
                      <div className="text-xs text-muted-foreground mt-2">
                        {result.mimeType} / {result.sizeKB} KB
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Output</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Data URI', value: result.dataUri },
                      { label: 'Base64 Only', value: result.base64Only },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">{item.label}</Label>
                          <Button type="button" size="sm" variant="ghost" onClick={() => copyValue(item.value)}>
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <textarea
                          readOnly
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-xs font-mono resize-none"
                          value={item.value}
                          aria-label={item.label}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
