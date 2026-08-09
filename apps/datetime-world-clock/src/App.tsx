import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type CityTime, getAllCityTimes } from "@/utils/worldClock";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [times, setTimes] = useState<CityTime[]>([]);

  useEffect(() => {
    const update = () => setTimes(getAllCityTimes(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-8 w-8" aria-hidden="true" /> World Clock
            </h1>
            <p className="text-muted-foreground">世界各都市の現在時刻を表示します。</p>
          </header>
          <main>
            <div
              className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
              aria-live="polite"
              aria-atomic="false"
            >
              {times.map((ct) => (
                <Card key={ct.city}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{ct.city}</span>
                      <span className="text-xs text-muted-foreground font-normal">{ct.offset}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-mono">{ct.time}</div>
                    <div className="text-xs text-muted-foreground">{ct.date}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
