import { useCallback, useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { formatJson, minifyJson, parseJson, sortJsonKeys } from './utils/jsonEditor';
import { toast, ToastToaster } from "@/components/ui/toast";

function App() {
  const [input, setInput] = useState('{\n  "name": "example",\n  "value": 42\n}');
  const [error, setError] = useState<string | null>(null);
  const validate = useCallback(() => {
    const result = parseJson(input);
    setError(result.error);
    if (!result.error) {
      toast.add({ title: 'Valid JSON!' });
    }
  }, [input, toast]);

  const handleFormat = useCallback(() => {
    try {
      setInput(formatJson(input, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [input]);

  const handleMinify = useCallback(() => {
    try {
      setInput(minifyJson(input));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [input]);

  const handleSort = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const sorted = sortJsonKeys(parsed);
      setInput(JSON.stringify(sorted, null, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }, [input]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
      toast.add({ title: 'Copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-3xl">
          <header className="sr-only">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">JSON Editor</h1>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>JSON Editor</CardTitle>
                <CardDescription>Edit, format, minify, and validate JSON</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={validate} type="button">
                    Validate
                  </Button>
                  <Button onClick={handleFormat} variant="outline" type="button">
                    Format
                  </Button>
                  <Button onClick={handleMinify} variant="outline" type="button">
                    Minify
                  </Button>
                  <Button onClick={handleSort} variant="outline" type="button">
                    Sort Keys
                  </Button>
                  <Button onClick={handleCopy} variant="outline" type="button">
                    Copy
                  </Button>
                </div>
                {error && (
                  <div role="alert" className="rounded-md bg-destructive-subtle p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="editor">JSON</Label>
                  <textarea
                    id="editor"
                    className="w-full rounded-md border p-3 font-mono text-sm"
                    rows={20}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError(null);
                    }}
                    spellCheck={false}
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
