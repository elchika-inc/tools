import { Download, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadDataUrl, generateAllSizes } from '@/utils/favicon';
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [favicons, setFavicons] = useState<{ size: number; dataUrl: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setFavicons(generateAllSizes(img));
      URL.revokeObjectURL(url);
    };
    img.src = url;
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
            <h1 className="text-3xl font-bold tracking-tight">Favicon Generator</h1>
            <p className="text-muted-foreground">画像からファビコン(各サイズPNG)を生成します。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Generator</CardTitle>
                <CardDescription>画像をアップロードしてください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors"
                >
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">画像を選択</p>
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
                {favicons.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {favicons.map((f) => (
                      <div key={f.size} className="text-center space-y-1">
                        <img
                          src={f.dataUrl}
                          alt={`favicon ${f.size}x${f.size}`}
                          className="mx-auto border rounded"
                          style={{ width: Math.min(f.size, 64), height: Math.min(f.size, 64) }}
                        />
                        <div className="text-xs text-muted-foreground">
                          {f.size}x{f.size}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDataUrl(f.dataUrl, `favicon-${f.size}.png`)}
                          aria-label={`favicon-${f.size}.png をダウンロード`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
