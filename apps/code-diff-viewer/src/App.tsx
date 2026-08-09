import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { computeDiff, getDiffStats } from '@/utils/diff';
import { ToastToaster } from "@/components/ui/toast";

const LINE_COLORS = {
  same: '',
  added: 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200',
  removed: 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200',
};
const LINE_PREFIX = { same: ' ', added: '+', removed: '-' };

export default function App() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const diff = useMemo(() => computeDiff(textA, textB), [textA, textB]);
  const stats = useMemo(() => getDiffStats(diff), [diff]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Diff Viewer</h1>
            <p className="text-muted-foreground">2つのテキストの差分を表示します。</p>
          </header>

          <main className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Text A</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    aria-label="Text A - original text"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Original text..."
                    value={textA}
                    onChange={(e) => setTextA(e.target.value)}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Text B</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    aria-label="Text B - modified text"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Modified text..."
                    value={textB}
                    onChange={(e) => setTextB(e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            {(textA || textB) && (
              <Card>
                <CardHeader>
                  <CardTitle>Diff</CardTitle>
                  <CardDescription>
                    <span className="text-green-600">+{stats.added}</span>{' '}
                    <span className="text-red-600">-{stats.removed}</span>{' '}
                    <span className="text-muted-foreground">{stats.same} unchanged</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-mono text-sm border rounded overflow-hidden">
                    {diff.map((line, i) => {
                      const key = `${line.type}-${line.lineA ?? ''}-${line.lineB ?? ''}-${i}`;
                      return (
                        <div key={key} className={`flex ${LINE_COLORS[line.type]}`}>
                          <span className="w-10 text-right px-1 text-xs text-muted-foreground select-none border-r">
                            {line.lineA ?? ''}
                          </span>
                          <span className="w-10 text-right px-1 text-xs text-muted-foreground select-none border-r">
                            {line.lineB ?? ''}
                          </span>
                          <span className="w-6 text-center select-none font-bold">
                            {LINE_PREFIX[line.type]}
                          </span>
                          <span className="flex-1 px-2 whitespace-pre">{line.content}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
