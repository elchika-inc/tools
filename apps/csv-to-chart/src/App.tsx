import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMaxValue, parseCSV } from '@/utils/csvChart';
import { ToastToaster } from "@/components/ui/toast";

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

export default function App() {
  const [input, setInput] = useState('');
  const data = useMemo(() => parseCSV(input), [input]);
  const maxVal = useMemo(() => getMaxValue(data), [data]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CSV to Chart</h1>
            <p className="text-muted-foreground">CSVデータをグラフに変換します。</p>
          </header>

          <main>
          <div className="grid gap-4 md:grid-cols-[300px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSV Input</CardTitle>
                <CardDescription>1行目はヘッダー、1列目はラベル。</CardDescription>
              </CardHeader>
              <CardContent>
                <label htmlFor="csv-input" className="sr-only">CSV Input</label>
                <textarea
                  id="csv-input"
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                  placeholder={'Month,Sales,Profit\nJan,100,30\nFeb,150,45\nMar,200,60'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chart</CardTitle>
              </CardHeader>
              <CardContent>
                {data.labels.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      {data.datasets.map((ds, i) => (
                        <div key={ds.label} className="flex items-center gap-1 text-xs">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          {ds.label}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {data.labels.map((label) => {
                        const li = data.labels.indexOf(label);
                        return (
                          <div key={`row-${label}`} className="flex items-center gap-2">
                            <span className="w-16 text-xs text-muted-foreground truncate text-right">
                              {label}
                            </span>
                            <div className="flex-1 flex gap-1">
                              {data.datasets.map((ds, di) => (
                                <div
                                  key={`bar-${ds.label}-${li}`}
                                  className="h-6 rounded text-xs flex items-center px-1 text-white font-mono"
                                  style={{
                                    width: `${Math.max(1, (ds.values[li] / maxVal) * 100)}%`,
                                    backgroundColor: COLORS[di % COLORS.length],
                                  }}
                                >
                                  {ds.values[li]}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm py-16 text-center">
                    CSVを入力するとチャートが表示されます
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
