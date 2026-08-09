import { AlertCircle, CheckCircle, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type DecodedJWT, decodeJWT, formatJSON } from '@/utils/jwtDecoder';
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [token, setToken] = useState('');

  const result = useMemo((): { decoded: DecodedJWT | null; error: string | null } => {
    if (!token.trim()) return { decoded: null, error: null };
    try {
      return { decoded: decodeJWT(token), error: null };
    } catch (e) {
      return { decoded: null, error: e instanceof Error ? e.message : 'Invalid JWT' };
    }
  }, [token]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">JWT Decoder</h1>
            <p className="text-muted-foreground">JWTトークンをデコードして中身を表示します。</p>
          </header>

          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Input</CardTitle>
                <CardDescription>JWTトークンを貼り付けてください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  aria-label="JWT token input"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none break-all"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => setToken('')}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {result.error && (
              <Card className="border-red-500">
                <CardContent className="pt-6">
                  <div role="alert" className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{result.error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {result.decoded && (
              <>
                {result.decoded.isExpired !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    {result.decoded.isExpired ? (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Expired (at {result.decoded.expiresAt})</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">
                          Valid (expires {result.decoded.expiresAt})
                        </span>
                      </>
                    )}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Header</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm font-mono bg-muted rounded p-3 overflow-auto">
                        {formatJSON(result.decoded.header)}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm font-mono bg-muted rounded p-3 overflow-auto">
                        {formatJSON(result.decoded.payload)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Signature</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-sm font-mono bg-muted rounded p-3 block break-all">
                      {result.decoded.signature}
                    </code>
                  </CardContent>
                </Card>

                {result.decoded.issuedAt && (
                  <div className="text-xs text-muted-foreground">
                    Issued at: {result.decoded.issuedAt}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
