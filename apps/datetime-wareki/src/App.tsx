import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ERAS, getCurrentWareki, seirekiToWareki, warekiToSeireki } from "@/utils/wareki";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [day, setDay] = useState(String(new Date().getDate()));
  const [eraKanji, setEraKanji] = useState("令和");
  const [eraYear, setEraYear] = useState("1");

  const wareki = useMemo(() => {
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return "";
    return seirekiToWareki(y, m, d);
  }, [year, month, day]);

  const seireki = useMemo(() => {
    const ey = Number(eraYear);
    if (Number.isNaN(ey)) return null;
    return warekiToSeireki(eraKanji, ey);
  }, [eraKanji, eraYear]);

  const cls = "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">和暦変換</h1>
            <p className="text-muted-foreground">
              西暦と和暦の相互変換を行います。今日: {getCurrentWareki()}
            </p>
          </header>

          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>西暦 → 和暦</CardTitle>
                <CardDescription>西暦の日付を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="wareki-year">年</Label>
                    <input
                      id="wareki-year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className={`${cls} w-24`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wareki-month">月</Label>
                    <input
                      id="wareki-month"
                      type="number"
                      min={1}
                      max={12}
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className={`${cls} w-20`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wareki-day">日</Label>
                    <input
                      id="wareki-day"
                      type="number"
                      min={1}
                      max={31}
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className={`${cls} w-20`}
                    />
                  </div>
                </div>
                {wareki && (
                  <div className="text-2xl font-bold" aria-live="polite" aria-atomic="true">
                    {wareki}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>和暦 → 西暦</CardTitle>
                <CardDescription>元号と年を入力してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="era-select">元号</Label>
                    <select
                      id="era-select"
                      value={eraKanji}
                      onChange={(e) => setEraKanji(e.target.value)}
                      className={`${cls} w-24`}
                    >
                      {ERAS.map((era) => (
                        <option key={era.kanji} value={era.kanji}>
                          {era.kanji}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="era-year">年</Label>
                    <input
                      id="era-year"
                      type="number"
                      min={1}
                      value={eraYear}
                      onChange={(e) => setEraYear(e.target.value)}
                      className={`${cls} w-20`}
                    />
                  </div>
                  <span className="pb-2">年</span>
                </div>
                {seireki !== null && (
                  <div className="text-2xl font-bold" aria-live="polite" aria-atomic="true">
                    西暦 {seireki} 年
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">元号一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {ERAS.map((era) => (
                    <div key={era.kanji} className="flex items-center gap-2 text-sm">
                      <span className="font-bold w-12">{era.kanji}</span>
                      <span className="text-muted-foreground">
                        {era.startYear}年{era.startMonth}月{era.startDay}日~
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
