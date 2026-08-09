import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  convertToAll,
  getUnitLabel,
  ALL_UNITS,
  type Unit,
  type Standard,
  type ConversionResult,
} from '@/utils/fileSize';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState<Unit>('GB');
  const [standard, setStandard] = useState<Standard>('IEC');
  const results: ConversionResult[] = useMemo(() => {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || value === '') return [];
    return convertToAll(num, fromUnit, standard);
  }, [value, fromUnit, standard]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied!', description: 'Value copied to clipboard' });
    } catch {
      toast.add({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        type: "error",
      });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">File Size Converter</h1>
            <p className="text-muted-foreground">
              Convert between B, KB, MB, GB, TB, and PB. Switch between SI (1000) and IEC (1024)
              standards.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Enter a value and select the unit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="size-value">Value</Label>
                  <Input
                    id="size-value"
                    type="number"
                    min={0}
                    step="any"
                    placeholder="e.g. 1024"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as Unit)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {getUnitLabel(u, standard)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Standard</Label>
                  <Select value={standard} onValueChange={(v) => setStandard(v as Standard)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SI">SI (1000)</SelectItem>
                      <SelectItem value="IEC">IEC (1024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {standard === 'SI' ? 'SI: 1 KB = 1,000 B' : 'IEC: 1 KiB = 1,024 B'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((r) => (
                    <div
                      key={r.unit}
                      className={`flex items-center justify-between rounded-md border px-4 py-3 ${
                        r.unit === fromUnit ? 'bg-muted border-primary' : ''
                      }`}
                    >
                      <div>
                        <span className="font-mono text-lg">{r.formatted}</span>
                        <span className="ml-2 text-muted-foreground">{r.label}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(r.formatted)}
                      >
                        Copy
                      </Button>
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
