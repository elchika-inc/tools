import { useMemo, useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { brailleToText, textToBraille } from './utils/braille';
import { toast, ToastToaster } from "@/components/ui/toast";

const MODES = ['toBraille', 'toText'] as const;
type Mode = (typeof MODES)[number];

function App() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('toBraille');
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return mode === 'toBraille' ? textToBraille(input) : brailleToText(input);
    } catch {
      return 'Error: Invalid input';
    }
  }, [input, mode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl">
          <header className="space-y-2 mb-4">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Braille Converter</h1>
            <p className="text-muted-foreground">Convert text to Braille and back.</p>
          </header>
          <main>
          <Card>
            <CardHeader>
              <CardTitle>Braille Converter</CardTitle>
              <CardDescription>Convert text to Braille and back</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mode</Label>
                <div className="flex gap-2">
                  {MODES.map((m) => (
                    <Button
                      type="button"
                      key={m}
                      variant={mode === m ? 'default' : 'outline'}
                      onClick={() => setMode(m)}
                      type="button"
                    >
                      {m === 'toBraille' ? 'Text to Braille' : 'Braille to Text'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="input">Input</Label>
                <textarea
                  id="input"
                  className="w-full rounded-md border p-3 font-mono text-sm"
                  rows={6}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'toBraille' ? 'Enter text...' : 'Enter braille...'}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="output">Output</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!output}
                    type="button"
                  >
                    Copy
                  </Button>
                </div>
                <textarea
                  id="output"
                  className="w-full rounded-md border bg-gray-50 p-3 text-2xl"
                  rows={6}
                  value={output}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}

export default App;
