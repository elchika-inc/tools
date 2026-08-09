import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CATEGORIES, convert } from "@/utils/unitConverter";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [fromUnit, setFromUnit] = useState(CATEGORIES[0].units[0].id);
  const [toUnit, setToUnit] = useState(CATEGORIES[0].units[1].id);
  const [value, setValue] = useState("1");

  const category = CATEGORIES[categoryIdx];

  const result = useMemo(() => {
    const num = Number(value);
    if (Number.isNaN(num)) return "";
    try {
      return convert(num, fromUnit, toUnit, category.name).toLocaleString(undefined, {
        maximumFractionDigits: 10,
      });
    } catch {
      return "";
    }
  }, [value, fromUnit, toUnit, category.name]);

  const allResults = useMemo(() => {
    const num = Number(value);
    if (Number.isNaN(num)) return [];
    return category.units
      .filter((u) => u.id !== fromUnit)
      .map((u) => ({
        label: u.label,
        value: convert(num, fromUnit, u.id, category.name).toLocaleString(undefined, {
          maximumFractionDigits: 10,
        }),
      }));
  }, [value, fromUnit, category]);

  const handleCategoryChange = (idx: number) => {
    setCategoryIdx(idx);
    setFromUnit(CATEGORIES[idx].units[0].id);
    setToUnit(CATEGORIES[idx].units[1]?.id ?? CATEGORIES[idx].units[0].id);
  };

  const cls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Unit Converter</h1>
            <p className="text-muted-foreground">各種単位の相互変換を行います。</p>
          </header>
          <main>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat, i) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => handleCategoryChange(i)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${categoryIdx === i ? "bg-primary text-primary-foreground" : "hover:bg-muted border"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{category.name}変換</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="value">値</Label>
                    <input
                      id="value"
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className={cls}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from">変換元</Label>
                    <select
                      id="from"
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value)}
                      className={cls}
                    >
                      {category.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">変換先</Label>
                    <select
                      id="to"
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value)}
                      className={cls}
                    >
                      {category.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {result && (
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold font-mono">{result}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.units.find((u) => u.id === toUnit)?.label}
                    </div>
                  </div>
                )}
                {allResults.length > 0 && (
                  <div className="pt-4 border-t space-y-1">
                    <Label className="text-xs text-muted-foreground">全単位表示</Label>
                    {allResults.map((r) => (
                      <div key={r.label} className="flex items-center gap-2 text-sm">
                        <span className="w-40 text-muted-foreground">{r.label}</span>
                        <code className="font-mono">{r.value}</code>
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
