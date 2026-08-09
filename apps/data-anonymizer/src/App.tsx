import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { detectPII, anonymize } from '@/utils/dataAnonymizer';
import type { AnonymizeMode, DetectedPII } from '@/utils/dataAnonymizer';
import { toast, ToastToaster } from "@/components/ui/toast";

function HighlightedText({
  text,
  piiItems,
}: {
  text: string;
  piiItems: DetectedPII[];
}) {
  if (piiItems.length === 0) {
    return <span>{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const pii of piiItems) {
    if (pii.start > lastEnd) {
      parts.push(<span key={`t-${lastEnd}`}>{text.slice(lastEnd, pii.start)}</span>);
    }
    parts.push(
      <span
        key={`p-${pii.start}`}
        className="bg-yellow-200 text-yellow-800 rounded px-0.5"
        title={pii.type}
      >
        {text.slice(pii.start, pii.end)}
      </span>
    );
    lastEnd = pii.end;
  }
  if (lastEnd < text.length) {
    parts.push(<span key={`t-${lastEnd}`}>{text.slice(lastEnd)}</span>);
  }

  return <>{parts}</>;
}

const MODE_LABELS: Record<AnonymizeMode, string> = {
  mask: 'Mask (***)',
  fake: 'Fake Replacement',
  hash: 'Hash',
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<AnonymizeMode>('mask');
  const piiItems = useMemo(() => detectPII(inputText), [inputText]);
  const anonymizedText = useMemo(
    () => (piiItems.length > 0 ? anonymize(inputText, piiItems, mode) : inputText),
    [inputText, piiItems, mode]
  );

  const handleCopyAnonymized = async () => {
    try {
      await navigator.clipboard.writeText(anonymizedText);
      toast.add({ title: 'Anonymized text copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleAnonymizeInPlace = () => {
    setInputText(anonymizedText);
  };

  const handleClear = () => {
    setInputText('');
  };

  const sampleText = `Customer Information:
Name: John Smith
Email: john.smith@company.com
Phone: 090-1234-5678
Credit Card: 4111-1111-1111-1111
IP Address: 192.168.0.100
Date of Birth: 1990-05-15
Postal Code: 150-0001`;

  // Group PII by type for summary
  const piiSummary = piiItems.reduce<Record<string, number>>((acc, pii) => {
    acc[pii.type] = (acc[pii.type] || 0) + 1;
    return acc;
  }, {});

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <main className="mx-auto max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <header>
                <div className="mb-2">
                  <a href="/" className="text-sm text-primary hover:underline">
                    ← Tools トップに戻る
                  </a>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Data Anonymizer</h1>
                <p className="mt-2 text-sm text-muted-foreground">Detect and anonymize personal information (PII) in text</p>
              </header>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selector */}
              <div className="space-y-2">
                <Label>Anonymization Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as AnonymizeMode)}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MODE_LABELS) as AnonymizeMode[]).map((m) => (
                      <SelectItem key={m} value={m}>
                        {MODE_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="input-text">Input Text</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputText(sampleText)}
                    >
                      Load Sample
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                      Clear
                    </Button>
                  </div>
                </div>
                <textarea
                  id="input-text"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste text containing personal information..."
                />
              </div>

              {/* Results */}
              {inputText && (
                <div className="space-y-4">
                  {/* PII Summary */}
                  <div className="flex items-center justify-between">
                    <Label>
                      Detected PII ({piiItems.length})
                    </Label>
                    {piiItems.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAnonymizeInPlace}
                        >
                          Anonymize In Place
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopyAnonymized}
                        >
                          Copy Anonymized
                        </Button>
                      </div>
                    )}
                  </div>

                  {piiItems.length > 0 ? (
                    <>
                      {/* Type Summary */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(piiSummary).map(([type, count]) => (
                          <span
                            key={type}
                            className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                          >
                            {type}
                            <span className="rounded-full bg-yellow-200 px-1.5 text-yellow-900">
                              {count}
                            </span>
                          </span>
                        ))}
                      </div>

                      {/* Detail List */}
                      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                        {piiItems.map((pii, idx) => (
                          <div
                            key={`${pii.start}-${idx}`}
                            className="flex items-center justify-between rounded-md border bg-yellow-50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-yellow-700">{pii.type}</span>
                            <span className="font-mono text-xs text-yellow-600 max-w-[250px] truncate">
                              {pii.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Preview */}
                      <div className="space-y-2">
                        <Label>Preview (PII highlighted)</Label>
                        <div className="rounded-md border bg-white p-3 font-mono text-sm whitespace-pre-wrap break-all max-h-[250px] overflow-y-auto">
                          <HighlightedText text={inputText} piiItems={piiItems} />
                        </div>
                      </div>

                      {/* Anonymized Output */}
                      <div className="space-y-2">
                        <Label>Anonymized Output ({MODE_LABELS[mode]})</Label>
                        <div className="rounded-md border bg-gray-50 p-3 font-mono text-sm whitespace-pre-wrap break-all max-h-[250px] overflow-y-auto">
                          {anonymizedText}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md border border-green-200 bg-green-50 p-4 text-center">
                      <p className="text-sm text-green-700">No personal information detected.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Supported Types */}
              <div className="space-y-2">
                <Label>Supported PII Types</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Email',
                    'Phone (JP)',
                    'Credit Card',
                    'IP Address',
                    'Date of Birth',
                    'Postal Code (JP)',
                  ].map((type) => (
                    <span
                      key={type}
                      className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  All processing is done locally in your browser. No data is sent to any server.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
