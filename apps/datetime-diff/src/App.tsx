import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { calculateDateDiff } from "@/utils/dateDiff";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [date1, setDate1] = useState(new Date().toISOString().slice(0, 16));
  const [date2, setDate2] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16),
  );

  const result = useMemo(() => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return null;
    return calculateDateDiff(d1, d2);
  }, [date1, date2]);

  const cls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Date Diff Calculator</h1>
            <p className="text-muted-foreground">2つの日付の差分を計算します。</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Calculator</CardTitle>
                <CardDescription>2つの日時を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date1">日時1</Label>
                    <input
                      id="date1"
                      type="datetime-local"
                      value={date1}
                      onChange={(e) => setDate1(e.target.value)}
                      className={cls}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date2">日時2</Label>
                    <input
                      id="date2"
                      type="datetime-local"
                      value={date2}
                      onChange={(e) => setDate2(e.target.value)}
                      className={cls}
                    />
                  </div>
                </div>

                {result && (
                  <div className="space-y-4 pt-4 border-t" aria-live="polite" aria-atomic="true">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.years}年 {result.months}ヶ月 {result.days}日
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.hours}時間 {result.minutes}分 {result.seconds}秒
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "合計日数", value: `${result.totalDays.toLocaleString()} 日` },
                        { label: "合計時間", value: `${result.totalHours.toLocaleString()} 時間` },
                        { label: "合計分", value: `${result.totalMinutes.toLocaleString()} 分` },
                        { label: "合計秒", value: `${result.totalSeconds.toLocaleString()} 秒` },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-3 rounded-md bg-muted">
                          <div className="text-lg font-bold font-mono">{item.value}</div>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
