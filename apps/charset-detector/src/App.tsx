import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import {
  detectEncoding,
  decodeWithEncoding,
  textToBytes,
  bytesToHex,
  type DetectionResult,
} from '@/utils/charsetDetector';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [rawBytes, setRawBytes] = useState<Uint8Array | null>(null);
  const [decodedText, setDecodedText] = useState('');
  const [hexView, setHexView] = useState('');
  const [fileName, setFileName] = useState('');
  const analyzeBytes = (bytes: Uint8Array) => {
    setRawBytes(bytes);
    setHexView(bytesToHex(bytes.slice(0, 256)));
    const detectionResults = detectEncoding(bytes);
    setResults(detectionResults);

    if (detectionResults.length > 0) {
      setDecodedText(decodeWithEncoding(bytes, detectionResults[0].encoding));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      analyzeBytes(bytes);
      toast.add({ title: 'File analyzed' });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTextPaste = (text: string) => {
    const bytes = textToBytes(text);
    analyzeBytes(bytes);
  };

  const handleConvert = (encoding: string) => {
    if (!rawBytes) return;
    setDecodedText(decodeWithEncoding(rawBytes, encoding));
    toast.add({ title: `Decoded as ${encoding}` });
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
            <h1 className="text-3xl font-bold tracking-tight">Charset Detector</h1>
            <p className="text-muted-foreground">
              Detect character encoding of text files by analyzing byte patterns.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Upload a text file or paste text to analyze.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload File</Label>
                <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {fileName || 'Click to select a file...'}
                  </span>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="space-y-2">
                <Label>Or Paste Text</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  placeholder="Paste text here..."
                  onChange={(e) => handleTextPaste(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detection Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${i === 0 ? 'bg-primary/5 border-primary/20' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{r.encoding}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            Confidence: {r.confidence}%
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvert(r.encoding)}
                        >
                          Decode
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {hexView && (
            <Card>
              <CardHeader>
                <CardTitle>Hex View (first 256 bytes)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {hexView}
                </pre>
              </CardContent>
            </Card>
          )}

          {decodedText && (
            <Card>
              <CardHeader>
                <CardTitle>Decoded Text</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto whitespace-pre-wrap max-h-96">
                  {decodedText}
                </pre>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
