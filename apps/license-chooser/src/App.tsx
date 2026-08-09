import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Download, Check, X, Minus } from 'lucide-react';
import {
  LICENSES,
  FEATURE_LABELS,
  recommendLicenses,
  type License,
  type LicenseFeatures,
  type QuestionAnswer,
} from '@/utils/licenseData';
import { toast, ToastToaster } from "@/components/ui/toast";

const QUESTIONS = [
  { key: 'needsCommercial' as const, text: 'Do you need commercial use?' },
  { key: 'needsPatent' as const, text: 'Do you need patent protection?' },
  { key: 'needsCopyleft' as const, text: 'Do you want copyleft (same license required)?' },
];

export default function App() {
  const [answers, setAnswers] = useState<QuestionAnswer>({
    needsCommercial: null,
    needsPatent: null,
    needsCopyleft: null,
  });
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const recommended = useMemo(() => recommendLicenses(answers), [answers]);

  const setAnswer = (key: keyof QuestionAnswer, value: boolean | null) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const downloadLicense = (license: License) => {
    const blob = new Blob([license.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LICENSE';
    a.click();
    URL.revokeObjectURL(url);
    toast.add({ title: `Downloaded ${license.id} LICENSE` });
  };

  const resetAll = () => {
    setAnswers({ needsCommercial: null, needsPatent: null, needsCopyleft: null });
    setSelectedLicense(null);
  };

  const featureIcon = (value: boolean) =>
    value ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-400" />
    );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">License Chooser</h1>
            <p className="text-muted-foreground">
              Find the right open source license for your project.
            </p>
          </header>

          {!selectedLicense ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Answer questions to narrow down license recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {QUESTIONS.map((q) => (
                    <div key={q.key} className="flex items-center justify-between">
                      <Label className="text-sm">{q.text}</Label>
                      <div className="flex gap-1">
                        {([
                          { value: true, label: 'Yes' },
                          { value: false, label: 'No' },
                          { value: null, label: 'Any' },
                        ] as const).map((option) => (
                          <Button
                            key={String(option.value)}
                            type="button"
                            size="sm"
                            variant={answers[q.key] === option.value ? 'default' : 'outline'}
                            onClick={() => setAnswer(q.key, option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={resetAll}>
                      Reset filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold">
                  Matching Licenses ({recommended.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommended.map((license) => (
                    <Card
                      key={license.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setSelectedLicense(license)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{license.name}</CardTitle>
                        <CardDescription className="text-xs">{license.id}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {license.shortDescription}
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {(Object.keys(FEATURE_LABELS) as (keyof LicenseFeatures)[]).map(
                            (key) => (
                              <div key={key} className="flex items-center gap-1">
                                {featureIcon(license.features[key])}
                                <span className="text-xs">{FEATURE_LABELS[key]}</span>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Button type="button" variant="ghost" onClick={() => setSelectedLicense(null)}>
                Back to list
              </Button>

              <Card>
                <CardHeader>
                  <CardTitle>{selectedLicense.name}</CardTitle>
                  <CardDescription>{selectedLicense.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(FEATURE_LABELS) as (keyof LicenseFeatures)[]).map((key) => (
                      <div
                        key={key}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                          selectedLicense.features[key] ? 'bg-green-50' : 'bg-muted'
                        }`}
                      >
                        {featureIcon(selectedLicense.features[key])}
                        {FEATURE_LABELS[key]}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>License Text</Label>
                    <pre className="max-h-[500px] overflow-auto rounded-md border bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
                      {selectedLicense.text}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => copyToClipboard(selectedLicense.text)}
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => downloadLicense(selectedLicense)}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download LICENSE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
