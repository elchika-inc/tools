import { Copy, Minimize2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { MinifyOptions } from '@/utils/htmlMinifier';
import { DEFAULT_OPTIONS, getStats, minifyHtml } from '@/utils/htmlMinifier';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<MinifyOptions>(DEFAULT_OPTIONS);
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);
  const handleMinify = () => {
    try {
      const minified = minifyHtml(input, options);
      setOutput(minified);
      setStats(getStats(input, minified));
      toast.add({ title: 'Minified successfully' });
    } catch {
      toast.add({ title: 'Minification failed', type: "error" });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setStats(null);
  };

  const toggleOption = (key: keyof MinifyOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">HTML Minifier</h1>
            <p className="text-muted-foreground">
              Minify HTML by removing comments, collapsing whitespace, and cleaning attributes.
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
                      checked={options.collapseWhitespace}
                      onChange={() => toggleOption('collapseWhitespace')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Collapse Whitespace</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.removeEmptyAttributes}
                      onChange={() => toggleOption('removeEmptyAttributes')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Remove Empty Attributes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.removeOptionalTags}
                      onChange={() => toggleOption('removeOptionalTags')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Remove Optional Tags</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minifier</CardTitle>
                <CardDescription>Paste your HTML and click Minify.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="input">Input HTML</Label>
                    <textarea
                      id="input"
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono"
                      placeholder="Paste your HTML here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="output">Minified Output</Label>
                    <textarea
                      id="output"
                      readOnly
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono"
                      placeholder="Minified HTML will appear here..."
                      value={output}
                    />
                  </div>
                </div>

                {stats && (
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border rounded-md p-3">
                    <span>
                      Original: <strong className="text-foreground">{stats.original} bytes</strong>
                    </span>
                    <span>
                      Minified: <strong className="text-foreground">{stats.minified} bytes</strong>
                    </span>
                    <span>
                      Saved: <strong className="text-foreground">{stats.saved} bytes</strong> (
                      {stats.percent}%)
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-2 pt-4 border-t">
                  <Button type="button" onClick={handleMinify} disabled={!input}>
                    <Minimize2 className="mr-2 h-4 w-4" /> Minify
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={clearAll}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button type="button" onClick={handleCopy} disabled={!output}>
                      <Copy className="mr-2 h-4 w-4" /> Copy Result
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
