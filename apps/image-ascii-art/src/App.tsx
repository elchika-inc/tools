import { Copy, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { imageToAscii } from '@/utils/asciiArt';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [ascii, setAscii] = useState('');
  const [width, setWidth] = useState(80);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setAscii(imageToAscii(img, width));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [width]
  );

  const copyAscii = async () => {
    try {
      await navigator.clipboard.writeText(ascii);
      toast.add({ title: 'Copied' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">ASCII Art Converter</h1>
            <p className="text-muted-foreground">画像をアスキーアートに変換します。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>画像をアップロードしてください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="space-y-1">
                    <Label>Width: {width} chars</Label>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-48"
                      aria-label={`Width: ${width} chars`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">画像を選択</p>
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
                </div>
                {ascii && (
                  <div className="space-y-2">
                    <pre className="bg-muted rounded p-2 text-[4px] leading-[4px] font-mono overflow-auto max-h-[500px] whitespace-pre">
                      {ascii}
                    </pre>
                    <Button type="button" onClick={copyAscii}>
                      <Copy className="mr-2 h-4 w-4" /> Copy ASCII
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
