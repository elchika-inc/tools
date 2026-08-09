import { Copy, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { extractColors } from '@/utils/colorExtract';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [colors, setColors] = useState<string[]>([]);
  const [preview, setPreview] = useState('');
  const [count, setCount] = useState(8);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setPreview(url);
      const img = new Image();
      img.onload = () => {
        setColors(extractColors(img, count));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [count]
  );

  const copyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast.add({ title: `${hex} copied` });
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
            <h1 className="text-3xl font-bold tracking-tight">Image Color Extractor</h1>
            <p className="text-muted-foreground">画像から主要な色を抽出します。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Extractor</CardTitle>
                <CardDescription>画像をアップロードして色を抽出します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="space-y-1">
                    <Label>抽出数</Label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                {preview && (
                  <img src={preview} alt="ソース画像プレビュー" className="max-h-48 mx-auto rounded border" />
                )}
                {colors.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="text-xs text-muted-foreground">Extracted Colors</Label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((hex) => (
                        <button
                          type="button"
                          key={hex}
                          onClick={() => copyColor(hex)}
                          className="group relative"
                          aria-label={`色 ${hex} をコピー`}
                        >
                          <div
                            className="w-16 h-16 rounded-lg border"
                            style={{ backgroundColor: hex }}
                          />
                          <div className="text-[10px] font-mono text-center mt-0.5 group-hover:text-primary">
                            {hex}
                          </div>
                        </button>
                      ))}
                    </div>
                    <Button type="button" variant="outline" onClick={() => copyColor(colors.join('\n'))}>
                      <Copy className="mr-2 h-4 w-4" /> Copy All
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
