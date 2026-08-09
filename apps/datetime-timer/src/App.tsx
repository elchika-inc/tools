import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatTime, parseMinutesToSeconds } from "@/utils/timer";
import { toast, ToastToaster } from "@/components/ui/toast";

const PRESETS = [1, 3, 5, 10, 15, 25, 30, 60];

export default function App() {
  const [inputMin, setInputMin] = useState(5);
  const [remaining, setRemaining] = useState(parseMinutesToSeconds(5));
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false);
            toast.add({ title: "タイマー完了!" });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining, toast]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(parseMinutesToSeconds(inputMin));
  }, [inputMin]);

  const setPreset = (min: number) => {
    setInputMin(min);
    setRemaining(parseMinutesToSeconds(min));
    setRunning(false);
  };

  const progress = remaining / parseMinutesToSeconds(inputMin);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Timer</h1>
            <p className="text-muted-foreground">カウントダウンタイマーです。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Timer</CardTitle>
                <CardDescription>時間を設定してStartを押してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div
                    className="text-6xl font-bold font-mono"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`残り時間 ${formatTime(remaining)}`}
                  >
                    {formatTime(remaining)}
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-4 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${(Number.isNaN(progress) ? 0 : progress) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={Math.round((Number.isNaN(progress) ? 0 : progress) * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  {running ? (
                    <Button type="button" onClick={pause} size="lg">
                      <Pause className="mr-2 h-5 w-5" aria-hidden="true" /> Pause
                    </Button>
                  ) : (
                    <Button type="button" onClick={start} size="lg" disabled={remaining === 0}>
                      <Play className="mr-2 h-5 w-5" aria-hidden="true" /> Start
                    </Button>
                  )}
                  <Button type="button" onClick={reset} variant="outline" size="lg">
                    <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" /> Reset
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Presets (分)</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setPreset(m)}
                        aria-pressed={inputMin === m}
                        className={`px-3 py-1 rounded text-sm ${inputMin === m ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
                      >
                        {m}分
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="timer-custom">カスタム (分)</Label>
                      <input
                        id="timer-custom"
                        type="number"
                        min={0.1}
                        step={0.5}
                        value={inputMin}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setInputMin(v);
                          if (!running) setRemaining(parseMinutesToSeconds(v));
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
