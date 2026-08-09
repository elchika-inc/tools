import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { inspectText, type CharInfo } from '@/utils/unicodeInspector';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('Hello \u3042\u3044\u3046');
  const [codepointSearch, setCodepointSearch] = useState('');
  const [selectedChar, setSelectedChar] = useState<CharInfo | null>(null);
  const chars = useMemo(() => inspectText(input), [input]);

  const handleCodepointSearch = () => {
    try {
      const hex = codepointSearch.replace(/^U\+/i, '');
      const cp = parseInt(hex, 16);
      if (isNaN(cp) || cp < 0 || cp > 0x10ffff) {
        toast.add({ title: 'Invalid codepoint', type: "error" });
        return;
      }
      const char = String.fromCodePoint(cp);
      setInput((prev) => prev + char);
      toast.add({ title: `Added ${char}` });
    } catch {
      toast.add({ title: 'Invalid codepoint', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Unicode Inspector</h1>
            <p className="text-muted-foreground">
              Inspect individual characters: codepoint, UTF-8/16 bytes, category, and block.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Enter text to inspect each character.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                aria-label="Text to inspect"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text..."
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Search by codepoint (e.g., U+3042)"
                  value={codepointSearch}
                  onChange={(e) => setCodepointSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCodepointSearch()}
                />
                <Button type="button" onClick={handleCodepointSearch} aria-label="Search codepoint">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {chars.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Characters ({chars.length})</CardTitle>
                <CardDescription>Click a character for details.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {chars.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`w-10 h-10 flex items-center justify-center rounded border text-lg hover:bg-muted ${
                        selectedChar === c ? 'ring-2 ring-ring bg-muted' : ''
                      }`}
                      onClick={() => setSelectedChar(c)}
                      title={c.codePoint}
                    >
                      {c.char === ' '
                        ? '\u2423'
                        : c.char === '\n'
                          ? '\u23ce'
                          : c.char === '\t'
                            ? '\u2192'
                            : c.char}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Char</th>
                        <th className="text-left p-2">Codepoint</th>
                        <th className="text-left p-2">UTF-8</th>
                        <th className="text-left p-2">UTF-16</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chars.map((c, i) => (
                        <tr
                          key={i}
                          className={`border-b hover:bg-muted/50 cursor-pointer ${
                            selectedChar === c ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedChar(c)}
                        >
                          <td className="p-2 text-lg font-mono">{c.char}</td>
                          <td className="p-2 font-mono text-xs">{c.codePoint}</td>
                          <td className="p-2 font-mono text-xs">{c.utf8Bytes}</td>
                          <td className="p-2 font-mono text-xs">{c.utf16}</td>
                          <td className="p-2 text-xs">{c.name}</td>
                          <td className="p-2 text-xs">{c.category}</td>
                          <td className="p-2 text-xs">{c.block}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedChar && (
            <Card>
              <CardHeader>
                <CardTitle>Character Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <span className="text-6xl">{selectedChar.char}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Codepoint</Label>
                      <p className="font-mono">{selectedChar.codePoint}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">UTF-8 Bytes</Label>
                      <p className="font-mono">{selectedChar.utf8Bytes}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">UTF-16</Label>
                      <p className="font-mono">{selectedChar.utf16}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p>{selectedChar.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <p>{selectedChar.category}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Block</Label>
                      <p>{selectedChar.block}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
