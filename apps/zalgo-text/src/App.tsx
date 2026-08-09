import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { addZalgo, removeZalgo, countCombiningChars } from '@/utils/zalgo';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [above, setAbove] = useState(true);
  const [middle, setMiddle] = useState(true);
  const [below, setBelow] = useState(true);
  const [cleanInput, setCleanInput] = useState('');
  const [cleanOutput, setCleanOutput] = useState('');
  const handleGenerate = useCallback(() => {
    if (!input.trim()) return;
    const result = addZalgo(input, { intensity, above, middle, below });
    setOutput(result);
  }, [input, intensity, above, middle, below]);

  const handleClean = useCallback(() => {
    if (!cleanInput.trim()) return;
    setCleanOutput(removeZalgo(cleanInput));
  }, [cleanInput]);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.add({ title: 'Copied!', description: 'Result copied to clipboard' });
      } catch {
        toast.add({
          title: 'Copy failed',
          description: 'Could not copy to clipboard',
          type: "error",
        });
      }
    },
    [toast],
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Zalgo Text Generator</h1>
            <p className="text-muted-foreground">
              Add or remove combining diacritical marks (zalgo effect)
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Generate Zalgo Text</CardTitle>
              <CardDescription>Enter text and adjust intensity to create zalgo effect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zalgo-input">Input Text</Label>
                <Input
                  id="zalgo-input"
                  placeholder="e.g. Hello World"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intensity-slider">
                  Intensity: {intensity}%
                </Label>
                <input
                  id="intensity-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={above}
                    onChange={(e) => setAbove(e.target.checked)}
                    className="rounded"
                  />
                  Above
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={middle}
                    onChange={(e) => setMiddle(e.target.checked)}
                    className="rounded"
                  />
                  Middle
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={below}
                    onChange={(e) => setBelow(e.target.checked)}
                    className="rounded"
                  />
                  Below
                </label>
              </div>

              <Button type="button" onClick={handleGenerate} className="w-full">
                Generate Zalgo
              </Button>

              {output && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Result ({countCombiningChars(output)} combining chars)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(output)}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="rounded-md border bg-muted px-3 py-4 text-lg break-all leading-[3rem]">
                    {output}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Remove Zalgo</CardTitle>
              <CardDescription>Paste zalgo text to clean it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clean-input">Zalgo Text</Label>
                <Input
                  id="clean-input"
                  placeholder="Paste zalgo text here..."
                  value={cleanInput}
                  onChange={(e) => setCleanInput(e.target.value)}
                />
                {cleanInput && (
                  <p className="text-xs text-muted-foreground">
                    {countCombiningChars(cleanInput)} combining characters detected
                  </p>
                )}
              </div>

              <Button type="button" onClick={handleClean} variant="outline" className="w-full">
                Clean Text
              </Button>

              {cleanOutput && (
                <div className="space-y-2">
                  <Label>Cleaned Result</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border bg-muted px-3 py-2">
                      {cleanOutput}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(cleanOutput)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
