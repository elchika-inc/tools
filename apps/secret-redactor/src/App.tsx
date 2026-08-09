import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { detect, redact } from '@/utils/secretRedactor';
import type { DetectedSecret } from '@/utils/secretRedactor';
import { toast, ToastToaster } from "@/components/ui/toast";

function HighlightedText({
  text,
  secrets,
}: {
  text: string;
  secrets: DetectedSecret[];
}) {
  if (secrets.length === 0) {
    return <span>{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const secret of secrets) {
    if (secret.start > lastEnd) {
      parts.push(<span key={`t-${lastEnd}`}>{text.slice(lastEnd, secret.start)}</span>);
    }
    parts.push(
      <span
        key={`s-${secret.start}`}
        className="bg-red-200 text-red-800 rounded px-0.5"
        title={secret.type}
      >
        {text.slice(secret.start, secret.end)}
      </span>
    );
    lastEnd = secret.end;
  }
  if (lastEnd < text.length) {
    parts.push(<span key={`t-${lastEnd}`}>{text.slice(lastEnd)}</span>);
  }

  return <>{parts}</>;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const secrets = useMemo(() => detect(inputText), [inputText]);
  const redactedText = useMemo(
    () => (secrets.length > 0 ? redact(inputText, secrets) : inputText),
    [inputText, secrets]
  );

  const handleCopyRedacted = async () => {
    try {
      await navigator.clipboard.writeText(redactedText);
      toast.add({ title: 'Redacted text copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleRedactInPlace = () => {
    setInputText(redactedText);
  };

  const handleClear = () => {
    setInputText('');
  };

  const sampleText = `# Example config
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
password=my_super_secret_123
API_TOKEN=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh12
DATABASE_URL=postgres://admin:secretpass@db.example.com:5432/mydb
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U`;

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <main className="mx-auto max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <header>
                <div className="mb-2">
                  <a href="/" className="text-sm text-primary hover:underline">
                    ← Tools トップに戻る
                  </a>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Secret Redactor</h1>
                <p className="mt-2 text-sm text-muted-foreground">Detect and mask secrets, API keys, tokens, and passwords in text</p>
              </header>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="input-text">Input Text</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputText(sampleText)}
                    >
                      Load Sample
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                      Clear
                    </Button>
                  </div>
                </div>
                <textarea
                  id="input-text"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste text containing secrets to detect..."
                />
              </div>

              {/* Detection Results */}
              {inputText && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>
                      Detected Secrets ({secrets.length})
                    </Label>
                    {secrets.length > 0 && (
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={handleRedactInPlace}>
                          Redact In Place
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={handleCopyRedacted}>
                          Copy Redacted
                        </Button>
                      </div>
                    )}
                  </div>

                  {secrets.length > 0 ? (
                    <>
                      {/* Secret List */}
                      <div className="space-y-1.5">
                        {secrets.map((secret, idx) => (
                          <div
                            key={`${secret.start}-${idx}`}
                            className="flex items-center justify-between rounded-md border bg-red-50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-red-700">{secret.type}</span>
                            <span className="font-mono text-xs text-red-600 max-w-[300px] truncate">
                              {secret.value.length > 40
                                ? secret.value.slice(0, 20) + '...' + secret.value.slice(-10)
                                : secret.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Preview */}
                      <div className="space-y-2">
                        <Label>Preview (secrets highlighted)</Label>
                        <div className="rounded-md border bg-white p-3 font-mono text-sm whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto">
                          <HighlightedText text={inputText} secrets={secrets} />
                        </div>
                      </div>

                      {/* Redacted Output */}
                      <div className="space-y-2">
                        <Label>Redacted Output</Label>
                        <div className="rounded-md border bg-gray-50 p-3 font-mono text-sm whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto">
                          {redactedText}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center">
                      <p className="text-sm text-green-700">No secrets detected in the input text.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Supported Patterns */}
              <div className="space-y-2">
                <Label>Supported Detection Patterns</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'AWS Keys',
                    'GitHub Tokens',
                    'Slack Tokens',
                    'API Keys',
                    'Bearer Tokens',
                    'Private Keys',
                    'Passwords',
                    'Connection Strings',
                    'JWTs',
                    'Google API Keys',
                    'Stripe Keys',
                  ].map((pattern) => (
                    <span
                      key={pattern}
                      className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
