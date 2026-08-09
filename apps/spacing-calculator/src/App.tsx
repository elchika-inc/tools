import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import {
  calculateSpacingScale,
  formatSpacingTable,
  type SpacingValue,
} from '@/utils/spacingCalculator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [baseUnit, setBaseUnit] = useState(8);
  const [baseFontSize, setBaseFontSize] = useState(16);
  const spacingValues = useMemo(
    () => calculateSpacingScale(baseUnit, baseFontSize),
    [baseUnit, baseFontSize]
  );

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.add({ title: `Copied: ${value}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const copyAll = async () => {
    try {
      const table = formatSpacingTable(spacingValues);
      await navigator.clipboard.writeText(table);
      toast.add({ title: 'Spacing table copied' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const maxPx = Math.max(...spacingValues.map((v) => v.px), 1);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Spacing Calculator</h1>
            <p className="text-muted-foreground">
              Calculate design spacing values with px, rem, em, and Tailwind equivalents.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Set the base unit and root font size.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="baseUnit">Base Unit (px)</Label>
                  <Input
                    id="baseUnit"
                    type="number"
                    min={1}
                    max={100}
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(parseInt(e.target.value) || 8)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseFontSize">Root Font Size (px)</Label>
                  <Input
                    id="baseFontSize"
                    type="number"
                    min={1}
                    max={100}
                    value={baseFontSize}
                    onChange={(e) => setBaseFontSize(parseInt(e.target.value) || 16)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Spacing Scale</CardTitle>
                <CardDescription>
                  Based on {baseUnit}px with {baseFontSize}px root font size.
                </CardDescription>
              </div>
              <Button type="button" size="sm" onClick={copyAll}>
                <Copy className="mr-1 h-4 w-4" /> Copy All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Scale</th>
                      <th className="text-right py-2 px-3 font-medium">px</th>
                      <th className="text-right py-2 px-3 font-medium">rem</th>
                      <th className="text-right py-2 px-3 font-medium">em</th>
                      <th className="text-left py-2 px-3 font-medium">Tailwind</th>
                      <th className="text-left py-2 px-3 font-medium">Preview</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {spacingValues.map((value) => (
                      <tr key={value.multiplier} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 font-mono text-muted-foreground">{value.label}</td>
                        <td className="text-right py-2 px-3 font-mono">{value.px}px</td>
                        <td className="text-right py-2 px-3 font-mono">{value.rem}</td>
                        <td className="text-right py-2 px-3 font-mono">{value.em}</td>
                        <td className="py-2 px-3 font-mono text-primary">{value.tailwindClass}</td>
                        <td className="py-2 px-3">
                          <div
                            className="h-4 bg-primary/30 rounded-sm"
                            style={{
                              width: `${Math.max(2, (value.px / maxPx) * 200)}px`,
                            }}
                          />
                        </td>
                        <td className="py-2 px-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              copyValue(`${value.px}px / ${value.rem} / ${value.tailwindClass}`)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visual Spacing Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {spacingValues.map((value) => (
                  <div key={value.multiplier} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-10">
                      {value.label}
                    </span>
                    <div className="flex-1 flex items-center">
                      <div
                        className="bg-primary rounded-sm"
                        style={{
                          width: `${value.px}px`,
                          height: `${value.px}px`,
                          maxWidth: '100%',
                          maxHeight: '80px',
                          minWidth: '2px',
                          minHeight: '2px',
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono w-12 text-right">{value.px}px</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
