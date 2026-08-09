import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { generateMnemonic, validateMnemonic, WORD_COUNTS, type WordCount } from './utils/bip39';
import { toast, ToastToaster } from "@/components/ui/toast";

function App() {
  const [wordCount, setWordCount] = useState<WordCount>(12);
  const [mnemonic, setMnemonic] = useState('');
  const [validateInput, setValidateInput] = useState('');
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const handleGenerate = async () => {
    const result = await generateMnemonic(wordCount);
    setMnemonic(result);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      toast.add({ title: 'Copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleValidate = () => {
    setValidationResult(validateMnemonic(validateInput));
  };

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">BIP39 Mnemonic Generator</h1>
            <p className="text-muted-foreground">Generate and validate BIP39 mnemonic phrases.</p>
          </header>
          <main className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>BIP39 Mnemonic Generator</CardTitle>
              <CardDescription>Generate cryptographic mnemonic phrases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Word Count</Label>
                <div className="flex gap-2">
                  {WORD_COUNTS.map((count) => (
                    <Button
                      type="button"
                      key={count}
                      variant={wordCount === count ? 'default' : 'outline'}
                      onClick={() => setWordCount(count)}
                      type="button"
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleGenerate} type="button">
                Generate
              </Button>
              {mnemonic && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Mnemonic</Label>
                    <Button variant="outline" size="sm" onClick={handleCopy} type="button">
                      Copy
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {mnemonic.split(' ').map((word, i) => (
                      <div
                        key={`${word}-${i.toString()}`}
                        className="rounded-md border bg-white p-2 text-center text-sm"
                      >
                        <span className="mr-1 text-gray-400">{i + 1}.</span>
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validate Mnemonic</CardTitle>
              <CardDescription>Check if a mnemonic phrase is valid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="validate-input">Mnemonic Phrase</Label>
                <textarea
                  id="validate-input"
                  className="w-full rounded-md border p-3 font-mono text-sm"
                  rows={3}
                  value={validateInput}
                  onChange={(e) => {
                    setValidateInput(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="Enter mnemonic phrase to validate..."
                />
              </div>
              <Button onClick={handleValidate} disabled={!validateInput.trim()} type="button">
                Validate
              </Button>
              {validationResult !== null && (
                <div
                  role="alert"
                  className={`rounded-md p-3 text-sm font-medium ${validationResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {validationResult ? 'Valid mnemonic!' : 'Invalid mnemonic phrase.'}
                </div>
              )}
            </CardContent>
          </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}

export default App;
