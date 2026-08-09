import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import {
  convert,
  checkWcagMinSize,
  modularScale,
  conversionTable,
  COMMON_RATIOS,
} from '@/utils/fontSizeCalc';
import type { Unit } from '@/utils/fontSizeCalc';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [value, setValue] = useState('16');
  const [unit, setUnit] = useState<Unit>('px');
  const [basePx, setBasePx] = useState('16');
  const [scaleRatio, setScaleRatio] = useState(1.25);
  const base = parseFloat(basePx) || 16;
  const numValue = parseFloat(value) || 0;

  const result = useMemo(() => convert(numValue, unit, base), [numValue, unit, base]);
  const wcag = useMemo(() => checkWcagMinSize(result.px), [result.px]);
  const table = useMemo(() => conversionTable(base), [base]);
  const scale = useMemo(() => modularScale(base, scaleRatio), [base, scaleRatio]);

  const copyResult = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
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
            <h1 className="text-3xl font-bold tracking-tight">Font Size Calculator</h1>
            <p className="text-muted-foreground">
              Convert between px, rem, em, and pt. Generate modular type scales.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Convert</CardTitle>
                <CardDescription>Enter a value and unit to convert</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="basePx">Base Font Size (px)</Label>
                  <Input id="basePx" type="number" value={basePx} onChange={(e) => setBasePx(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} />
                  </div>
                  <div className="space-y-2 w-24">
                    <Label htmlFor="unit">Unit</Label>
                    <select
                      id="unit"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as Unit)}
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                      <option value="em">em</option>
                      <option value="pt">pt</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['px', 'rem', 'em', 'pt'] as const).map((u) => (
                  <div key={u} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <span className="font-mono text-lg">{result[u]} {u}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => copyResult(`${result[u]}${u}`)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className={`flex items-center gap-2 p-2 rounded-md ${wcag.passes ? 'bg-green-50' : 'bg-red-50'}`}>
                  {wcag.passes ? <Check className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                  <span className="text-sm">{wcag.message}</span>
                </div>
                <div className="p-2 rounded-md bg-muted">
                  <p className="text-sm font-medium mb-1">Preview</p>
                  <p style={{ fontSize: `${result.px}px` }}>The quick brown fox (at {result.px}px)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Table</CardTitle>
              <CardDescription>Common sizes with base: {base}px</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">px</th>
                      <th className="text-left p-2">rem</th>
                      <th className="text-left p-2">em</th>
                      <th className="text-left p-2">pt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((row) => (
                      <tr key={row.px} className="border-b hover:bg-muted">
                        <td className="p-2 font-mono">{row.px}</td>
                        <td className="p-2 font-mono">{row.rem}</td>
                        <td className="p-2 font-mono">{row.em}</td>
                        <td className="p-2 font-mono">{row.pt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modular Scale</CardTitle>
              <CardDescription>Generate harmonious font sizes based on a ratio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_RATIOS.map((r) => (
                  <Button
                    key={r.value}
                    type="button"
                    variant={scaleRatio === r.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScaleRatio(r.value)}
                  >
                    {r.name} ({r.value})
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                {scale.map((s) => (
                  <div key={s.step} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                    <span className="text-xs text-muted-foreground w-12">Step {s.step}</span>
                    <span className="font-mono w-20">{s.px}px</span>
                    <span className="font-mono w-20 text-muted-foreground">{s.rem}rem</span>
                    <span style={{ fontSize: `${Math.min(s.px, 48)}px`, lineHeight: 1.2 }} className="truncate">
                      Aa
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
