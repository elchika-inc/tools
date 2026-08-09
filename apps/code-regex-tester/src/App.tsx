import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { COMMON_PATTERNS, testRegex } from '@/utils/regexTester';
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');

  const result = useMemo(() => testRegex(pattern, flags, testString), [pattern, flags, testString]);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
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
            <h1 className="text-3xl font-bold tracking-tight">Regex Tester</h1>
            <p className="text-muted-foreground">正規表現をリアルタイムでテストします。</p>
          </header>

          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pattern</CardTitle>
                <CardDescription>正規表現パターンとフラグを入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono" aria-hidden="true">
                    /
                  </span>
                  <input
                    type="text"
                    aria-label="Regular expression pattern"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="pattern"
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span className="text-muted-foreground font-mono" aria-hidden="true">
                    /
                  </span>
                  <input
                    type="text"
                    aria-label="Regular expression flags"
                    value={flags}
                    onChange={(e) => setFlags(e.target.value)}
                    className="w-20 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="flex gap-2" role="group" aria-label="Toggle flags">
                  {['g', 'i', 'm', 's'].map((flag) => (
                    <button
                      type="button"
                      key={flag}
                      onClick={() => toggleFlag(flag)}
                      aria-pressed={flags.includes(flag)}
                      className={`px-3 py-1 rounded text-sm font-mono transition-colors ${
                        flags.includes(flag)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted border'
                      }`}
                    >
                      {flag}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Label className="w-full text-xs text-muted-foreground">よく使うパターン:</Label>
                  {COMMON_PATTERNS.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => setPattern(p.pattern)}
                      className="px-2 py-1 rounded text-xs border hover:bg-muted transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {result.error && (
                  <div role="alert" className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded p-2">
                    {result.error}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test String</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  aria-label="Test string input"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="テスト文字列を入力..."
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Matches {result.matches.length > 0 && `(${result.matches.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.matches.length > 0 ? (
                  <div className="space-y-2">
                    {result.matches.map((m, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: match list derived from input
                      <div key={i} className="p-2 rounded border text-sm font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">#{i + 1}</span>
                          <span className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                            {m.match}
                          </span>
                          <span className="text-xs text-muted-foreground">index: {m.index}</span>
                        </div>
                        {m.groups.length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Groups: {m.groups.map((g, gi) => `$${gi + 1}="${g}"`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">マッチなし</div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
