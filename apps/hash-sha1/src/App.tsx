import { Copy, Hash } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { generateSHA1 } from "@/utils/sha1";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const handleHash = useCallback(async () => {
    try {
      setOutput(await generateSHA1(input));
    } catch {
      toast.add({ title: "ハッシュ生成に失敗しました", type: "error" });
    }
  }, [input, toast]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
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
            <h1 className="text-3xl font-bold tracking-tight">SHA-1 Hash Generator</h1>
            <p className="text-muted-foreground">テキストのSHA-1ハッシュを生成します。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" /> Generator
                </CardTitle>
                <CardDescription>テキストを入力してHashボタンを押してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="ハッシュ化するテキストを入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <Button onClick={handleHash} disabled={!input} className="w-full" type="button">
                  <Hash className="mr-2 h-4 w-4" /> Generate Hash
                </Button>
                {output && (
                  <div className="space-y-2">
                    <Label>SHA-1 Hash</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono break-all">
                        {output}
                      </code>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={copyToClipboard}
                        aria-label="Copy SHA-1 hash to clipboard"
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
