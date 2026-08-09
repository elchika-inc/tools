import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calcSavings, calcRequiredMonthly } from '@/utils/savings';

type Mode = 'forward' | 'reverse';

const fmt = (n: number) =>
  n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

export default function App() {
  const [mode, setMode] = useState<Mode>('forward');
  const [monthly, setMonthly] = useState('30000');
  const [years, setYears] = useState('20');
  const [rate, setRate] = useState('3');
  const [initial, setInitial] = useState('0');
  const [target, setTarget] = useState('10000000');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fwdResult = useMemo(() => {
    if (mode !== 'forward') return null;
    try {
      return calcSavings({
        monthlyAmount: Number(monthly),
        years: Number(years),
        annualRate: Number(rate),
        initialAmount: Number(initial),
      });
    } catch {
      return null;
    }
  }, [mode, monthly, years, rate, initial]);

  const revResult = useMemo(() => {
    if (mode !== 'reverse') return null;
    try {
      return calcRequiredMonthly(Number(target), Number(years), Number(rate));
    } catch {
      return null;
    }
  }, [mode, target, years, rate]);

  useEffect(() => {
    if (!fwdResult || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { yearlyBreakdown } = fwdResult;
    if (yearlyBreakdown.length === 0) return;
    const W = 560;
    const H = 200;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const pad = 40;
    ctx.clearRect(0, 0, W, H);
    const maxVal = yearlyBreakdown[yearlyBreakdown.length - 1].balance;
    if (maxVal === 0) return;

    // Draw principal area
    ctx.beginPath();
    yearlyBreakdown.forEach((entry, i) => {
      const x =
        yearlyBreakdown.length === 1
          ? W / 2
          : pad + (i / (yearlyBreakdown.length - 1)) * (W - pad * 2);
      const yP = H - pad - (entry.totalPrincipal / maxVal) * (H - pad * 2);
      if (i === 0) ctx.moveTo(x, yP);
      else ctx.lineTo(x, yP);
    });
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw total balance line
    ctx.beginPath();
    yearlyBreakdown.forEach((entry, i) => {
      const x =
        yearlyBreakdown.length === 1
          ? W / 2
          : pad + (i / (yearlyBreakdown.length - 1)) * (W - pad * 2);
      const yB = H - pad - (entry.balance / maxVal) * (H - pad * 2);
      if (i === 0) ctx.moveTo(x, yB);
      else ctx.lineTo(x, yB);
    });
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [fwdResult]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">積立シミュレーション</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">積立額・利息のシミュレーション（積立→残高・目標逆算）</p>
        </header>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === 'forward' ? 'default' : 'outline'}
            onClick={() => setMode('forward')}
          >
            積立額→残高
          </Button>
          <Button
            type="button"
            variant={mode === 'reverse' ? 'default' : 'outline'}
            onClick={() => setMode('reverse')}
          >
            目標額→必要月額
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>条件入力</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'forward' ? (
              <>
                <div className="space-y-2">
                  <Label>初期金額 (円)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={initial}
                    onChange={(e) => setInitial(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>月積立額 (円)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={monthly}
                    onChange={(e) => setMonthly(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>目標金額 (円)</Label>
                <Input
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>運用期間 (年)</Label>
                <Input
                  type="number"
                  min="1"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>年利 (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {fwdResult && (
          <Card>
            <CardHeader>
              <CardTitle>結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">最終残高</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {fmt(fwdResult.total)}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">元本合計</p>
                  <p className="font-bold">{fmt(fwdResult.principal)}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">利息合計</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {fmt(fwdResult.interest)}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-blue-500" />
                  残高
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-slate-400" />
                  元本
                </span>
              </div>
              <canvas ref={canvasRef} width={560} height={200} className="w-full h-40 mt-2" />
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                  年次内訳を表示
                </summary>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-1 pr-4">年</th>
                        <th className="py-1 pr-4 text-right">残高</th>
                        <th className="py-1 pr-4 text-right">元本累計</th>
                        <th className="py-1 text-right">利息累計</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fwdResult.yearlyBreakdown.map((entry) => (
                        <tr key={entry.year} className="border-b border-gray-100">
                          <td className="py-1 pr-4">{entry.year}年</td>
                          <td className="py-1 pr-4 text-right font-medium">
                            {fmt(entry.balance)}
                          </td>
                          <td className="py-1 pr-4 text-right text-gray-600">
                            {fmt(entry.totalPrincipal)}
                          </td>
                          <td className="py-1 text-right text-green-600">
                            {fmt(entry.totalInterest)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </CardContent>
          </Card>
        )}

        {revResult !== null && (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-gray-500">必要月積立額</p>
              <p className="text-4xl font-bold mt-2">{fmt(Math.ceil(revResult))}</p>
              <p className="text-sm text-gray-400 mt-2">
                {Number(years)}年間・年利{Number(rate)}%で{fmt(Number(target))}を達成するために必要な月額
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
