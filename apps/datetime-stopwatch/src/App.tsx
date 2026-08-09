import { Flag, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMs } from "@/utils/stopwatch";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startRef.current);
      }, 10);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, elapsed]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  }, []);
  const lap = useCallback(() => setLaps((prev) => [elapsed, ...prev]), [elapsed]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Stopwatch</h1>
            <p className="text-muted-foreground">ストップウォッチです。ラップタイム機能付き。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Stopwatch</CardTitle>
                <CardDescription>Start/Pause/Resetで操作します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div
                    className="text-6xl font-bold font-mono tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`経過時間 ${formatMs(elapsed)}`}
                  >
                    {formatMs(elapsed)}
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  {running ? (
                    <Button type="button" onClick={pause} size="lg">
                      <Pause className="mr-2 h-5 w-5" aria-hidden="true" /> Pause
                    </Button>
                  ) : (
                    <Button type="button" onClick={start} size="lg">
                      <Play className="mr-2 h-5 w-5" aria-hidden="true" /> Start
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={lap}
                    variant="secondary"
                    size="lg"
                    disabled={!running}
                  >
                    <Flag className="mr-2 h-5 w-5" aria-hidden="true" /> Lap
                  </Button>
                  <Button type="button" onClick={reset} variant="outline" size="lg">
                    <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" /> Reset
                  </Button>
                </div>
                {laps.length > 0 && (
                  <div
                    className="space-y-1 pt-4 border-t max-h-48 overflow-y-auto"
                    aria-label="ラップタイム一覧"
                  >
                    {laps.map((lapTime, i) => {
                      const key = `lap-${laps.length - i}`;
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between text-sm font-mono"
                        >
                          <span className="text-muted-foreground">Lap {laps.length - i}</span>
                          <span>{formatMs(lapTime)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
