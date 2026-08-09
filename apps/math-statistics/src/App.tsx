import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateStats, parseNumbers } from "@/utils/statistics";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const numbers = useMemo(() => parseNumbers(input), [input]);
  const stats = useMemo(() => calculateStats(numbers), [numbers]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Statistics Calculator</h1>
            <p className="text-muted-foreground">数値データの基本統計量を計算します。</p>
          </header>
          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>
                  数値をカンマ/スペース/改行で区切って入力してください。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                  placeholder="1, 2, 3, 4, 5..."
                  aria-label="数値データ入力"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {numbers.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {numbers.length} 個の数値を検出
                  </div>
                )}
              </CardContent>
            </Card>

            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "個数", value: stats.count },
                      { label: "合計", value: stats.sum.toFixed(4) },
                      { label: "平均", value: stats.mean.toFixed(4) },
                      { label: "中央値", value: stats.median.toFixed(4) },
                      {
                        label: "最頻値",
                        value: stats.mode.length > 0 ? stats.mode.join(", ") : "なし",
                      },
                      { label: "最小値", value: stats.min },
                      { label: "最大値", value: stats.max },
                      { label: "範囲", value: stats.range.toFixed(4) },
                      { label: "分散", value: stats.variance.toFixed(4) },
                      { label: "標準偏差", value: stats.stdDev.toFixed(4) },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-md bg-muted">
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className="text-lg font-bold font-mono">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
