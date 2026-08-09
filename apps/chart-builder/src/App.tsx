import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  parseTableData,
  renderBarChart,
  renderLineChart,
  renderPieChart,
  downloadCanvasAsPng,
} from '@/utils/chartRenderer';
import { ToastToaster } from "@/components/ui/toast";

type ChartType = 'bar' | 'line' | 'pie';

const SAMPLE_DATA = `January, 65
February, 59
March, 80
April, 81
May, 56
June, 55
July, 72`;

export default function App() {
  const [input, setInput] = useState(SAMPLE_DATA);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [title, setTitle] = useState('My Chart');
  const [xAxisLabel, setXAxisLabel] = useState('Category');
  const [yAxisLabel, setYAxisLabel] = useState('Value');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dataset = useMemo(() => parseTableData(input), [input]);

  const config = useMemo(
    () => ({
      title,
      xAxisLabel,
      yAxisLabel,
      width: 700,
      height: 450,
    }),
    [title, xAxisLabel, yAxisLabel]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = config.width;
    canvas.height = config.height;

    switch (chartType) {
      case 'bar':
        renderBarChart(ctx, dataset, config);
        break;
      case 'line':
        renderLineChart(ctx, dataset, config);
        break;
      case 'pie':
        renderPieChart(ctx, dataset, config);
        break;
    }
  }, [dataset, chartType, config]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvasAsPng(canvas, `chart-${chartType}.png`);
  }, [chartType]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Chart Builder</h1>
            <p className="text-muted-foreground">
              Interactive chart builder with bar, line, and pie charts
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select
                    value={chartType}
                    onValueChange={(v) => setChartType(v as ChartType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                {chartType !== 'pie' && (
                  <>
                    <div className="space-y-2">
                      <Label>X Axis Label</Label>
                      <Input
                        value={xAxisLabel}
                        onChange={(e) => setXAxisLabel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Y Axis Label</Label>
                      <Input
                        value={yAxisLabel}
                        onChange={(e) => setYAxisLabel(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label>Data (label, value per line)</Label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Label, Value"
                    className="font-mono min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: label, value, #color
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                    Download PNG
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-white flex items-center justify-center overflow-auto">
                  <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {dataset.labels.length} data points
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
