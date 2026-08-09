import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  parseInput,
  renderGanttChart,
  downloadCanvasAsPng,
} from '@/utils/ganttChart';
import { ToastToaster } from "@/components/ui/toast";

const SAMPLE_DATA = `# Project Timeline
Planning, 2024-01-01, 5, plan
UI Design, 2024-01-03, 7, design
API Design, 2024-01-06, 4, design
Frontend Dev, 2024-01-10, 14, dev
Backend Dev, 2024-01-10, 12, dev
Code Review, 2024-01-22, 3, review
Unit Testing, 2024-01-20, 5, test
Integration Test, 2024-01-25, 4, test
Staging Deploy, 2024-01-29, 2, deploy
Production Deploy, 2024-01-31, 1, deploy`;

export default function App() {
  const [input, setInput] = useState(SAMPLE_DATA);
  const [title, setTitle] = useState('Project Gantt Chart');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tasks = useMemo(() => parseInput(input), [input]);

  const canvasWidth = 900;
  const canvasHeight = Math.max(300, tasks.length * 38 + 120);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    renderGanttChart(ctx, tasks, canvasWidth, canvasHeight, title);
  }, [tasks, canvasWidth, canvasHeight, title]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadCanvasAsPng(canvas, 'gantt-chart.png');
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Gantt Chart</h1>
            <p className="text-muted-foreground">
              Simple Gantt chart generator with task timelines
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Task Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chart Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tasks (name, start, duration, category)</Label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Task Name, YYYY-MM-DD, days, category"
                    className="font-mono min-h-[300px]"
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Format: name, YYYY-MM-DD, duration(days), category</p>
                  <p>Category is optional. Lines starting with # are comments.</p>
                  <p>Known categories: design, dev, test, deploy, plan, review</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tasks.length} tasks parsed
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Timeline</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                    Download PNG
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 bg-white overflow-auto">
                  <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
