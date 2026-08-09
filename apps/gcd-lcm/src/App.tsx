import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { gcdMultiple, lcmMultiple, gcdSteps, parseNumbers, type GcdStep } from '@/utils/gcdLcm';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [gcdResult, setGcdResult] = useState<number | null>(null);
  const [lcmResult, setLcmResult] = useState<number | null>(null);
  const [steps, setSteps] = useState<GcdStep[]>([]);
  const [error, setError] = useState('');
  const handleCalculate = useCallback(() => {
    setError('');
    setGcdResult(null);
    setLcmResult(null);
    setSteps([]);

    try {
      const numbers = parseNumbers(input);
      const g = gcdMultiple(numbers);
      const l = lcmMultiple(numbers);
      setGcdResult(g);
      setLcmResult(l);

      if (numbers.length === 2) {
        setSteps(gcdSteps(numbers[0], numbers[1]));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input');
    }
  }, [input]);

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
            <h1 className="text-3xl font-bold tracking-tight">GCD / LCM Calculator</h1>
            <p className="text-muted-foreground">
              Calculate Greatest Common Divisor and Least Common Multiple with step-by-step display
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>
                Enter two or more positive integers separated by commas or spaces
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numbers-input">Numbers</Label>
                <div className="flex gap-2">
                  <Input
                    id="numbers-input"
                    placeholder="e.g. 12, 18, 24"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  />
                  <Button type="button" onClick={handleCalculate}>
                    Calculate
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
              </div>
            </CardContent>
          </Card>

          {(gcdResult !== null || lcmResult !== null) && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>GCD (Greatest Common Divisor)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-2xl font-mono font-bold text-center">
                      {gcdResult}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(String(gcdResult))}
                    >
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>LCM (Least Common Multiple)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-2xl font-mono font-bold text-center">
                      {lcmResult}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(String(lcmResult))}
                    >
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Euclidean Algorithm Steps</CardTitle>
                <CardDescription>Step-by-step calculation of GCD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <div key={i} className="rounded-md border px-3 py-2 font-mono text-sm">
                      {step.a} = {step.b} x {step.quotient} + {step.remainder}
                    </div>
                  ))}
                  <div className="rounded-md bg-muted px-3 py-2 font-mono text-sm font-bold">
                    GCD = {gcdResult}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
