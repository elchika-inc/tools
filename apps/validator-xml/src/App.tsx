import { CheckCircle, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { validateXML } from '@/utils/xmlValidator';
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => validateXML(input), [input]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">XML Validator</h1>
            <p className="text-muted-foreground">XMLの構文チェックを行います。</p>
          </header>
          <main>
          <Card>
            <CardHeader>
              <CardTitle>Validator</CardTitle>
              <CardDescription>XMLを入力するとリアルタイムで検証されます。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {input.trim() && (
                <div aria-live="polite" className="flex items-center gap-2 text-sm">
                  {result.valid ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-success-foreground">Valid XML</span>
                    </>
                  ) : result.error ? (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-destructive">Invalid XML</span>
                    </>
                  ) : null}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="xml-input">Input</Label>
                  <textarea
                    id="xml-input"
                    className="flex min-h-[350px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    placeholder='<?xml version="1.0"?><root>...</root>'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Result</Label>
                  {result.error ? (
                    <div role="alert" className="min-h-[350px] rounded-md border border-destructive bg-destructive-subtle dark:bg-destructive-subtle p-3 text-sm text-destructive font-mono whitespace-pre-wrap">
                      {result.error}
                    </div>
                  ) : (
                    <textarea
                      readOnly
                      className="flex min-h-[350px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono resize-none"
                      value={result.formatted}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
