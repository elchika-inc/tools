import { Dices } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { COMMON_DICE, type DiceResult, rollDice } from "@/utils/dice";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState(2);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [history, setHistory] = useState<DiceResult[]>([]);

  const roll = useCallback(() => {
    const r = rollDice(sides, count);
    setResult(r);
    setHistory((prev) => [r, ...prev].slice(0, 20));
  }, [sides, count]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dice Roller</h1>
            <p className="text-muted-foreground">サイコロを振ってランダムな数値を生成します。</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>面数と個数を選んでRollしてください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label>面数 (d?)</Label>
                    <div className="flex gap-1" role="group" aria-label="面数を選択">
                      {COMMON_DICE.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => setSides(d)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            sides === d
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted border"
                          }`}
                        >
                          d{d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="count">個数</Label>
                    <input
                      id="count"
                      type="number"
                      min={1}
                      max={100}
                      value={count}
                      onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <Button type="button" onClick={roll} size="lg">
                    <Dices className="mr-2 h-5 w-5" /> Roll {count}d{sides}
                  </Button>
                </div>

                {result && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      {result.values.map((v, i) => {
                        const key = `${i}-${v}`;
                        return (
                          <div
                            key={key}
                            className="w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold bg-muted"
                          >
                            {v}
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">合計</span>
                        <div className="text-2xl font-bold">{result.total}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">最小</span>
                        <div className="text-lg font-medium">{result.min}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">最大</span>
                        <div className="text-lg font-medium">{result.max}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">平均</span>
                        <div className="text-lg font-medium">{result.average.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {history.length > 1 && (
                  <div className="space-y-1 pt-4 border-t">
                    <Label className="text-xs text-muted-foreground">履歴</Label>
                    {history.slice(1).map((h, i) => {
                      const key = `hist-${i}-${h.total}`;
                      return (
                        <div key={key} className="text-xs text-muted-foreground">
                          [{h.values.join(", ")}] = {h.total}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
