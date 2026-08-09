import { Code, Copy, Minimize2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatJs, minifyJs } from '@/utils/jsFormatter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState('2');
  const handleFormat = () => {
    try {
      const result = formatJs(input, Number(indentSize));
      setOutput(result);
      toast.add({ title: 'Formatted successfully' });
    } catch {
      toast.add({ title: 'Format failed', type: "error" });
    }
  };

  const handleMinify = () => {
    try {
      const result = minifyJs(input);
      setOutput(result);
      toast.add({ title: 'Minified successfully' });
    } catch {
      toast.add({ title: 'Minify failed', type: "error" });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
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
            <h1 className="text-3xl font-bold tracking-tight">JS Formatter / Minifier</h1>
            <p className="text-muted-foreground">Format or minify JavaScript / TypeScript code.</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Formatter</CardTitle>
                    <CardDescription>Paste your code and format or minify it.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="indent-size">Indent</Label>
                    <Select value={indentSize} onValueChange={setIndentSize}>
                      <SelectTrigger className="w-[80px]" id="indent-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-start">
                  <div className="space-y-2">
                    <Label htmlFor="input">Input</Label>
                    <textarea
                      id="input"
                      className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Paste your JavaScript / TypeScript code here..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-4 justify-center pt-10">
                    <Button type="button" onClick={handleFormat} disabled={!input}>
                      <Code className="mr-2 h-4 w-4" /> Format
                    </Button>
                    <Button type="button" onClick={handleMinify} variant="secondary" disabled={!input}>
                      <Minimize2 className="mr-2 h-4 w-4" /> Minify
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="output">Output</Label>
                    <textarea
                      id="output"
                      readOnly
                      className="flex min-h-[400px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Result will appear here..."
                      value={output}
                    />
                  </div>
                </div>

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
