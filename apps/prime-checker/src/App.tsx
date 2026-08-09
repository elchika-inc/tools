import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  isPrime,
  factorize,
  formatFactorization,
  sieve,
  nthPrime,
  type PrimeFactor,
} from '@/utils/primeUtils';
import { toast, ToastToaster } from "@/components/ui/toast";

type Tab = 'check' | 'sieve' | 'nth';

export default function App() {
  const [tab, setTab] = useState<Tab>('check');
  const [checkInput, setCheckInput] = useState('');
  const [checkResult, setCheckResult] = useState<{
    isPrime: boolean;
    factors: PrimeFactor[];
    formatted: string;
  } | null>(null);
  const [checkError, setCheckError] = useState('');

  const [sieveInput, setSieveInput] = useState('');
  const [sieveResult, setSieveResult] = useState<number[]>([]);
  const [sieveError, setSieveError] = useState('');

  const [nthInput, setNthInput] = useState('');
  const [nthResult, setNthResult] = useState<number | null>(null);
  const [nthError, setNthError] = useState('');
  const handleCheck = useCallback(() => {
    setCheckError('');
    setCheckResult(null);
    const n = Number(checkInput);
    if (!Number.isInteger(n) || n < 2 || n > 1_000_000_000) {
      setCheckError('Please enter an integer between 2 and 1,000,000,000');
      return;
    }
    const prime = isPrime(n);
    if (prime) {
      setCheckResult({ isPrime: true, factors: [], formatted: '' });
    } else {
      const factors = factorize(n);
      const formatted = formatFactorization(factors);
      setCheckResult({ isPrime: false, factors, formatted });
    }
  }, [checkInput]);

  const handleSieve = useCallback(() => {
    setSieveError('');
    setSieveResult([]);
    const limit = Number(sieveInput);
    if (!Number.isInteger(limit) || limit < 2 || limit > 1_000_000) {
      setSieveError('Please enter an integer between 2 and 1,000,000');
      return;
    }
    setSieveResult(sieve(limit));
  }, [sieveInput]);

  const handleNth = useCallback(() => {
    setNthError('');
    setNthResult(null);
    const n = Number(nthInput);
    if (!Number.isInteger(n) || n < 1 || n > 100_000) {
      setNthError('Please enter an integer between 1 and 100,000');
      return;
    }
    setNthResult(nthPrime(n));
  }, [nthInput]);

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
            <h1 className="text-3xl font-bold tracking-tight">Prime Checker</h1>
            <p className="text-muted-foreground">
              Check primality, factorize numbers, and generate prime sequences
            </p>
          </header>

          <div className="flex gap-2">
            {(['check', 'sieve', 'nth'] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={tab === t ? 'default' : 'outline'}
                onClick={() => setTab(t)}
              >
                {t === 'check' ? 'Prime Check' : t === 'sieve' ? 'Sieve' : 'Nth Prime'}
              </Button>
            ))}
          </div>

          {tab === 'check' && (
            <Card>
              <CardHeader>
                <CardTitle>Prime Check & Factorization</CardTitle>
                <CardDescription>
                  Enter a number to check if it is prime and get its factorization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="check-input">Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="check-input"
                      type="number"
                      placeholder="e.g. 360"
                      value={checkInput}
                      onChange={(e) => setCheckInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                    />
                    <Button type="button" onClick={handleCheck}>
                      Check
                    </Button>
                  </div>
                  {checkError && <p role="alert" className="text-sm text-destructive">{checkError}</p>}
                </div>
                {checkResult && (
                  <div className="space-y-2 rounded-md border p-4">
                    <p className="text-lg font-semibold">
                      {checkInput} is{' '}
                      <span
                        className={checkResult.isPrime ? 'text-green-600' : 'text-orange-600'}
                      >
                        {checkResult.isPrime ? 'Prime' : 'Not Prime'}
                      </span>
                    </p>
                    {!checkResult.isPrime && checkResult.formatted && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Prime Factorization:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded bg-muted px-2 py-1 font-mono">
                            {checkInput} = {checkResult.formatted}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(`${checkInput} = ${checkResult.formatted}`)
                            }
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {tab === 'sieve' && (
            <Card>
              <CardHeader>
                <CardTitle>Sieve of Eratosthenes</CardTitle>
                <CardDescription>Find all prime numbers up to a given limit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sieve-input">Upper Limit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sieve-input"
                      type="number"
                      placeholder="e.g. 100"
                      value={sieveInput}
                      onChange={(e) => setSieveInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSieve()}
                    />
                    <Button type="button" onClick={handleSieve}>
                      Generate
                    </Button>
                  </div>
                  {sieveError && <p role="alert" className="text-sm text-destructive">{sieveError}</p>}
                </div>
                {sieveResult.length > 0 && (
                  <div className="space-y-2 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Found {sieveResult.length} primes
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(sieveResult.join(', '))}
                      >
                        Copy All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-64 overflow-y-auto">
                      {sieveResult.map((p) => (
                        <span key={p} className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
                          {p}
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
                <CardTitle>Nth Prime</CardTitle>
                <CardDescription>Find the Nth prime number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nth-input">N</Label>
                  <div className="flex gap-2">
                    <Input
                      id="nth-input"
                      type="number"
                      placeholder="e.g. 100"
                      value={nthInput}
                      onChange={(e) => setNthInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNth()}
                    />
                    <Button type="button" onClick={handleNth}>
                      Find
                    </Button>
                  </div>
                  {nthError && <p role="alert" className="text-sm text-destructive">{nthError}</p>}
                </div>
                {nthResult !== null && (
                  <div className="rounded-md border p-4">
                    <div className="flex items-center gap-2">
                      <p className="flex-1 text-lg">
                        The <span className="font-bold">{nthInput}th</span> prime is{' '}
                        <span className="font-mono font-bold text-green-600">{nthResult}</span>
                      </p>
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
                )}
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
