import { Download, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { convertImage, FORMATS, type ImageFormat } from "@/utils/imageConvert";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [format, setFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState<{ dataUrl: string; blob: Blob } | null>(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file);
      setPreview(url);
      const img = new Image();
      img.onload = async () => {
        try {
          const r = await convertImage(img, format, quality);
          setResult(r);
        } catch {
          toast.add({ title: "変換に失敗しました", type: "error" });
        }
      };
      img.src = url;
    },
    [format, quality, toast],
  );

  const download = () => {
    if (!result) return;
    const ext = FORMATS.find((f) => f.value === format)?.ext ?? "png";
    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = `converted.${ext}`;
    a.click();
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Image Format Converter</h1>
            <p className="text-muted-foreground">画像フォーマットを変換します(PNG/JPEG/WebP)。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>画像を選択してフォーマットを指定してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4 flex-wrap">
                  <div className="space-y-1">
                    <Label>Output Format</Label>
                    <div className="flex gap-2">
                      {FORMATS.map((f) => (
                        <button
                          type="button"
                          key={f.value}
                          onClick={() => setFormat(f.value)}
                          className={`px-4 py-2 rounded-md text-sm ${format === f.value ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {format !== "image/png" && (
                    <div className="space-y-1">
                      <Label>Quality: {quality}%</Label>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-32"
                        aria-label={`Quality: ${quality}%`}
                      />
                    </div>
                  )}
                </div>
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
                {preview && (
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded border" />
                )}
                {result && (
                  <div className="flex justify-center">
                    <Button type="button" onClick={download}>
                      <Download className="mr-2 h-4 w-4" /> Download{" "}
                      {FORMATS.find((f) => f.value === format)?.label}
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
