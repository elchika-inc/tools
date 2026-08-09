import { CheckCircle, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { analyzePassword } from '@/utils/passwordChecker';
import { ToastToaster } from "@/components/ui/toast";

const STRENGTH_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-emerald-500',
];

export default function App() {
  const [password, setPassword] = useState('');

  const analysis = useMemo(() => (password ? analyzePassword(password) : null), [password]);

  const checks = analysis
    ? [
        { label: '大文字', ok: analysis.hasUppercase },
        { label: '小文字', ok: analysis.hasLowercase },
        { label: '数字', ok: analysis.hasNumbers },
        { label: '記号', ok: analysis.hasSymbols },
        { label: '8文字以上', ok: analysis.length >= 8 },
        { label: '12文字以上', ok: analysis.length >= 12 },
      ]
    : [];

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Password Strength Checker</h1>
            <p className="text-muted-foreground">パスワードの強度を判定します。</p>
          </header>

          <main>
          <Card>
            <CardHeader>
              <CardTitle>Checker</CardTitle>
              <CardDescription>
                パスワードを入力してください(データは送信されません)。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力..."
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  autoComplete="off"
                />
              </div>

              {analysis && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{analysis.label}</span>
                      <span className="text-sm text-muted-foreground">{analysis.entropy} bits</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      {['s0', 's1', 's2', 's3', 's4'].map((key, i) => (
                        <div
                          key={key}
                          className={`flex-1 rounded-full ${i <= analysis.score ? STRENGTH_COLORS[analysis.score] : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      推定解読時間: <span className="font-medium">{analysis.timeToCrack}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {checks.map((check) => (
                      <div key={check.label} className="flex items-center gap-1 text-sm">
                        {check.ok ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={check.ok ? '' : 'text-muted-foreground'}>{check.label}</span>
                      </div>
                    ))}
                  </div>

                  {analysis.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">改善提案</Label>
                      {analysis.suggestions.map((s) => (
                        <div key={s} className="text-sm text-muted-foreground">
                          - {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
