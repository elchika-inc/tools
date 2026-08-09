import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { detectHomoglyphs, getSecurityLevel } from '@/utils/homoglyphDetector';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const results = useMemo(() => detectHomoglyphs(input), [input]);
  const security = useMemo(() => getSecurityLevel(results), [results]);

  const handleCopyClean = async () => {
    try {
      const clean = input.replace(/[\u200B-\u200F\uFEFF]/g, '');
      await navigator.clipboard.writeText(clean);
      toast.add({ title: 'Cleaned text copied' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const SecurityIcon =
    security.level === 'safe'
      ? ShieldCheck
      : security.level === 'warning'
        ? Shield
        : ShieldAlert;
  const securityColor =
    security.level === 'safe'
      ? 'text-green-600'
      : security.level === 'warning'
        ? 'text-yellow-600'
        : 'text-red-600';

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Homoglyph Detector</h1>
            <p className="text-muted-foreground">
              Detect visually confusable characters from different scripts (Latin/Cyrillic/Greek).
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste text or a URL to check for homoglyphs.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to analyze..."
              />
            </CardContent>
          </Card>

          {input && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SecurityIcon className={`h-5 w-5 ${securityColor}`} />
                  Security Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`font-medium ${securityColor}`}>{security.message}</p>
                {results.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleCopyClean}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Cleaned Text
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Issues ({results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {[...input].map((char, i) => {
                    const issue = results.find((r) => r.index === i);
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center justify-center w-8 h-8 text-sm rounded border ${
                          issue
                            ? issue.risk === 'high'
                              ? 'bg-red-100 border-red-400 text-red-800'
                              : issue.risk === 'medium'
                                ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                                : 'bg-blue-100 border-blue-400 text-blue-800'
                            : ''
                        }`}
                        title={issue ? `${issue.codePoint} (${issue.script})` : undefined}
                      >
                        {char === ' ' ? '\u2423' : char}
                      </span>
                    );
                  })}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Pos</th>
                        <th className="text-left p-2">Char</th>
                        <th className="text-left p-2">Codepoint</th>
                        <th className="text-left p-2">Script</th>
                        <th className="text-left p-2">Looks Like</th>
                        <th className="text-left p-2">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">{r.index}</td>
                          <td className="p-2 text-lg font-mono">{r.char}</td>
                          <td className="p-2 font-mono text-xs">{r.codePoint}</td>
                          <td className="p-2">{r.script}</td>
                          <td className="p-2 font-mono">{r.confusableWith}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                r.risk === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : r.risk === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {r.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
