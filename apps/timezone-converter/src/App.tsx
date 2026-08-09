import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Clock, ArrowRight } from 'lucide-react';
import {
  TIMEZONES,
  formatInTimezone,
  localDatetimeToDate,
} from '@/utils/timezoneConverter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [datetime, setDatetime] = useState('');
  const [fromTz, setFromTz] = useState('UTC');
  const [toTz, setToTz] = useState('Asia/Tokyo');
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});
  const [convertedResult, setConvertedResult] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const times: Record<string, string> = {};
      for (const tz of TIMEZONES) {
        times[tz.id] = formatInTimezone(now, tz.id);
      }
      setCurrentTimes(times);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConvert = () => {
    if (!datetime) {
      toast.add({ title: 'Please enter a date and time', type: "error" });
      return;
    }
    try {
      const date = localDatetimeToDate(datetime, fromTz);
      const result = formatInTimezone(date, toTz);
      setConvertedResult(result);
      toast.add({ title: 'Converted successfully' });
    } catch {
      toast.add({ title: 'Conversion failed', description: 'Invalid date or timezone', type: "error" });
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(convertedResult);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const setNow = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setDatetime(local);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Timezone Converter</h1>
            <p className="text-muted-foreground">
              Convert date and time between different timezones using the Intl API.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Convert</CardTitle>
              <CardDescription>Select source and target timezones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="datetime">Date & Time</Label>
                    <div className="flex gap-2">
                      <Input
                        id="datetime"
                        type="datetime-local"
                        value={datetime}
                        onChange={(e) => setDatetime(e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={setNow}>
                        Now
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromTz">From Timezone</Label>
                    <select
                      id="fromTz"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={fromTz}
                      onChange={(e) => setFromTz(e.target.value)}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.id} value={tz.id}>
                          {tz.label} ({tz.offset})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-center pt-6">
                  <Button type="button" onClick={handleConvert} disabled={!datetime} aria-label="Convert timezone">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="toTz">To Timezone</Label>
                    <select
                      id="toTz"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={toTz}
                      onChange={(e) => setToTz(e.target.value)}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.id} value={tz.id}>
                          {tz.label} ({tz.offset})
                        </option>
                      ))}
                    </select>
                  </div>
                  {convertedResult && (
                    <div className="space-y-2">
                      <Label>Result</Label>
                      <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                        <span className="text-lg font-mono flex-1">{convertedResult}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={copyResult} aria-label="Copy result">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Current Time Around the World
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {TIMEZONES.map((tz) => (
                  <div key={tz.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <span className="text-sm font-medium">{tz.label}</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {currentTimes[tz.id] || '...'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
