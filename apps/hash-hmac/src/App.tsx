import { Copy, Hash } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ALGORITHMS, generateHMAC, type HmacAlgorithm } from "@/utils/hmac";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>("SHA-256");
  const [output, setOutput] = useState("");
  const generate = useCallback(async () => {
    try {
      setOutput(await generateHMAC(message, secret, algorithm));
    } catch {
      toast.add({ title: "HMAC生成に失敗しました", type: "error" });
    }
  }, [message, secret, algorithm, toast]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: "Copied" });
    } catch {
      toast.add({ title: "コピーに失敗しました", type: "error" });
    }
  };

  const cls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">HMAC Generator</h1>
            <p className="text-muted-foreground">HMACを生成します。Web Crypto API使用。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" /> Generator
                </CardTitle>
                <CardDescription>メッセージとシークレットキーを入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret Key</Label>
                  <input
                    id="secret"
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="secret"
                    className={`${cls} font-mono`}
                  />
                </div>
                <div className="flex gap-2">
                  {ALGORITHMS.map((a) => (
                    <button
                      type="button"
                      key={a.value}
                      onClick={() => setAlgorithm(a.value)}
                      className={`px-3 py-1 rounded text-xs ${algorithm === a.value ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={generate}
                  disabled={!message || !secret}
                  className="w-full"
                  type="button"
                >
                  <Hash className="mr-2 h-4 w-4" /> Generate HMAC
                </Button>
                {output && (
                  <div className="space-y-2">
                    <Label>Output</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono break-all">
                        {output}
                      </code>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={copyToClipboard}
                        aria-label="Copy HMAC to clipboard"
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
