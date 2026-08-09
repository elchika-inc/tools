import { CheckCircle, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { validateJSON } from '@/utils/jsonValidator';
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => validateJSON(input), [input]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">JSON Validator</h1>
            <p className="text-muted-foreground">JSONの構文チェックを行います。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Validator</CardTitle>
                <CardDescription>JSONを入力するとリアルタイムで検証されます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {input.trim() && (
                  <div className="flex items-center gap-2 text-sm" aria-live="polite">
                    {result.valid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                        <span className="text-green-600 font-medium">Valid JSON</span>
                      </>
                    ) : result.error ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        <span className="text-red-600">{result.error}</span>
                        {result.errorLine && (
                          <span className="text-muted-foreground">
                            (line {result.errorLine}, col {result.errorColumn})
                          </span>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="input">Input</Label>
                    <textarea
                      id="input"
                      className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder='{"key": "value"}'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formatted">Formatted</Label>
                    <textarea
                      id="formatted"
                      readOnly
                      aria-label="Formatted JSON output"
                      className="flex min-h-[400px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      value={result.formatted}
                    />
                  </div>
                </div>
                {result.stats && (
                  <div className="flex gap-4 text-sm text-muted-foreground pt-4 border-t">
                    <span>Keys: {result.stats.keys}</span>
                    <span>Depth: {result.stats.depth}</span>
                    <span>Objects: {result.stats.objects}</span>
                    <span>Arrays: {result.stats.arrays}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
