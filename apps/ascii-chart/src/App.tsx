import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  parseInput,
  generateHorizontalChart,
  generateVerticalChart,
} from '@/utils/asciiChart';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE_DATA = `JavaScript, 65
Python, 48
TypeScript, 42
Rust, 30
Go, 28
Java, 25`;

export default function App() {
  const [input, setInput] = useState(SAMPLE_DATA);
  const [chartType, setChartType] = useState<'horizontal' | 'vertical'>('horizontal');
  const [barChar, setBarChar] = useState('#');
  const [maxWidth, setMaxWidth] = useState(40);
  const [showValues, setShowValues] = useState(true);

  const data = useMemo(() => parseInput(input), [input]);

  const output = useMemo(() => {
    const options = { barChar: barChar || '#', maxWidth, showValues };
    return chartType === 'horizontal'
      ? generateHorizontalChart(data, options)
      : generateVerticalChart(data, options);
  }, [data, chartType, barChar, maxWidth, showValues]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Chart copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  }, [output]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ASCII Chart</h1>
            <p className="text-muted-foreground">
              Generate ASCII art bar charts from comma-separated data
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Data Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data (label, value per line)</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Label, Value"
                  className="font-mono min-h-[150px]"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select
                    value={chartType}
                    onValueChange={(v) => setChartType(v as 'horizontal' | 'vertical')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal</SelectItem>
                      <SelectItem value="vertical">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bar Character</Label>
                  <Input
                    value={barChar}
                    onChange={(e) => setBarChar(e.target.value.charAt(0) || '#')}
                    maxLength={1}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Width</Label>
                  <Input
                    type="number"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(Math.max(5, parseInt(e.target.value) || 40))}
                    min={5}
                    max={80}
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showValues}
                      onChange={(e) => setShowValues(e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">Show Values</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Output</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto font-mono text-sm whitespace-pre">
                {output}
              </pre>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
