import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { type CountdownResult, calculateCountdown } from "@/utils/countdown";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const nextYear = new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 16);
  const [targetStr, setTargetStr] = useState(nextYear);
  const [title, setTitle] = useState("New Year");
  const [countdown, setCountdown] = useState<CountdownResult | null>(null);

  useEffect(() => {
    const target = new Date(targetStr);
    if (Number.isNaN(target.getTime())) return;
    const update = () => setCountdown(calculateCountdown(target));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetStr]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Countdown</h1>
            <p className="text-muted-foreground">指定日時までのカウントダウンを表示します。</p>
          </header>
          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>目標の日時を設定してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="countdown-title">タイトル</Label>
                  <input
                    id="countdown-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countdown-target">目標日時</Label>
                  <input
                    id="countdown-target"
                    type="datetime-local"
                    value={targetStr}
                    onChange={(e) => setTargetStr(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {countdown && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-lg">
                    {title} {countdown.isPast ? "(経過)" : "まで"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="grid grid-cols-4 gap-2 text-center"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {[
                      { label: "日", value: countdown.days },
                      { label: "時間", value: countdown.hours },
                      { label: "分", value: countdown.minutes },
                      { label: "秒", value: countdown.seconds },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-lg bg-muted">
                        <div className="text-3xl font-bold font-mono">{item.value}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
