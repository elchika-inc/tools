import { Download, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadDataUrl, generateIcon, ICON_SIZES } from '@/utils/appIcon';
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [icons, setIcons] = useState<{ size: number; label: string; dataUrl: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setIcons(
        ICON_SIZES.map((s) => ({
          size: s.size,
          label: s.label,
          dataUrl: generateIcon(img, s.size),
        }))
      );
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
            <h1 className="text-3xl font-bold tracking-tight">App Icon Generator</h1>
            <p className="text-muted-foreground">
              画像からアプリアイコン(各プラットフォーム用サイズ)を生成します。
            </p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Generator</CardTitle>
                <CardDescription>正方形の画像をアップロードしてください。</CardDescription>
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
                {icons.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {icons.map((icon) => (
                      <div key={icon.label} className="text-center space-y-1 p-2 border rounded">
                        <img
                          src={icon.dataUrl}
                          alt={icon.label}
                          className="mx-auto border rounded"
                          style={{ width: Math.min(icon.size, 64), height: Math.min(icon.size, 64) }}
                        />
                        <div className="text-xs text-muted-foreground">{icon.label}</div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => downloadDataUrl(icon.dataUrl, `icon-${icon.size}.png`)}
                        >
                          <Download className="h-3 w-3 mr-1" /> DL
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
