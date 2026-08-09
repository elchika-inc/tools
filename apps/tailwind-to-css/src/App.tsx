import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, ArrowRight, Trash2, Check, X } from 'lucide-react';
import { convert, type ConvertOutput } from '@/utils/tailwindToCss';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const result: ConvertOutput | null = useMemo(() => {
    if (!input.trim()) return null;
    return convert(input);
  }, [input]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Tailwind to CSS</h1>
            <p className="text-muted-foreground">
              Convert Tailwind CSS utility classes to equivalent CSS properties.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Enter Tailwind CSS classes separated by spaces.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                aria-label="Tailwind classes input"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder="e.g., flex items-center p-4 bg-blue-500 rounded-lg text-white font-bold"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInput('')}
                disabled={!input}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear
              </Button>
            </CardContent>
          </Card>

          {result && result.results.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Class Mapping</CardTitle>
                  <CardDescription>
                    {result.results.filter((r) => r.found).length} of {result.results.length} classes
                    converted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.results.map((r, i) => (
                      <div
                        key={`${r.className}-${i}`}
                        className={`flex items-start gap-3 p-3 rounded-md ${
                          r.found ? 'bg-muted' : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 mt-0.5">
                          {r.found ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {r.className}
                            </code>
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <code className="text-sm font-mono text-muted-foreground break-all">
                              {r.css}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Combined CSS</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.combinedCss)}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy CSS
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="rounded-md bg-muted p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                    {result.combinedCss}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
