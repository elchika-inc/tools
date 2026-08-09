import { Copy, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { vigenereDecrypt, vigenereEncrypt } from "@/utils/vigenere";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const output = useMemo(() => {
    if (!input || !key) return "";
    return mode === "encrypt" ? vigenereEncrypt(input, key) : vigenereDecrypt(input, key);
  }, [input, key, mode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: "Copied to clipboard" });
    } catch {
      toast.add({ title: "コピーに失敗しました", type: "error" });
    }
  };

  const cls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Vigenere Cipher</h1>
            <p className="text-muted-foreground">ヴィジュネル暗号のエンコード/デコードを行います。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Cipher</CardTitle>
                <CardDescription>テキストとキーワードを入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="key">Key</Label>
                    <input
                      id="key"
                      type="text"
                      value={key}
                      onChange={(e) => setKey(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                      placeholder="SECRET"
                      className={cls}
                    />
                  </div>
                  <div className="flex gap-2">
                    {(["encrypt", "decrypt"] as const).map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-md text-sm transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "hover:bg-muted border"}`}
                      >
                        {m === "encrypt" ? "Encrypt" : "Decrypt"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="input">Input</Label>
                    <textarea
                      id="input"
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                      placeholder="Enter text..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="output">Output</Label>
                    <textarea
                      id="output"
                      readOnly
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                      value={output}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setInput("")}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!output}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
