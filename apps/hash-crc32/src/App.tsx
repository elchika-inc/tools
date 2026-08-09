import { Copy, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { crc32 } from "@/utils/crc32";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!input) {
      setHash("");
      setError("");
      return;
    }
    crc32(input)
      .then((h) => {
        setHash(h);
        setError("");
      })
      .catch((e) => setError(String(e)));
  }, [input]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.add({ title: "Copied to clipboard" });
    } catch {
      toast.add({ title: "コピーに失敗しました", type: "error" });
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
            <h1 className="text-3xl font-bold tracking-tight">CRC32 Checksum</h1>
            <p className="text-muted-foreground">テキストのCRC32チェックサムを計算します。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" /> Calculator
                </CardTitle>
                <CardDescription>
                  テキストを入力するとリアルタイムでCRC32が計算されます。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    placeholder="テキストを入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                {hash && (
                  <div className="space-y-2">
                    <Label>CRC32</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono">
                        {hash}
                      </code>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={copyToClipboard}
                        aria-label="Copy CRC32 checksum to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
