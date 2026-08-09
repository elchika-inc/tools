import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { jsonToTable } from '@/utils/jsonToTable';
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => jsonToTable(input), [input]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">JSON to Table</h1>
            <p className="text-muted-foreground">JSONデータをテーブル形式で表示します。</p>
          </header>
          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>JSON配列を入力してください。</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="json-input">JSON Input</Label>
                <textarea
                  id="json-input"
                  aria-label="JSON array input"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none mt-2"
                  placeholder={'[{"name":"Alice","age":30},{"name":"Bob","age":25}]'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </CardContent>
            </Card>

            {result.error && (
              <div role="alert" className="text-sm text-destructive bg-destructive-subtle dark:bg-destructive-subtle rounded p-2">
                {result.error}
              </div>
            )}

            {result.headers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Table ({result.rows.length} rows)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          {result.headers.map((h) => (
                            <th key={h} className="text-left py-2 px-3 font-medium">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, ri) => {
                          const rowKey = row.join('-') || String(ri);
                          return (
                            <tr key={rowKey} className="border-b hover:bg-muted/30">
                              {row.map((cell, ci) => {
                                const cellKey = `${rowKey}-${result.headers[ci]}`;
                                return (
                                  <td key={cellKey} className="py-1.5 px-3 font-mono">
                                    {cell}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
