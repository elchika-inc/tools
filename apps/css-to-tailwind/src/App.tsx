import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, ArrowRight, Trash2, Check, AlertCircle } from 'lucide-react';
import { convert, type ConvertOutput } from '@/utils/cssToTailwind';
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
            <h1 className="text-3xl font-bold tracking-tight">CSS to Tailwind</h1>
            <p className="text-muted-foreground">
              Convert CSS properties to their closest Tailwind CSS utility classes.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input CSS</CardTitle>
              <CardDescription>
                Enter CSS declarations. You can include selectors and braces, or just property: value pairs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder={`.element {\n  display: flex;\n  align-items: center;\n  padding: 1rem;\n  background-color: #3b82f6;\n  border-radius: 0.5rem;\n  color: #ffffff;\n  font-weight: 700;\n}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="CSS Input"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tailwind Classes</CardTitle>
                      <CardDescription>
                        {result.results.filter((r) => r.exact).length} exact matches,{' '}
                        {result.results.filter((r) => !r.exact).length} approximate
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.classes)}
                      disabled={!result.classes}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy Classes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.classes ? (
                    <div className="rounded-md bg-muted p-4">
                      <code className="text-sm font-mono break-all">{result.classes}</code>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No matching Tailwind classes found.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.results.map((r, i) => (
                      <div
                        key={`${r.property}-${i}`}
                        className={`flex items-start gap-3 p-3 rounded-md ${
                          r.exact ? 'bg-muted' : 'bg-yellow-50 border border-yellow-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 mt-0.5">
                          {r.exact ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-sm font-mono text-muted-foreground">
                              {r.property}: {r.value}
                            </code>
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <code className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {r.tailwindClass}
                            </code>
                            {!r.exact && (
                              <span className="text-xs text-yellow-600">(approximate)</span>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(r.tailwindClass)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
