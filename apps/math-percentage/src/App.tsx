import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addPercent,
  percentChange,
  percentOf,
  subtractPercent,
  whatPercent,
} from "@/utils/percentage";
import { ToastToaster } from "@/components/ui/toast";

function CalcRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const cls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function App() {
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [b1, setB1] = useState("");
  const [b2, setB2] = useState("");
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");

  const r1 = a1 && a2 ? whatPercent(Number(a1), Number(a2)).toFixed(2) : "";
  const r2 = b1 && b2 ? percentOf(Number(b1), Number(b2)).toFixed(2) : "";
  const r3 = c1 && c2 ? percentChange(Number(c1), Number(c2)).toFixed(2) : "";
  const r4a = d1 && d2 ? addPercent(Number(d1), Number(d2)).toFixed(2) : "";
  const r4b = d1 && d2 ? subtractPercent(Number(d1), Number(d2)).toFixed(2) : "";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Percentage Calculator</h1>
            <p className="text-muted-foreground">割合・百分率の各種計算を行います。</p>
          </header>

          <main className="space-y-6">
            <CalcRow title="AはBの何%?">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  value={a1}
                  onChange={(e) => setA1(e.target.value)}
                  placeholder="A"
                  aria-label="元の値 A"
                  className={`${cls} w-28`}
                />
                <span>は</span>
                <input
                  type="number"
                  value={a2}
                  onChange={(e) => setA2(e.target.value)}
                  placeholder="B"
                  aria-label="基準値 B"
                  className={`${cls} w-28`}
                />
                <span>の</span>
                <span className="text-xl font-bold font-mono">{r1 || "?"}%</span>
              </div>
            </CalcRow>

            <CalcRow title="AのB%は?">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  value={b2}
                  onChange={(e) => setB2(e.target.value)}
                  placeholder="A"
                  aria-label="基準値 A"
                  className={`${cls} w-28`}
                />
                <span>の</span>
                <input
                  type="number"
                  value={b1}
                  onChange={(e) => setB1(e.target.value)}
                  placeholder="B"
                  aria-label="パーセント B"
                  className={`${cls} w-28`}
                />
                <span>%は</span>
                <span className="text-xl font-bold font-mono">{r2 || "?"}</span>
              </div>
            </CalcRow>

            <CalcRow title="変化率">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  value={c1}
                  onChange={(e) => setC1(e.target.value)}
                  placeholder="元の値"
                  aria-label="元の値"
                  className={`${cls} w-28`}
                />
                <span>→</span>
                <input
                  type="number"
                  value={c2}
                  onChange={(e) => setC2(e.target.value)}
                  placeholder="新しい値"
                  aria-label="新しい値"
                  className={`${cls} w-28`}
                />
                <span>=</span>
                <span className="text-xl font-bold font-mono">{r3 ? `${r3}%` : "?"}</span>
              </div>
            </CalcRow>

            <CalcRow title="値にX%を加減">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  value={d1}
                  onChange={(e) => setD1(e.target.value)}
                  placeholder="値"
                  aria-label="値"
                  className={`${cls} w-28`}
                />
                <span>に</span>
                <input
                  type="number"
                  value={d2}
                  onChange={(e) => setD2(e.target.value)}
                  placeholder="%"
                  aria-label="パーセント"
                  className={`${cls} w-20`}
                />
                <span>%</span>
              </div>
              {r4a && (
                <div className="flex gap-8 mt-2 text-sm">
                  <div>
                    加算: <span className="font-bold font-mono">{r4a}</span>
                  </div>
                  <div>
                    減算: <span className="font-bold font-mono">{r4b}</span>
                  </div>
                </div>
              )}
            </CalcRow>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
