import { useMemo, useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { queryJsonPath } from './utils/jsonpath';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE = JSON.stringify(
  {
    store: {
      books: [
        { title: 'Book A', price: 10 },
        { title: 'Book B', price: 20 },
      ],
      name: 'My Store',
    },
  },
  null,
  2
);

function App() {
  const [json, setJson] = useState(SAMPLE);
  const [path, setPath] = useState('$.store.books[0].title');
  const result = useMemo(() => {
    try {
      const data = JSON.parse(json);
      const matches = queryJsonPath(data, path);
      return { value: JSON.stringify(matches, null, 2), error: null };
    } catch (e) {
      return {
        value: '',
        error: e instanceof Error ? e.message : 'Error',
      };
    }
  }, [json, path]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.value);
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
            <h1 className="text-3xl font-bold tracking-tight">JSONPath Tester</h1>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>JSONPath Tester</CardTitle>
                <CardDescription>Test JSONPath expressions against JSON data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="path">JSONPath Expression</Label>
                  <Input
                    id="path"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="$.store.books[0].title"
                    className="font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="json">JSON Input</Label>
                    <textarea
                      id="json"
                      className="w-full rounded-md border p-3 font-mono text-sm"
                      rows={15}
                      value={json}
                      onChange={(e) => setJson(e.target.value)}
                      spellCheck={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Result</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!result.value}
                        type="button"
                      >
                        Copy
                      </Button>
                    </div>
                    {result.error ? (
                      <div role="alert" className="rounded-md bg-destructive-subtle p-3 text-sm text-destructive">
                        {result.error}
                      </div>
                    ) : (
                      <textarea
                        aria-label="JSONPath query result"
                        className="w-full rounded-md border bg-gray-50 p-3 font-mono text-sm"
                        rows={15}
                        value={result.value}
                        readOnly
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

export default App;
