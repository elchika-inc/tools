import { Copy, Shuffle, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { pickRandom, shuffleLines } from '@/utils/listRandomize';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [pickCount, setPickCount] = useState(1);
  const handleShuffle = useCallback(() => {
    setOutput(shuffleLines(input));
  }, [input]);

  const handlePick = useCallback(() => {
    setOutput(pickRandom(input, pickCount));
  }, [input, pickCount]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">List Randomizer</h1>
            <p className="text-muted-foreground">リストの要素をランダムにシャッフルします。</p>
          </header>

          <main>
          <Card>
            <CardHeader>
              <CardTitle>Randomizer</CardTitle>
              <CardDescription>1行に1項目ずつ入力してシャッフルしてください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="input">Input (1行1項目)</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder={'Apple\nBanana\nCherry\nDate\nEldberry'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="シャッフル結果がここに表示されます..."
                    value={output}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t">
                <div className="flex items-end gap-2">
                  <Button type="button" onClick={handleShuffle} disabled={!input.trim()}>
                    <Shuffle className="mr-2 h-4 w-4" /> Shuffle All
                  </Button>
                  <div className="flex items-end gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="pickCount" className="text-xs">
                        抽選数
                      </Label>
                      <input
                        id="pickCount"
                        type="number"
                        min={1}
                        value={pickCount}
                        onChange={(e) => setPickCount(Math.max(1, Number(e.target.value)))}
                        className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <Button type="button" variant="secondary" onClick={handlePick} disabled={!input.trim()}>
                      Pick
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setInput('');
                      setOutput('');
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!output}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
