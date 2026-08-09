import { Copy, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { affineDecrypt, affineEncrypt, isValidA, VALID_A_VALUES } from "@/utils/affine";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const [a, setA] = useState(5);
  const [b, setB] = useState(8);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encrypt" ? affineEncrypt(input, a, b) : affineDecrypt(input, a, b);
  }, [input, a, b, mode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: "Copied" });
    } catch {
      toast.add({ title: "コピーに失敗しました", type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Affine Cipher</h1>
            <p className="text-muted-foreground">
              アフィン暗号(E(x) = (ax + b) mod 26)のエンコード/デコードを行います。
            </p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Cipher</CardTitle>
                <CardDescription>テキストとパラメータ a, b を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4 flex-wrap">
                  <div className="space-y-1">
                    <Label htmlFor="param-a">a (gcd(a,26)=1)</Label>
                    <select
                      id="param-a"
                      aria-label="Parameter a"
                      value={a}
                      onChange={(e) => setA(Number(e.target.value))}
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {VALID_A_VALUES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="param-b">b</Label>
                    <input
                      id="param-b"
                      type="number"
                      min={0}
                      max={25}
                      value={b}
                      onChange={(e) => setB(Number(e.target.value))}
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                {!isValidA(a) && (
                  <div role="alert" className="text-sm text-red-500">a must be coprime with 26</div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cipher-input">Input</Label>
                    <textarea
                      id="cipher-input"
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cipher-output">Output</Label>
                    <textarea
                      id="cipher-output"
                      readOnly
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
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
