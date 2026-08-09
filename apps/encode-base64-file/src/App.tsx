import { Copy, Download, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { base64ToBlob, downloadBlob, fileToBase64, formatSize } from "@/utils/base64File";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [base64, setBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [decodeInput, setDecodeInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(
    async (file: File) => {
      try {
        const b64 = await fileToBase64(file);
        setBase64(b64);
        setFileName(file.name);
        setFileSize(file.size);
      } catch {
        toast.add({ title: "読み込みに失敗しました", type: "error" });
      }
    },
    [toast],
  );

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(base64);
      toast.add({ title: "Copied" });
    } catch {
      toast.add({ title: "コピーに失敗しました", type: "error" });
    }
  };

  const handleDecode = () => {
    try {
      const blob = base64ToBlob(decodeInput, "application/octet-stream");
      downloadBlob(blob, "decoded-file");
      toast.add({ title: "Downloaded" });
    } catch {
      toast.add({ title: "デコードに失敗しました", type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Base64 File Encoder/Decoder</h1>
            <p className="text-muted-foreground">ファイルのBase64エンコード/デコードを行います。</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Encode (File to Base64)</CardTitle>
              <CardDescription>ファイルをBase64に変換します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors"
              >
                <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">ファイルを選択</p>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0]);
                  }}
                />
              </button>
              {base64 && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {fileName} ({formatSize(fileSize)}) → Base64 ({formatSize(base64.length)})
                  </div>
                  <textarea
                    readOnly
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-xs font-mono resize-none"
                    value={base64}
                  />
                  <Button type="button" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Base64
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decode (Base64 to File)</CardTitle>
              <CardDescription>Base64をファイルに変換してダウンロードします。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="decode-input">Base64 Input</Label>
                <textarea
                  id="decode-input"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Base64 encoded data..."
                  value={decodeInput}
                  onChange={(e) => setDecodeInput(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleDecode} disabled={!decodeInput.trim()}>
                <Download className="mr-2 h-4 w-4" /> Decode & Download
              </Button>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
