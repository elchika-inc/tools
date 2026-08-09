import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, RotateCcw } from 'lucide-react';
import {
  decisionTree,
  getGuidelines,
  generateHtmlSnippet,
  type ImagePurpose,
} from '@/utils/altTextHelper';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState('start');
  const [result, setResult] = useState<ImagePurpose | null>(null);
  const [altText, setAltText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentStep = decisionTree.find((s) => s.id === currentStepId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const handleOptionClick = (nextStep: string | null, purpose?: ImagePurpose) => {
    setHistory((prev) => [...prev, currentStepId]);
    if (purpose) {
      setResult(purpose);
    } else if (nextStep) {
      setCurrentStepId(nextStep);
    }
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
      return;
    }
    const prev = [...history];
    const last = prev.pop();
    if (last) {
      setCurrentStepId(last);
      setHistory(prev);
    }
  };

  const handleReset = () => {
    setCurrentStepId('start');
    setResult(null);
    setAltText('');
    setHistory([]);
  };

  const guidelines = result ? getGuidelines(result) : null;
  const snippet = result ? generateHtmlSnippet(result, altText) : '';

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.add({ title: 'Copied HTML snippet' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
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
            <h1 className="text-3xl font-bold tracking-tight">Alt Text Helper</h1>
            <p className="text-muted-foreground">
              Upload an image and answer questions to determine the right alt text approach.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Image Upload</CardTitle>
              <CardDescription>Upload an image to preview alongside your alt text.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {imageUrl && (
                <div className="border rounded-md p-4 bg-muted">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className="max-h-64 mx-auto object-contain"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision Tree</CardTitle>
              <CardDescription>
                Answer the questions to determine the image purpose.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!result && currentStep && (
                <div className="space-y-4">
                  <p className="text-lg font-medium">{currentStep.question}</p>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.options.map((opt) => (
                      <Button
                        key={opt.label}
                        type="button"
                        variant="outline"
                        onClick={() => handleOptionClick(opt.nextStep, opt.purpose)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {result && guidelines && (
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-muted space-y-2">
                    <p className="text-sm font-semibold">
                      Image Purpose: <span className="capitalize">{guidelines.purpose}</span>
                    </p>
                    <p className="text-sm">{guidelines.explanation}</p>
                    <p className="text-sm font-mono bg-background p-2 rounded">
                      {guidelines.altAttribute}
                    </p>
                  </div>

                  {result !== 'decorative' && (
                    <div className="space-y-2">
                      <Label htmlFor="altText">Your alt text</Label>
                      <Input
                        id="altText"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Describe the image..."
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Generated HTML</Label>
                    <pre className="p-4 rounded-md bg-muted text-sm font-mono whitespace-pre-wrap break-all">
                      {snippet}
                    </pre>
                    <Button type="button" variant="outline" size="sm" onClick={copySnippet}>
                      <Copy className="mr-2 h-4 w-4" /> Copy HTML
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {(history.length > 0 || result) && (
                  <Button type="button" variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
