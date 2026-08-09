import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { calculateArea, FIELD_LABELS, SHAPES, type ShapeType } from "@/utils/area";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [shape, setShape] = useState<ShapeType>("circle");
  const [params, setParams] = useState<Record<string, number>>({});

  const currentShape = SHAPES.find((s) => s.value === shape) ?? SHAPES[0];
  const area = useMemo(() => calculateArea(shape, params), [shape, params]);

  const cls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Area Calculator</h1>
            <p className="text-muted-foreground">各種図形の面積を計算します。</p>
          </header>
          <main className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {SHAPES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => {
                    setShape(s.value);
                    setParams({});
                  }}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${shape === s.value ? "bg-primary text-primary-foreground" : "hover:bg-muted border"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{currentShape.label}の面積</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentShape.fields.map((field) => (
                  <div key={field} className="space-y-1">
                    <Label htmlFor={`field-${field}`}>{FIELD_LABELS[field] ?? field}</Label>
                    <input
                      id={`field-${field}`}
                      type="number"
                      min={0}
                      step="any"
                      value={params[field] ?? ""}
                      onChange={(e) => setParams((p) => ({ ...p, [field]: Number(e.target.value) }))}
                      className={cls}
                    />
                  </div>
                ))}
                <div className="pt-4 border-t text-center">
                  <div className="text-sm text-muted-foreground">面積</div>
                  <div className="text-3xl font-bold font-mono">
                    {area.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
