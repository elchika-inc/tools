import { Coins } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { type CoinResult, flipCoins } from "@/utils/coinFlip";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<CoinResult | null>(null);

  const flip = useCallback(() => {
    setResult(flipCoins(count));
  }, [count]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Coin Flip</h1>
            <p className="text-muted-foreground">コイン投げシミュレーションです。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Flipper</CardTitle>
                <CardDescription>回数を選んでFlipしてください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="count">回数</Label>
                    <input
                      id="count"
                      type="number"
                      min={1}
                      max={1000}
                      value={count}
                      onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
                      className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <Button type="button" onClick={flip} size="lg">
                    <Coins className="mr-2 h-5 w-5" /> Flip!
                  </Button>
                </div>

                {result && (
                  <div className="space-y-4 pt-4 border-t">
                    {result.flips.length <= 20 && (
                      <div className="flex flex-wrap gap-2">
                        {result.flips.map((f, i) => {
                          const key = `${i}-${f}`;
                          return (
                            <div
                              key={key}
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 ${f === "heads" ? "bg-yellow-100 border-yellow-500 text-yellow-700" : "bg-gray-100 border-gray-400 text-gray-700"}`}
                            >
                              {f === "heads" ? "H" : "T"}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-950 text-center">
                        <div className="text-3xl font-bold">{result.headsCount}</div>
                        <div className="text-sm">Heads ({result.headsPercent.toFixed(1)}%)</div>
                      </div>
                      <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 text-center">
                        <div className="text-3xl font-bold">{result.tailsCount}</div>
                        <div className="text-sm">Tails ({result.tailsPercent.toFixed(1)}%)</div>
                      </div>
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
