import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, AlertTriangle } from 'lucide-react';
import { parseDockerRun, toComposeYaml } from '@/utils/dockerRunParser';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE = `docker run -d \\
  --name my-app \\
  -p 8080:80 \\
  -p 8443:443 \\
  -v /data/app:/app/data \\
  -v /var/log/app:/app/logs \\
  -e NODE_ENV=production \\
  -e DATABASE_URL=postgres://localhost:5432/mydb \\
  --restart unless-stopped \\
  --network my-network \\
  my-image:latest`;

export default function App() {
  const [input, setInput] = useState('');
  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return parseDockerRun(input);
    } catch {
      return null;
    }
  }, [input]);

  const composeYaml = useMemo(() => {
    if (!result) return '';
    return toComposeYaml(result);
  }, [result]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(composeYaml);
      toast.add({ title: 'Copied to clipboard' });
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
            <h1 className="text-3xl font-bold tracking-tight">Docker Run to Compose</h1>
            <p className="text-muted-foreground">
              Convert docker run commands to docker-compose.yml format.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Docker Run Command</CardTitle>
                <CardDescription>Paste your docker run command below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="docker run -d --name my-app -p 8080:80 nginx"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
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
                <CardTitle>docker-compose.yml</CardTitle>
                <CardDescription>Generated compose file.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="min-h-[300px] rounded-md bg-muted p-4 font-mono text-sm overflow-auto whitespace-pre">
                  {composeYaml || '# Enter a docker run command to generate compose YAML'}
                </pre>

                {result && result.warnings.length > 0 && (
                  <div className="space-y-1">
                    {result.warnings.map((w, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-2"
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {w}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="button" onClick={copyToClipboard} disabled={!composeYaml}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
