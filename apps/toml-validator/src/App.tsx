import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Trash2, Check, AlertCircle } from 'lucide-react';
import { validateTOML } from '@/utils/tomlValidator';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE = `# Sample TOML configuration
title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
enabled = true

[database]
server = "192.168.1.1"
ports = [8001, 8001, 8002]
connection_max = 5000
enabled = true

[servers.alpha]
ip = "10.0.0.1"
dc = "eqdc10"

[servers.beta]
ip = "10.0.0.2"
dc = "eqdc10"`;

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => {
    if (!input.trim()) return null;
    return validateTOML(input);
  }, [input]);

  const copyJson = async () => {
    if (!result?.json) return;
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
            <h1 className="text-3xl font-bold tracking-tight">TOML Validator</h1>
            <p className="text-muted-foreground">
              Validate TOML syntax and convert to JSON.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>TOML Input</CardTitle>
                    <CardDescription>Paste your TOML content.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(SAMPLE)}
                    >
                      Sample
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setInput('')}
                      disabled={!input}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  aria-label="TOML input"
                  className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Paste TOML here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {result && (
                  <div
                    className={`flex items-center gap-2 mt-3 p-3 rounded-md text-sm ${
                      result.valid
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {result.valid ? (
                      <>
                        <Check className="h-4 w-4" /> Valid TOML
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" /> {result.error}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>JSON Output</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyJson}
                    disabled={!result?.json}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="min-h-[400px] rounded-md bg-muted p-4 text-sm font-mono overflow-auto whitespace-pre-wrap">
                  {result?.json || '// Parse TOML to see JSON output'}
                </pre>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
