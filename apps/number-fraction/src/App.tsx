import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  addFractions,
  decimalToFraction,
  formatFraction,
  fractionToDecimal,
  multiplyFractions,
} from "@/utils/fraction";
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [decimal, setDecimal] = useState("");
  const [num1, setNum1] = useState("");
  const [den1, setDen1] = useState("");
  const [num2, setNum2] = useState("");
  const [den2, setDen2] = useState("");

  const fraction = useMemo(() => {
    const n = Number(decimal);
    if (Number.isNaN(n) || decimal === "") return null;
    return decimalToFraction(n);
  }, [decimal]);

  const f1 = useMemo(
    () => ({ numerator: Number(num1) || 0, denominator: Number(den1) || 1 }),
    [num1, den1],
  );
  const f2 = useMemo(
    () => ({ numerator: Number(num2) || 0, denominator: Number(den2) || 1 }),
    [num2, den2],
  );
  const sum = useMemo(
    () => (num1 && den1 && num2 && den2 ? addFractions(f1, f2) : null),
    [num1, den1, num2, den2, f1, f2],
  );
  const product = useMemo(
    () => (num1 && den1 && num2 && den2 ? multiplyFractions(f1, f2) : null),
    [num1, den1, num2, den2, f1, f2],
  );

  const cls =
    "flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-center focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Fraction Calculator</h1>
            <p className="text-muted-foreground">小数を分数に変換、分数の四則演算を行います。</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">小数 → 分数</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="decimal">小数</Label>
                    <input
                      id="decimal"
                      type="number"
                      step="any"
                      value={decimal}
                      onChange={(e) => setDecimal(e.target.value)}
                      placeholder="0.75"
                      className={`${cls} w-32`}
                    />
                  </div>
                  {fraction && (
                    <div className="text-2xl font-bold font-mono">
                      {formatFraction(fraction)} ={" "}
                      {fractionToDecimal(fraction.numerator, fraction.denominator)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">分数の演算</CardTitle>
                <CardDescription>2つの分数の加算/乗算を行います。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-center">
                    <input
                      type="number"
                      value={num1}
                      onChange={(e) => setNum1(e.target.value)}
                      placeholder="1"
                      aria-label="分数1の分子"
                      className={cls}
                    />
                    <div className="border-t border-foreground mx-1 my-1" />
                    <input
                      type="number"
                      value={den1}
                      onChange={(e) => setDen1(e.target.value)}
                      placeholder="2"
                      aria-label="分数1の分母"
                      className={cls}
                    />
                  </div>
                  <span className="text-xl font-bold">+/x</span>
                  <div className="text-center">
                    <input
                      type="number"
                      value={num2}
                      onChange={(e) => setNum2(e.target.value)}
                      placeholder="1"
                      aria-label="分数2の分子"
                      className={cls}
                    />
                    <div className="border-t border-foreground mx-1 my-1" />
                    <input
                      type="number"
                      value={den2}
                      onChange={(e) => setDen2(e.target.value)}
                      placeholder="3"
                      aria-label="分数2の分母"
                      className={cls}
                    />
                  </div>
                </div>
                {sum && product && (
                  <div className="space-y-2 text-lg font-mono">
                    <div>
                      加算: {formatFraction(f1)} + {formatFraction(f2)} ={" "}
                      <span className="font-bold">{formatFraction(sum)}</span>
                    </div>
                    <div>
                      乗算: {formatFraction(f1)} x {formatFraction(f2)} ={" "}
                      <span className="font-bold">{formatFraction(product)}</span>
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
