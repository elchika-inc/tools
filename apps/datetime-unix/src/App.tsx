import { Clock, Copy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  dateToTimestamp,
  formatDate,
  formatISO,
  formatRelative,
  formatUTC,
  nowTimestamp,
  timestampToDate,
} from "@/utils/unixTimestamp";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [timestamp, setTimestamp] = useState(String(nowTimestamp()));
  const [currentTime, setCurrentTime] = useState(nowTimestamp());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(nowTimestamp()), 1000);
    return () => clearInterval(interval);
  }, []);

  const date = useMemo(() => {
    const ts = Number(timestamp);
    if (Number.isNaN(ts)) return null;
    return timestampToDate(ts);
  }, [timestamp]);

  const setNow = useCallback(() => {
    setTimestamp(String(nowTimestamp()));
  }, []);

  const setFromDateInput = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      setTimestamp(String(dateToTimestamp(d)));
    }
  }, []);

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.add({ title: "Copied to clipboard" });
    } catch {
      toast.add({ title: "コピーに失敗しました", type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Unix Timestamp Converter</h1>
            <p className="text-muted-foreground">UNIXタイムスタンプと日時の相互変換を行います。</p>
          </header>

          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" aria-hidden="true" /> 現在時刻
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4" aria-live="polite" aria-atomic="true">
                  <code className="text-2xl font-mono font-bold">{currentTime}</code>
                  <span className="text-muted-foreground">
                    {formatDate(timestampToDate(currentTime))}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>タイムスタンプまたは日時を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timestamp">Unix Timestamp (秒)</Label>
                    <div className="flex gap-2">
                      <input
                        id="timestamp"
                        type="text"
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                        className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      <Button type="button" variant="outline" onClick={setNow}>
                        Now
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateInput">日時入力</Label>
                    <input
                      id="dateInput"
                      type="datetime-local"
                      onChange={(e) => setFromDateInput(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>

                {date && (
                  <div className="space-y-3 pt-4 border-t">
                    {[
                      { label: "ローカル日時", value: formatDate(date) },
                      { label: "ISO 8601", value: formatISO(date) },
                      { label: "UTC", value: formatUTC(date) },
                      { label: "相対時間", value: formatRelative(date) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className="w-28 text-sm text-muted-foreground">{item.label}</span>
                        <code className="flex-1 text-sm font-mono">{item.value}</code>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`${item.label}をコピー`}
                          onClick={() => copyValue(item.value)}
                        >
                          <Copy className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
