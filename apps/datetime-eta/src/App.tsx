import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { calculateETA, formatDuration } from "@/utils/eta";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [distance, setDistance] = useState("100");
  const [speed, setSpeed] = useState("60");

  const eta = useMemo(() => {
    const d = Number(distance);
    const s = Number(speed);
    if (Number.isNaN(d) || Number.isNaN(s)) return null;
    return calculateETA(d, s);
  }, [distance, speed]);

  const cls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">ETA Calculator</h1>
            <p className="text-muted-foreground">到着予定時刻を計算します。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Calculator</CardTitle>
                <CardDescription>距離と速度を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eta-distance">距離 (km)</Label>
                  <input
                    id="eta-distance"
                    type="number"
                    min={0}
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className={cls}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eta-speed">速度 (km/h)</Label>
                  <input
                    id="eta-speed"
                    type="number"
                    min={0}
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className={cls}
                  />
                </div>
                {eta && (
                  <div
                    className="pt-4 border-t text-center space-y-2"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className="text-sm text-muted-foreground">所要時間</div>
                    <div className="text-3xl font-bold">{formatDuration(eta.hours, eta.minutes)}</div>
                    <div className="text-sm text-muted-foreground">到着予定</div>
                    <div className="text-xl font-mono">{eta.arrival.toLocaleTimeString("ja-JP")}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
