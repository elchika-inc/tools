import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Clipboard } from 'lucide-react';
import { validate, type ValidationIssue } from '@/utils/packageJsonValidator';
import { toast, ToastToaster } from "@/components/ui/toast";

const severityIcon = {
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning-foreground" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
};

const severityStyle = {
  error: 'border-destructive bg-destructive-subtle',
  warning: 'border-warning bg-warning',
  info: 'border-blue-200 bg-blue-50',
};

const samplePackageJson = JSON.stringify(
  {
    name: 'my-package',
    version: '1.0.0',
    description: 'A sample package',
    main: 'index.js',
    scripts: {
      test: 'vitest',
      build: 'tsc',
    },
    license: 'MIT',
    dependencies: {
      react: '^18.0.0',
    },
  },
  null,
  2,
);

export default function App() {
  const [input, setInput] = useState('');
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [validated, setValidated] = useState(false);
  const handleValidate = () => {
    const result = validate(input);
    setIssues(result);
    setValidated(true);

    const errors = result.filter((i) => i.severity === 'error');
    if (errors.length === 0) {
      toast.add({ title: 'Validation passed' });
    } else {
      toast.add({ title: `Found ${errors.length} error(s)`, type: "error" });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      toast.add({ title: 'Pasted from clipboard' });
    } catch {
      toast.add({ title: 'Failed to read clipboard', type: "error" });
    }
  };

  const handleLoadSample = () => {
    setInput(samplePackageJson);
    setValidated(false);
    setIssues([]);
  };

  const handleClear = () => {
    setInput('');
    setValidated(false);
    setIssues([]);
  };

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">package.json Validator</h1>
            <p className="text-muted-foreground">
              Validate package.json files for correct format, required fields, and best practices.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste your package.json content below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="json-input">package.json</Label>
                <textarea
                  id="json-input"
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder='{\n  "name": "my-package",\n  "version": "1.0.0"\n}'
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setValidated(false);
                  }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button type="button" onClick={handleValidate} disabled={!input.trim()}>
                  Validate
                </Button>
                <Button type="button" variant="outline" onClick={handlePasteFromClipboard}>
                  <Clipboard className="mr-2 h-4 w-4" /> Paste
                </Button>
                <Button type="button" variant="outline" onClick={handleLoadSample}>
                  Load Sample
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {validated && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {errorCount === 0 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success-foreground" /> Validation Results
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-destructive" /> Validation Results
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {errorCount} error(s), {warningCount} warning(s), {infoCount} suggestion(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issues.length === 0 ? (
                  <p className="text-green-600 font-medium">
                    No issues found. Your package.json looks good!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {issues.map((issue, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-md border ${severityStyle[issue.severity]}`}
                      >
                        <div className="mt-0.5">{severityIcon[issue.severity]}</div>
                        <div>
                          <span className="font-mono text-xs bg-background/50 px-1 py-0.5 rounded mr-2">
                            {issue.field}
                          </span>
                          <span className="text-sm">{issue.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
