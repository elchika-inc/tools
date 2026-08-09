import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Shield } from 'lucide-react';
import {
  applyMasking,
  getDefaultRules,
  countMatches,
  type MaskingRule,
} from '@/utils/dataMasking';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [rules, setRules] = useState<MaskingRule[]>(getDefaultRules());
  const [customPattern, setCustomPattern] = useState('');
  const [customName, setCustomName] = useState('');
  const [customReplace, setCustomReplace] = useState('***');
  const output = useMemo(() => {
    if (!input.trim()) return '';
    return applyMasking(input, rules);
  }, [input, rules]);

  const matchCounts = useMemo(() => {
    if (!input.trim()) return new Map<string, number>();
    return countMatches(input, rules);
  }, [input, rules]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const addCustomRule = () => {
    if (!customPattern.trim() || !customName.trim()) {
      toast.add({ title: 'Please enter both pattern and name', type: "error" });
      return;
    }
    try {
      const regex = new RegExp(customPattern, 'g');
      const replacement = customReplace;
      const newRule: MaskingRule = {
        id: `custom-${Date.now()}`,
        name: customName,
        pattern: regex,
        replacer: () => replacement,
        enabled: true,
      };
      setRules((prev) => [...prev, newRule]);
      setCustomPattern('');
      setCustomName('');
      setCustomReplace('***');
      toast.add({ title: 'Custom rule added' });
    } catch {
      toast.add({ title: 'Invalid regex pattern', type: "error" });
    }
  };

  const removeCustomRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Masked text copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
  };

  const sampleText = `Contact John Doe at john.doe@example.com or call 090-1234-5678.
Payment card: 4111-1111-1111-1234
Server IP: 192.168.1.100`;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Data Masking Tool</h1>
            <p className="text-muted-foreground">
              Mask PII (emails, phone numbers, credit cards, IPs) in text. Add custom regex patterns.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Masking Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleRule(rule.id)}
                          className="rounded"
                        />
                        <span>{rule.name}</span>
                        {matchCounts.get(rule.id) !== undefined && matchCounts.get(rule.id)! > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {matchCounts.get(rule.id)}
                          </span>
                        )}
                      </label>
                      {rule.id.startsWith('custom-') && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomRule(rule.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Rule</CardTitle>
                  <CardDescription>Add a custom regex pattern to mask.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. SSN"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Regex Pattern</Label>
                    <Input
                      value={customPattern}
                      onChange={(e) => setCustomPattern(e.target.value)}
                      placeholder="e.g. \d{3}-\d{2}-\d{4}"
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Replace With</Label>
                    <Input
                      value={customReplace}
                      onChange={(e) => setCustomReplace(e.target.value)}
                      placeholder="***"
                    />
                  </div>
                  <Button type="button" size="sm" className="w-full" onClick={addCustomRule}>
                    Add Rule
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Input</CardTitle>
                      <CardDescription>Paste text containing sensitive data.</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(sampleText)}
                    >
                      Load Sample
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text with PII to mask..."
                  />
                </CardContent>
              </Card>

              {output && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Masked Output</CardTitle>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                          <Trash2 className="mr-2 h-4 w-4" /> Clear
                        </Button>
                        <Button type="button" size="sm" onClick={copyOutput}>
                          <Copy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap break-all font-mono">
                      {output}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
