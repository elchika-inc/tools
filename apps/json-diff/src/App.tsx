import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { compareJSON } from '@/utils/jsonDiff';
import { ToastToaster } from "@/components/ui/toast";

const TYPE_COLORS = {
  added: 'text-green-600 bg-green-50 dark:bg-green-950',
  removed: 'text-red-600 bg-red-50 dark:bg-red-950',
  changed: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
};
const TYPE_LABELS = { added: '+', removed: '-', changed: '~' };

export default function App() {
  const [jsonA, setJsonA] = useState('');
  const [jsonB, setJsonB] = useState('');
  const result = useMemo(() => compareJSON(jsonA, jsonB), [jsonA, jsonB]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">JSON Diff</h1>
            <p className="text-muted-foreground">2つのJSONの差分を比較します。</p>
          </header>
          <main className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">JSON A</CardTitle>
                </CardHeader>
                <CardContent>
                  <label htmlFor="json-a" className="sr-only">
                    JSON A Input
                  </label>
                  <textarea
                    id="json-a"
                    aria-label="JSON A Input"
                    className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder='{"key": "value"}'
                    value={jsonA}
                    onChange={(e) => setJsonA(e.target.value)}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">JSON B</CardTitle>
                </CardHeader>
                <CardContent>
                  <label htmlFor="json-b" className="sr-only">
                    JSON B Input
                  </label>
                  <textarea
                    id="json-b"
                    aria-label="JSON B Input"
                    className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder='{"key": "new value"}'
                    value={jsonB}
                    onChange={(e) => setJsonB(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            {result.error && (
              <div role="alert" className="text-sm text-destructive bg-destructive-subtle dark:bg-destructive-subtle rounded p-2">
                {result.error}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Differences ({result.diffs.length})</CardTitle>
                <CardDescription>構造的な差分を表示します。</CardDescription>
              </CardHeader>
              <CardContent>
                {result.diffs.length > 0 ? (
                  <div className="space-y-1">
                    {result.diffs.map((d) => (
                      <div
                        key={d.path}
                        className={`p-2 rounded text-sm font-mono ${TYPE_COLORS[d.type]}`}
                      >
                        <span className="font-bold">
                          {TYPE_LABELS[d.type]} {d.path}
                        </span>
                        {d.type === 'changed' && (
                          <span>
                            : {JSON.stringify(d.oldValue)} → {JSON.stringify(d.newValue)}
                          </span>
                        )}
                        {d.type === 'added' && <span>: {JSON.stringify(d.newValue)}</span>}
                        {d.type === 'removed' && <span>: {JSON.stringify(d.oldValue)}</span>}
                      </div>
                    ))}
                  </div>
                ) : jsonA.trim() && jsonB.trim() && !result.error ? (
                  <div className="text-green-600 text-sm">差分なし - JSONは同一です</div>
                ) : (
                  <div className="text-muted-foreground text-sm">両方のJSONを入力してください</div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
