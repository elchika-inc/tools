import { Copy, Minimize2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type CssMinifyOptions, DEFAULT_OPTIONS, getStats, minifyCss } from '@/utils/cssMinifier';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<CssMinifyOptions>(DEFAULT_OPTIONS);
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);
  const handleMinify = () => {
    try {
      const minified = minifyCss(input, options);
      setOutput(minified);
      setStats(getStats(input, minified));
      toast.add({ title: 'Minified successfully' });
    } catch {
      toast.add({
        title: 'Minification failed',
        type: "error",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({
        title: 'Copy failed',
        type: "error",
      });
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setStats(null);
  };

  const toggleOption = (key: keyof CssMinifyOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">CSS Minifier</h1>
            <p className="text-muted-foreground">
              Minify and optimize your CSS code with configurable options.
            </p>
          </header>

          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription>Select which optimizations to apply.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.removeComments}
                      onChange={() => toggleOption('removeComments')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Remove Comments</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.removeWhitespace}
                      onChange={() => toggleOption('removeWhitespace')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Remove Whitespace</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.shortenColors}
                      onChange={() => toggleOption('shortenColors')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Shorten Colors</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.removeLastSemicolon}
                      onChange={() => toggleOption('removeLastSemicolon')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Remove Last Semicolon</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minifier</CardTitle>
                <CardDescription>Paste your CSS below and click Minify.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-start">
                  <div className="space-y-2">
                    <Label htmlFor="input">Input CSS</Label>
                    <textarea
                      id="input"
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Paste your CSS here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-4 justify-center pt-10">
                    <Button type="button" onClick={handleMinify} disabled={!input}>
                      <Minimize2 className="mr-2 h-4 w-4" /> Minify
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="output">Minified CSS</Label>
                    <textarea
                      id="output"
                      readOnly
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Minified result will appear here..."
                      value={output}
                    />
                  </div>
                </div>

                {stats && (
                  <div className="flex gap-6 text-sm text-muted-foreground pt-2">
                    <span>
                      Original: <strong>{stats.original}</strong> bytes
                    </span>
                    <span>
                      Minified: <strong>{stats.minified}</strong> bytes
                    </span>
                    <span>
                      Saved: <strong>{stats.saved}</strong> bytes (<strong>{stats.percent}%</strong>)
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={clearAll}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!output}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
