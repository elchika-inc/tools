import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateYaml } from '@/utils/yamlValidator';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE = `# Docker Compose example
version: "3.8"
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      - NODE_ENV=production
    restart: always
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:`;

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => validateYaml(input), [input]);

  const copyJson = async () => {
    if (!result.json) return;
    try {
      await navigator.clipboard.writeText(result.json);
      toast.add({ title: 'JSON copied to clipboard' });
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
            <h1 className="text-3xl font-bold tracking-tight">YAML Validator</h1>
            <p className="text-muted-foreground">
              Validate YAML syntax, view errors, and convert to JSON.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  YAML Input
                  {input.trim() && (
                    result.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                </CardTitle>
                <CardDescription>Paste YAML to validate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  aria-label="YAML input"
                  className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                  placeholder="key: value&#10;list:&#10;  - item1&#10;  - item2"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {result.error && (
                  <div role="alert" className="flex items-start gap-2 p-3 bg-destructive-subtle border border-destructive rounded-md text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{result.error}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setInput(SAMPLE)}>
                    Load Sample
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setInput('')}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>JSON Output</CardTitle>
                <CardDescription>
                  {result.valid ? 'YAML converted to JSON successfully.' : 'Fix YAML errors to see JSON output.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="min-h-[400px] rounded-md bg-muted p-4 font-mono text-sm overflow-auto whitespace-pre">
                  {result.json || '// Valid YAML will be converted to JSON here'}
                </pre>
                <div className="flex justify-end">
                  <Button type="button" onClick={copyJson} disabled={!result.json}>
                    <Copy className="mr-2 h-4 w-4" /> Copy JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
