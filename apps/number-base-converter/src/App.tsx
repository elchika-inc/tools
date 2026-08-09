import { Copy, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { COMMON_BASES, convertBase } from "@/utils/baseConverter";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  const output = useMemo(() => {
    if (!input) return "";
    try {
      return convertBase(input, fromBase, toBase);
    } catch {
      return "";
    }
  }, [input, fromBase, toBase]);

  const allBases = useMemo(() => {
    if (!input) return [];
    try {
      return [2, 8, 10, 16].map((base) => ({
        base,
        value: convertBase(input, fromBase, base),
      }));
    } catch {
      return [];
    }
  }, [input, fromBase]);

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
            <h1 className="text-3xl font-bold tracking-tight">Number Base Converter</h1>
            <p className="text-muted-foreground">2進から36進まで任意の基数間で数値を変換します。</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>数値と基数を入力するとリアルタイムで変換されます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fromBase">変換元 基数</Label>
                    <select
                      id="fromBase"
                      value={fromBase}
                      onChange={(e) => setFromBase(Number(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    >
                      {COMMON_BASES.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toBase">変換先 基数</Label>
                    <select
                      id="toBase"
                      value={toBase}
                      onChange={(e) => setToBase(Number(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    >
                      {COMMON_BASES.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <input
                    id="input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="数値を入力..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Output</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono break-all min-h-[40px]">
                      {output || " "}
                    </code>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={copyToClipboard}
                      disabled={!output}
                      aria-label="結果をコピー"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {allBases.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>全基数表示</Label>
                    <div className="grid gap-2">
                      {allBases.map((item) => (
                        <div key={item.base} className="flex items-center gap-2 text-sm">
                          <span className="w-20 text-muted-foreground">Base {item.base}:</span>
                          <code className="font-mono break-all">{item.value}</code>
                        </div>
                      ))}
                    </div>
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
