import { Code, Copy, Minimize2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatXml, minifyXml } from '@/utils/xmlFormatter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const handleFormat = () => {
    try {
      const result = formatXml(input);
      setOutput(result);
      toast.add({ title: 'Formatted successfully' });
    } catch {
      toast.add({ title: 'Formatting failed', type: "error" });
    }
  };

  const handleMinify = () => {
    try {
      const result = minifyXml(input);
      setOutput(result);
      toast.add({ title: 'Minified successfully' });
    } catch {
      toast.add({ title: 'Minification failed', type: "error" });
    }
  };

  const copyToClipboard = async () => {
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
            <h1 className="text-3xl font-bold tracking-tight">XML Formatter</h1>
            <p className="text-muted-foreground">Format or minify XML content easily.</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Formatter</CardTitle>
                <CardDescription>Paste XML to format or minify.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-start">
                  <div className="space-y-2">
                    <Label htmlFor="input">Input</Label>
                    <textarea
                      id="input"
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Paste XML here..."
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
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
