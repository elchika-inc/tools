import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { replaceText } from '@/utils/textReplace';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [global, setGlobal] = useState(true);
  const result = useMemo(() => {
    if (!input || !searchText) return { text: input, matchCount: 0 };
    try {
      return replaceText(input, {
        searchText,
        replaceText: replaceValue,
        useRegex,
        caseSensitive,
        global,
      });
    } catch (_error) {
      return { text: input, matchCount: 0 };
    }
  }, [input, searchText, replaceValue, useRegex, caseSensitive, global]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
    setSearchText('');
    setReplaceValue('');
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
            <h1 className="text-3xl font-bold tracking-tight">Text Replace</h1>
            <p className="text-muted-foreground">
              テキスト内の文字列を検索・置換します。正規表現対応。
            </p>
          </header>

          <main className="grid gap-4 md:grid-cols-[280px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">検索・置換</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">検索文字列</Label>
                  <input
                    id="search"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="検索..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replace">置換文字列</Label>
                  <input
                    id="replace"
                    type="text"
                    value={replaceValue}
                    onChange={(e) => setReplaceValue(e.target.value)}
                    placeholder="置換..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="useRegex"
                      type="checkbox"
                      checked={useRegex}
                      onChange={(e) => setUseRegex(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="useRegex">正規表現</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="caseSensitive"
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="caseSensitive">大文字小文字を区別</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="global"
                      type="checkbox"
                      checked={global}
                      onChange={(e) => setGlobal(e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="global">全て置換</Label>
                  </div>
                </div>
                {result.matchCount > 0 && (
                  <div className="text-sm text-muted-foreground">{result.matchCount} 件マッチ</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>テキストを入力すると、リアルタイムで置換されます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="ここにテキストを入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="置換結果がここに表示されます..."
                    value={result.text}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={clearAll}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!result.text}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
