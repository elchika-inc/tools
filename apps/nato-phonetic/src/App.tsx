import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { textToNatoString, natoToText, getReferenceTable } from '@/utils/nato';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [textInput, setTextInput] = useState('');
  const [natoInput, setNatoInput] = useState('');
  const [natoOutput, setNatoOutput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [showReference, setShowReference] = useState(false);
  const handleTextToNato = useCallback(
    (value: string) => {
      setTextInput(value);
      if (value.trim()) {
        setNatoOutput(textToNatoString(value));
      } else {
        setNatoOutput('');
      }
    },
    [],
  );

  const handleNatoToText = useCallback(
    (value: string) => {
      setNatoInput(value);
      if (value.trim()) {
        setTextOutput(natoToText(value));
      } else {
        setTextOutput('');
      }
    },
    [],
  );

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

  const referenceTable = getReferenceTable();

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">NATO Phonetic Alphabet</h1>
            <p className="text-muted-foreground">
              Convert text to NATO phonetic alphabet and back
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Text to NATO</CardTitle>
                <CardDescription>Enter text to convert to NATO phonetic alphabet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text</Label>
                  <Input
                    id="text-input"
                    placeholder="e.g. Hello"
                    value={textInput}
                    onChange={(e) => handleTextToNato(e.target.value)}
                  />
                </div>
                {natoOutput && (
                  <div className="space-y-2">
                    <Label>NATO Output</Label>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm break-all">
                        {natoOutput}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(natoOutput)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NATO to Text</CardTitle>
                <CardDescription>Enter NATO words separated by spaces</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nato-input">NATO Words</Label>
                  <Input
                    id="nato-input"
                    placeholder="e.g. Hotel Echo Lima Lima Oscar"
                    value={natoInput}
                    onChange={(e) => handleNatoToText(e.target.value)}
                  />
                </div>
                {textOutput && (
                  <div className="space-y-2">
                    <Label>Text Output</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-lg">
                        {textOutput}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(textOutput)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReference(!showReference)}
            >
              {showReference ? 'Hide' : 'Show'} Reference Table
            </Button>
          </div>

          {showReference && (
            <Card>
              <CardHeader>
                <CardTitle>Reference Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {referenceTable.map(({ char, nato }) => (
                    <div key={char} className="rounded-md border p-2 text-center text-sm">
                      <div className="font-mono font-bold text-lg">{char}</div>
                      <div className="text-muted-foreground">{nato}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
