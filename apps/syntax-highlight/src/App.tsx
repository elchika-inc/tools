import { Copy, Moon, Sun, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LANGUAGE_LABELS, LANGUAGES, type Language, tokenize } from '@/utils/syntaxHighlight';
import { toast, ToastToaster } from "@/components/ui/toast";

const TOKEN_COLORS: Record<string, { light: string; dark: string }> = {
  keyword: { light: 'text-purple-700', dark: 'text-purple-400' },
  string: { light: 'text-green-700', dark: 'text-green-400' },
  comment: { light: 'text-gray-500', dark: 'text-gray-500' },
  number: { light: 'text-orange-600', dark: 'text-orange-400' },
};

export default function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const tokens = tokenize(code, language);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  }, [code, toast]);

  const handleClear = useCallback(() => {
    setCode('');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Syntax Highlighter</h1>
            <p className="text-muted-foreground">
              Paste your code and see it with syntax highlighting.
            </p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Code Input</CardTitle>
                <CardDescription>Select a language and paste your code below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {LANGUAGE_LABELS[lang]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                  >
                    {theme === 'dark' ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    {theme === 'dark' ? 'Light' : 'Dark'} Theme
                  </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code-input">Input</Label>
                    <textarea
                      id="code-input"
                      className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                      placeholder="Paste your code here..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Highlighted Output</Label>
                    <pre
                      aria-label="Syntax highlighted output"
                      className={`min-h-[400px] w-full rounded-md border border-input px-3 py-2 text-sm font-mono overflow-auto whitespace-pre-wrap break-words ${
                        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
                      }`}
                    >
                      {tokens.length > 0 ? (
                        tokens.map((token, i) => {
                          if (token.className) {
                            const colors = TOKEN_COLORS[token.className];
                            const colorClass = colors
                              ? theme === 'dark'
                                ? colors.dark
                                : colors.light
                              : '';
                            return (
                              <span key={`${i}-${token.className}`} className={colorClass}>
                                {token.text}
                              </span>
                            );
                          }
                          return token.text;
                        })
                      ) : (
                        <span className="text-muted-foreground">
                          Highlighted code will appear here...
                        </span>
                      )}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleClear}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={handleCopy} disabled={!code}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
