import { Copy, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateStrength,
  DEFAULT_OPTIONS,
  generatePassword,
  type PasswordOptions,
} from '@/utils/passwordGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

const PASSWORD_COUNT = 5;

function StrengthBar({ score }: { score: number }) {
  const maxScore = 7;
  const percentage = (score / maxScore) * 100;

  let colorClass = 'bg-red-500';
  if (score >= 6) colorClass = 'bg-green-500';
  else if (score >= 4) colorClass = 'bg-yellow-500';
  else if (score >= 2) colorClass = 'bg-orange-500';

  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function App() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [passwords, setPasswords] = useState<string[]>([]);
  const handleGenerate = useCallback(() => {
    const newPasswords = Array.from({ length: PASSWORD_COUNT }, () => generatePassword(options));
    setPasswords(newPasswords);
  }, [options]);

  const handleCopy = useCallback(
    async (password: string) => {
      try {
        await navigator.clipboard.writeText(password);
        toast.add({ title: 'Copied to clipboard' });
      } catch {
        toast.add({ title: 'Failed to copy', type: "error" });
      }
    },
    [toast]
  );

  const handleCopyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(passwords.join('\n'));
      toast.add({ title: 'All passwords copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  }, [passwords, toast]);

  const handleClear = useCallback(() => {
    setPasswords([]);
  }, []);

  const updateOption = useCallback(
    <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const checkboxOptions: { key: keyof PasswordOptions; label: string }[] = [
    { key: 'uppercase', label: 'Uppercase (A-Z)' },
    { key: 'lowercase', label: 'Lowercase (a-z)' },
    { key: 'numbers', label: 'Numbers (0-9)' },
    { key: 'symbols', label: 'Symbols (!@#$...)' },
    { key: 'excludeAmbiguous', label: 'Exclude Ambiguous (l, I, 1, O, 0)' },
  ];

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Password Generator</h1>
            <p className="text-muted-foreground">
              Generate secure, random passwords with customizable options.
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
              <CardDescription>Configure password generation settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="length">Length: {options.length}</Label>
                  <Input
                    id="length-input"
                    type="number"
                    min={4}
                    max={128}
                    value={options.length}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value, 10);
                      if (!Number.isNaN(val) && val >= 4 && val <= 128) {
                        updateOption('length', val);
                      }
                    }}
                    className="w-20"
                  />
                </div>
                <input
                  id="length"
                  type="range"
                  min={4}
                  max={128}
                  value={options.length}
                  onChange={(e) => updateOption('length', Number.parseInt(e.target.value, 10))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checkboxOptions.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options[key] as boolean}
                      onChange={(e) =>
                        updateOption(key, e.target.checked as PasswordOptions[typeof key])
                      }
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={handleGenerate} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" /> Generate Passwords
                </Button>
              </div>
            </CardContent>
          </Card>

          {passwords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Passwords</CardTitle>
                <CardDescription>
                  Click the copy button to copy a password to clipboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {passwords.map((password, index) => {
                  const strength = calculateStrength(password);
                  return (
                    <div key={`pw-${index}-${password.slice(0, 8)}`} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm font-mono break-all">
                          {password}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(password)}
                          aria-label="Copy password"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <StrengthBar score={strength.score} />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {strength.label}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleClear}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={handleCopyAll}>
                    <Copy className="mr-2 h-4 w-4" /> Copy All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
