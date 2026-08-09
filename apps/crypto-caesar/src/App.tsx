import { Copy, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { bruteForce, caesarDecrypt, caesarEncrypt } from "@/utils/caesar";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<"encrypt" | "decrypt" | "bruteforce">("encrypt");
  const output = useMemo(() => {
    if (!input) return "";
    try {
      if (mode === "encrypt") return caesarEncrypt(input, shift);
      if (mode === "decrypt") return caesarDecrypt(input, shift);
      return "";
    } catch {
      return "";
    }
  }, [input, shift, mode]);

  const bruteResults = useMemo(() => {
    if (mode !== "bruteforce" || !input) return [];
    return bruteForce(input);
  }, [input, mode]);

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
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Caesar Cipher</h1>
            <p className="text-muted-foreground">シーザー暗号のエンコード/デコードを行います。</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Cipher</CardTitle>
                <CardDescription>テキストとシフト数を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shift">Shift: {shift}</Label>
                    <input
                      id="shift"
                      type="range"
                      min={1}
                      max={25}
                      value={shift}
                      onChange={(e) => setShift(Number(e.target.value))}
                      className="w-48"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(["encrypt", "decrypt", "bruteforce"] as const).map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${
                          mode === m ? "bg-primary text-primary-foreground" : "hover:bg-muted border"
                        }`}
                      >
                        {m === "encrypt" ? "Encrypt" : m === "decrypt" ? "Decrypt" : "Brute Force"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Enter text..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>

                {mode !== "bruteforce" && (
                  <div className="space-y-2">
                    <Label>Output</Label>
                    <div className="flex items-start gap-2">
                      <textarea
                        readOnly
                        className="flex min-h-[150px] flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono resize-none"
                        value={output}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={copyToClipboard}
                        disabled={!output}
                        aria-label="Copy output to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {mode === "bruteforce" && bruteResults.length > 0 && (
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    <Label>All 26 Shifts</Label>
                    {bruteResults.map((r) => (
                      <div
                        key={r.shift}
                        className="flex items-center gap-2 text-sm font-mono p-1 rounded hover:bg-muted"
                      >
                        <span className="w-16 text-muted-foreground">shift {r.shift}:</span>
                        <span className="flex-1 truncate">{r.result}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setInput("")}>
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
