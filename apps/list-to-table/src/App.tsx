import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Download } from 'lucide-react';
import {
  convert,
  detectDelimiter,
  parseList,
  type OutputFormat,
  type Delimiter,
} from '@/utils/listToTable';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE = `Name,Age,City
Alice,30,Tokyo
Bob,25,Osaka
Charlie,35,Nagoya`;

export default function App() {
  const [input, setInput] = useState(SAMPLE);
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [format, setFormat] = useState<OutputFormat>('markdown');
  const [hasHeader, setHasHeader] = useState(true);
  const [autoDetect, setAutoDetect] = useState(true);
  const effectiveDelimiter = autoDetect ? detectDelimiter(input) : delimiter;
  const output = useMemo(
    () => convert(input, effectiveDelimiter, format, hasHeader),
    [input, effectiveDelimiter, format, hasHeader]
  );
  const preview = useMemo(
    () => parseList(input, effectiveDelimiter),
    [input, effectiveDelimiter]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleDownload = () => {
    const ext = format === 'html' ? 'html' : format === 'markdown' ? 'md' : 'csv';
    const blob = new Blob([output], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `table.${ext}`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.add({ title: `Downloaded table.${ext}` });
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
            <h1 className="text-3xl font-bold tracking-tight">List to Table</h1>
            <p className="text-muted-foreground">
              Convert list data to HTML table, Markdown table, or CSV format.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Enter data, one row per line.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  aria-label="Input data"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter data..."
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delimiter</Label>
                    <Select
                      value={autoDetect ? 'auto' : delimiter}
                      onValueChange={(v) => {
                        if (v === 'auto') {
                          setAutoDetect(true);
                        } else {
                          setAutoDetect(false);
                          setDelimiter(v as Delimiter);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value=",">Comma (,)</SelectItem>
                        <SelectItem value="	">Tab</SelectItem>
                        <SelectItem value="|">Pipe (|)</SelectItem>
                        <SelectItem value=";">Semicolon (;)</SelectItem>
                        <SelectItem value=" ">Space</SelectItem>
                      </SelectContent>
                    </Select>
                    {autoDetect && (
                      <p className="text-xs text-muted-foreground">
                        Detected: {effectiveDelimiter === '\t' ? 'Tab' : `"${effectiveDelimiter}"`}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={format} onValueChange={(v) => setFormat(v as OutputFormat)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML Table</SelectItem>
                        <SelectItem value="markdown">Markdown Table</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasHeader}
                    onChange={(e) => setHasHeader(e.target.checked)}
                    className="rounded"
                  />
                  First row is header
                </label>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {preview.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          {hasHeader && preview.length > 0 && (
                            <tr className="border-b bg-muted/50">
                              {preview[0].map((cell, i) => (
                                <th key={i} className="text-left p-2 font-medium">
                                  {cell}
                                </th>
                              ))}
                            </tr>
                          )}
                        </thead>
                        <tbody>
                          {preview.slice(hasHeader ? 1 : 0).map((row, i) => (
                            <tr key={i} className="border-b">
                              {row.map((cell, j) => (
                                <td key={j} className="p-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Output ({format.toUpperCase()})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64">
                    {output}
                  </pre>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleCopy} disabled={!output}>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDownload}
                      disabled={!output}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
