import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy } from 'lucide-react';
import {
  parseCSV,
  createPivot,
  type AggregationType,
  type PivotResult,
} from '@/utils/pivotTable';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE = `Region,Product,Sales
East,Widget,100
East,Gadget,200
West,Widget,150
West,Gadget,300
East,Widget,120
West,Gadget,180
East,Gadget,90
West,Widget,210`;

export default function App() {
  const [input, setInput] = useState(SAMPLE);
  const [rowField, setRowField] = useState(0);
  const [colField, setColField] = useState(1);
  const [valueField, setValueField] = useState(2);
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const csvData = useMemo(() => parseCSV(input), [input]);
  const headers = csvData.length > 0 ? csvData[0] : [];

  const pivot: PivotResult = useMemo(() => {
    if (csvData.length < 2) {
      return { headers: [], rowLabels: [], data: [], rowTotals: [], colTotals: [], grandTotal: 0 };
    }
    return createPivot(csvData, { rowField, colField, valueField, aggregation });
  }, [csvData, rowField, colField, valueField, aggregation]);

  const handleCopy = async () => {
    try {
      const lines: string[] = [];
      lines.push(['', ...pivot.headers, 'Total'].join('\t'));
      pivot.rowLabels.forEach((label, i) => {
        const cells = pivot.data[i].map((v) => (v !== null ? String(v) : ''));
        lines.push([label, ...cells, String(pivot.rowTotals[i])].join('\t'));
      });
      lines.push(['Total', ...pivot.colTotals.map(String), String(pivot.grandTotal)].join('\t'));
      await navigator.clipboard.writeText(lines.join('\n'));
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Pivot Table</h1>
            <p className="text-muted-foreground">
              Create pivot tables from CSV data with aggregation.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr,2fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CSV Data</CardTitle>
                  <CardDescription>Paste CSV data with headers.</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    aria-label="CSV data input"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste CSV data..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Row Field</Label>
                    <Select value={String(rowField)} onValueChange={(v) => setRowField(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Column Field</Label>
                    <Select value={String(colField)} onValueChange={(v) => setColField(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value Field</Label>
                    <Select value={String(valueField)} onValueChange={(v) => setValueField(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Aggregation</Label>
                    <Select value={aggregation} onValueChange={(v) => setAggregation(v as AggregationType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="avg">Average</SelectItem>
                        <SelectItem value="min">Min</SelectItem>
                        <SelectItem value="max">Max</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" onClick={handleCopy} disabled={pivot.headers.length === 0}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Table
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pivot Result</CardTitle>
                <CardDescription>
                  {pivot.rowLabels.length} rows x {pivot.headers.length} columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pivot.headers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 border font-medium">
                            {headers[rowField]} \ {headers[colField]}
                          </th>
                          {pivot.headers.map((h) => (
                            <th key={h} className="text-right p-2 border font-medium">{h}</th>
                          ))}
                          <th className="text-right p-2 border font-bold bg-muted">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pivot.rowLabels.map((label, i) => (
                          <tr key={label} className="hover:bg-muted/30">
                            <td className="p-2 border font-medium">{label}</td>
                            {pivot.data[i].map((val, j) => (
                              <td key={j} className="text-right p-2 border tabular-nums">
                                {val !== null ? val : '-'}
                              </td>
                            ))}
                            <td className="text-right p-2 border font-bold bg-muted/30 tabular-nums">
                              {pivot.rowTotals[i]}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-muted/50 font-bold">
                          <td className="p-2 border">Total</td>
                          {pivot.colTotals.map((val, j) => (
                            <td key={j} className="text-right p-2 border tabular-nums">{val}</td>
                          ))}
                          <td className="text-right p-2 border tabular-nums">{pivot.grandTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Enter CSV data and configure fields to generate a pivot table.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
