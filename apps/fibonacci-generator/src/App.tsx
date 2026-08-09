import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  generate,
  nthFib,
  isFibonacci,
  fibonacciIndex,
  GOLDEN_RATIO,
} from '@/utils/fibonacci';
import { toast, ToastToaster } from "@/components/ui/toast";

type Tab = 'sequence' | 'nth' | 'check';

export default function App() {
  const [tab, setTab] = useState<Tab>('sequence');
  // Sequence tab
  const [seqCount, setSeqCount] = useState('10');
  const [sequence, setSequence] = useState<number[]>([]);
  const [seqError, setSeqError] = useState('');

  // Nth tab
  const [nthInput, setNthInput] = useState('');
  const [nthResult, setNthResult] = useState<number | null>(null);
  const [nthRatio, setNthRatio] = useState<number | null>(null);
  const [nthError, setNthError] = useState('');

  // Check tab
  const [checkInput, setCheckInput] = useState('');
  const [checkResult, setCheckResult] = useState<{
    isFib: boolean;
    index: number | null;
  } | null>(null);
  const [checkError, setCheckError] = useState('');

  const handleGenerate = useCallback(() => {
    setSeqError('');
    setSequence([]);
    const count = Number(seqCount);
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      setSeqError('Please enter an integer between 1 and 1000');
      return;
    }
    setSequence(generate(count));
  }, [seqCount]);

  const handleNth = useCallback(() => {
    setNthError('');
    setNthResult(null);
    setNthRatio(null);
    const n = Number(nthInput);
    if (!Number.isInteger(n) || n < 0 || n > 1000) {
      setNthError('Please enter an integer between 0 and 1,000');
      return;
    }
    try {
      const result = nthFib(n);
      setNthResult(result);
      if (n >= 2) {
        const prev = nthFib(n - 1);
        if (prev !== 0) {
          setNthRatio(result / prev);
        }
      }
    } catch {
      setNthError('Calculation failed');
    }
  }, [nthInput]);

  const handleCheck = useCallback(() => {
    setCheckError('');
    setCheckResult(null);
    const n = Number(checkInput);
    if (!Number.isInteger(n) || n < 0) {
      setCheckError('Please enter a non-negative integer');
      return;
    }
    const isFib = isFibonacci(n);
    const index = fibonacciIndex(n);
    setCheckResult({ isFib, index });
  }, [checkInput]);

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
            <h1 className="text-3xl font-bold tracking-tight">Fibonacci Generator</h1>
            <p className="text-muted-foreground">
              Generate Fibonacci sequences, find the Nth term, and check if a number is Fibonacci
            </p>
          </header>

          <div className="flex gap-2">
            {(['sequence', 'nth', 'check'] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={tab === t ? 'default' : 'outline'}
                onClick={() => setTab(t)}
              >
                {t === 'sequence' ? 'Sequence' : t === 'nth' ? 'Nth Term' : 'Check'}
              </Button>
            ))}
          </div>

          {tab === 'sequence' && (
            <Card>
              <CardHeader>
                <CardTitle>Generate Sequence</CardTitle>
                <CardDescription>Generate the first N Fibonacci numbers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seq-count">Count</Label>
                  <div className="flex gap-2">
                    <Input
                      id="seq-count"
                      type="number"
                      min={1}
                      max={1000}
                      placeholder="e.g. 20"
                      value={seqCount}
                      onChange={(e) => setSeqCount(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <Button type="button" onClick={handleGenerate}>
                      Generate
                    </Button>
                  </div>
                  {seqError && <p className="text-sm text-destructive" role="alert">{seqError}</p>}
                </div>
                {sequence.length > 0 && (
                  <div className="space-y-2 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{sequence.length} terms</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(sequence.join(', '))}
                      >
                        Copy All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-64 overflow-y-auto">
                      {sequence.map((val, i) => (
                        <span key={i} className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
                          <span className="text-muted-foreground text-xs mr-1">F({i})</span>
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {tab === 'nth' && (
            <Card>
              <CardHeader>
                <CardTitle>Nth Fibonacci Number</CardTitle>
                <CardDescription>Find the Nth term of the Fibonacci sequence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nth-input">N (index, 0-based)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="nth-input"
                      type="number"
                      min={0}
                      max={1000}
                      placeholder="e.g. 20"
                      value={nthInput}
                      onChange={(e) => setNthInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNth()}
                    />
                    <Button type="button" onClick={handleNth}>
                      Calculate
                    </Button>
                  </div>
                  {nthError && <p className="text-sm text-destructive" role="alert">{nthError}</p>}
                </div>
                {nthResult !== null && (
                  <div className="space-y-3 rounded-md border p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">F({nthInput}) =</p>
                      <div className="flex items-start gap-2">
                        <code className="flex-1 rounded bg-muted px-2 py-1 font-mono text-sm break-all">
                          {nthResult}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(String(nthResult))}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    {nthRatio !== null && (
                      <p className="text-sm text-muted-foreground">
                        F({nthInput}) / F({Number(nthInput) - 1}) = {nthRatio.toFixed(10)} (Golden
                        ratio: {GOLDEN_RATIO.toFixed(10)})
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {tab === 'check' && (
            <Card>
              <CardHeader>
                <CardTitle>Fibonacci Check</CardTitle>
                <CardDescription>
                  Check if a number belongs to the Fibonacci sequence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="check-input">Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="check-input"
                      type="number"
                      min={0}
                      placeholder="e.g. 144"
                      value={checkInput}
                      onChange={(e) => setCheckInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                    />
                    <Button type="button" onClick={handleCheck}>
                      Check
                    </Button>
                  </div>
                  {checkError && <p className="text-sm text-destructive" role="alert">{checkError}</p>}
                </div>
                {checkResult && (
                  <div className="rounded-md border p-4">
                    <p className="text-lg font-semibold">
                      {checkInput} is{' '}
                      <span
                        className={checkResult.isFib ? 'text-green-600' : 'text-orange-600'}
                      >
                        {checkResult.isFib ? 'a Fibonacci number' : 'NOT a Fibonacci number'}
                      </span>
                    </p>
                    {checkResult.isFib && checkResult.index !== null && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Index: F({checkResult.index})
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
