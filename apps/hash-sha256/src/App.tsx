import { Copy, Hash, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { generateSHA, HASH_ALGORITHM_OPTIONS, type HashAlgorithm } from "@/utils/sha";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [output, setOutput] = useState("");
  const handleHash = useCallback(async () => {
    try {
      const hash = await generateSHA(input, algorithm);
      setOutput(hash);
    } catch {
      toast.add({ title: "ハッシュ生成に失敗しました", type: "error" });
    }
  }, [input, algorithm, toast]);

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
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">SHA Hash Generator</h1>
            <p className="text-muted-foreground">
              SHA-256/384/512ハッシュを生成します。Web Crypto API使用。
            </p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Hash Generator</CardTitle>
                <CardDescription>テキストを入力してハッシュを生成してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {HASH_ALGORITHM_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setAlgorithm(opt.value)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        algorithm === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted border"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

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
                    <Label>Output ({algorithm})</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono break-all">
                        {output}
                      </code>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={copyToClipboard}
                        aria-label="Copy hash to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setInput("");
                      setOutput("");
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
