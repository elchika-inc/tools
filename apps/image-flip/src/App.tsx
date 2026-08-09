import { Download, FlipHorizontal, FlipVertical, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type FlipDirection, flipImageOnCanvas } from "@/utils/imageFlip";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [src, setSrc] = useState("");
  const [result, setResult] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSrc(reader.result);
        setResult("");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const flip = useCallback(
    (direction: FlipDirection) => {
      if (!imgRef.current) return;
      const flipped = flipImageOnCanvas(imgRef.current, direction);
      if (flipped) setResult(flipped);
      else toast.add({ title: "反転に失敗しました", type: "error" });
    },
    [toast],
  );

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "flipped.png";
    a.click();
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Image Flip</h1>
            <p className="text-muted-foreground">画像を水平/垂直に反転します。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Flip</CardTitle>
                <CardDescription>画像をアップロードして反転方向を選択してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors"
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">画像をクリックして選択</p>
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

                {src && (
                  <>
                    <div className="flex gap-2 justify-center">
                      <Button type="button" onClick={() => flip("horizontal")}>
                        <FlipHorizontal className="mr-2 h-4 w-4" /> 水平反転
                      </Button>
                      <Button type="button" onClick={() => flip("vertical")}>
                        <FlipVertical className="mr-2 h-4 w-4" /> 垂直反転
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => flip("both")}>
                        両方
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Original</div>
                        <img
                          ref={imgRef}
                          src={src}
                          alt="Original"
                          className="max-h-64 mx-auto rounded border"
                        />
                      </div>
                      {result && (
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Flipped</div>
                          <img
                            src={result}
                            alt="Flipped"
                            className="max-h-64 mx-auto rounded border"
                          />
                        </div>
                      )}
                    </div>
                    {result && (
                      <div className="flex justify-center">
                        <Button type="button" onClick={download}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
