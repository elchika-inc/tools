import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2, CheckCircle2, XCircle, MinusCircle, AlertTriangle } from 'lucide-react';
import { checkCors, formatHeaderName, type CorsResult } from '@/utils/corsChecker';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CorsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const handleCheck = async () => {
    if (!url.trim()) {
      toast.add({ title: 'URL is required', type: "error" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const corsResult = await checkCors(url.trim());
      setResult(corsResult);
    } catch (e) {
      toast.add({
        title: 'Check failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CORS Checker</h1>
            <p className="text-muted-foreground">
              URLのCORSヘッダー設定状況を確認します。プリフライトリクエストの結果を表示します。
            </p>
          </header>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  ブラウザのセキュリティ制限により、CORSをブロックしているサイトはリクエスト自体が失敗します。
                  実際のCORS設定の確認には、curl等のコマンドラインツールの使用を推奨します。
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://api.example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                />
                <Button type="button" onClick={handleCheck} disabled={loading || !url.trim()}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Check
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Result
                  </CardTitle>
                  <CardDescription>{result.summary}</CardDescription>
                </CardHeader>
                {result.error && (
                  <CardContent>
                    <div className="p-3 bg-destructive-subtle border border-destructive rounded-md text-sm text-destructive" role="alert">
                      {result.error}
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CORS Headers</CardTitle>
                  <CardDescription>
                    Detected CORS headers and their values.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.headers.map((header) => (
                      <div
                        key={header.name}
                        className="border rounded-md p-4 space-y-2"
                      >
                        <div className="flex items-center gap-3">
                          {header.pass === true ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          ) : header.pass === false ? (
                            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                          ) : (
                            <MinusCircle className="h-5 w-5 text-gray-400 shrink-0" />
                          )}
                          <code className="font-mono font-semibold text-sm">
                            {formatHeaderName(header.name)}
                          </code>
                        </div>
                        <div className="ml-8">
                          {header.value !== null ? (
                            <code className="block px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                              {header.value}
                            </code>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Not present</span>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">{header.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>

      </div>
  </ToastToaster>;
}
