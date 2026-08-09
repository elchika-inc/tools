import { Copy, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DEFAULT_OPTIONS, generateRandomNumbers, type RandomOptions } from "@/utils/randomNumber";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [options, setOptions] = useState<RandomOptions>(DEFAULT_OPTIONS);
  const [results, setResults] = useState<number[]>([]);
  const generate = useCallback(() => {
    const nums = generateRandomNumbers(options);
    if (nums.length === 0) {
      toast.add({
        title: "生成できません",
        description: "設定を確認してください",
        type: "error",
      });
      return;
    }
    setResults(nums);
  }, [options, toast]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(results.join("\n"));
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
            <h1 className="text-3xl font-bold tracking-tight">Random Number Generator</h1>
            <p className="text-muted-foreground">指定範囲の乱数を生成します。</p>
          </header>

          <main>
            <div className="grid gap-4 md:grid-cols-[280px,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="min">最小値</Label>
                      <input
                        id="min"
                        type="number"
                        value={options.min}
                        onChange={(e) => setOptions((p) => ({ ...p, min: Number(e.target.value) }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="max">最大値</Label>
                      <input
                        id="max"
                        type="number"
                        value={options.max}
                        onChange={(e) => setOptions((p) => ({ ...p, max: Number(e.target.value) }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="count">生成数</Label>
                    <input
                      id="count"
                      type="number"
                      min={1}
                      max={1000}
                      value={options.count}
                      onChange={(e) =>
                        setOptions((p) => ({ ...p, count: Math.max(1, Number(e.target.value)) }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="float"
                      type="checkbox"
                      checked={options.isFloat}
                      onChange={(e) => setOptions((p) => ({ ...p, isFloat: e.target.checked }))}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="float">小数</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="dup"
                      type="checkbox"
                      checked={options.allowDuplicates}
                      onChange={(e) =>
                        setOptions((p) => ({ ...p, allowDuplicates: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="dup">重複を許可</Label>
                  </div>
                  <Button type="button" onClick={generate} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Generate
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Results ({results.length})</CardTitle>
                  <CardDescription>生成された乱数です。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.length > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto font-mono text-sm grid grid-cols-5 gap-2">
                      {results.map((num, i) => {
                        const key = `${i}-${num}`;
                        return (
                          <div key={key} className="bg-muted rounded px-2 py-1 text-center">
                            {num}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm py-8 text-center">
                      Generateを押してください
                    </div>
                  )}
                  {results.length > 0 && (
                    <div className="flex justify-end pt-4 border-t">
                      <Button type="button" variant="outline" onClick={copyAll}>
                        <Copy className="mr-2 h-4 w-4" /> Copy All
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
