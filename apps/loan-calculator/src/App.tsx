import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import {
  calculateEqualPayment,
  calculateEqualPrincipal,
  type LoanResult,
} from '@/utils/loanCalculator';
import { toast, ToastToaster } from "@/components/ui/toast";

type Method = 'equal-payment' | 'equal-principal';

export default function App() {
  const [principal, setPrincipal] = useState('');
  const [annualRate, setAnnualRate] = useState('');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [method, setMethod] = useState<Method>('equal-payment');
  const [result, setResult] = useState<LoanResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleCalculate = () => {
    const p = Number(principal);
    const r = Number(annualRate);
    const totalMonths = (Number(years) || 0) * 12 + (Number(months) || 0);

    if (!p || p <= 0) {
      toast.add({ title: '借入額を正の数で入力してください', type: "error" });
      return;
    }
    if (r < 0) {
      toast.add({ title: '金利は0以上を入力してください', type: "error" });
      return;
    }
    if (totalMonths <= 0) {
      toast.add({ title: '返済期間を入力してください', type: "error" });
      return;
    }

    try {
      const input = { principal: p, annualRate: r, totalMonths };
      const res =
        method === 'equal-payment'
          ? calculateEqualPayment(input)
          : calculateEqualPrincipal(input);
      setResult(res);
    } catch (e) {
      toast.add({
        title: '計算エラー',
        description: e instanceof Error ? e.message : '',
        type: "error",
      });
    }
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };

    ctx.clearRect(0, 0, width, height);

    const yearlyData: { year: number; principal: number; interest: number }[] = [];
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (const item of result.schedule) {
      yearPrincipal += item.principalPart;
      yearInterest += item.interestPart;
      if (item.month % 12 === 0 || item.month === result.schedule.length) {
        yearlyData.push({
          year: Math.ceil(item.month / 12),
          principal: yearPrincipal,
          interest: yearInterest,
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    if (yearlyData.length === 0) return;

    const maxVal = Math.max(...yearlyData.map((d) => d.principal + d.interest));
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const barWidth = Math.max(4, chartW / yearlyData.length - 4);

    ctx.strokeStyle = '#ddd';
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + chartH - (chartH * i) / 4;
      const val = (maxVal * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(
        val >= 10000 ? `${Math.round(val / 10000)}万` : String(Math.round(val)),
        padding.left - 5,
        y + 3,
      );
    }

    yearlyData.forEach((d, i) => {
      const x = padding.left + (chartW / yearlyData.length) * i + 2;
      const principalH = maxVal > 0 ? (d.principal / maxVal) * chartH : 0;
      const interestH = maxVal > 0 ? (d.interest / maxVal) * chartH : 0;

      ctx.fillStyle = 'hsl(0, 84%, 60%)';
      ctx.fillRect(x, padding.top + chartH - principalH - interestH, barWidth, interestH);
      ctx.fillStyle = 'hsl(222, 47%, 40%)';
      ctx.fillRect(x, padding.top + chartH - principalH, barWidth, principalH);

      if (yearlyData.length <= 20 || i % Math.ceil(yearlyData.length / 20) === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.year}年`, x + barWidth / 2, height - padding.bottom + 15);
      }
    });

    ctx.fillStyle = 'hsl(222, 47%, 40%)';
    ctx.fillRect(padding.left, height - 15, 12, 12);
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('元金', padding.left + 16, height - 5);

    ctx.fillStyle = 'hsl(0, 84%, 60%)';
    ctx.fillRect(padding.left + 60, height - 15, 12, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('利息', padding.left + 76, height - 5);
  }, [result]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4 md:p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ローン返済シミュレーター</h1>
            <p className="text-muted-foreground">
              元利均等・元金均等の返済シミュレーション。返済スケジュールとグラフを表示。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>入力</CardTitle>
              <CardDescription>借入条件を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="principal">借入額 (円)</Label>
                  <Input
                    id="principal"
                    type="number"
                    min="0"
                    placeholder="10000000"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">年利 (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="3.0"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years">返済期間 (年)</Label>
                  <Input
                    id="years"
                    type="number"
                    min="0"
                    placeholder="35"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="months">+ (月)</Label>
                  <Input
                    id="months"
                    type="number"
                    min="0"
                    max="11"
                    placeholder="0"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>返済方式</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as Method)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal-payment">元利均等返済</SelectItem>
                      <SelectItem value="equal-principal">元金均等返済</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="button" onClick={handleCalculate} className="w-full sm:w-auto">
                <Calculator className="mr-2 h-4 w-4" /> シミュレーション実行
              </Button>
            </CardContent>
          </Card>

          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>結果サマリー</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">
                        {method === 'equal-payment' ? '毎月の返済額' : '初月の返済額'}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(result.monthlyPaymentFirst)}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">返済総額</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(result.totalPayment)}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">利息総額</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(result.totalInterest)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>元金 vs 利息 (年別)</CardTitle>
                </CardHeader>
                <CardContent>
                  <canvas ref={canvasRef} className="w-full" style={{ height: '300px' }} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>返済スケジュール</CardTitle>
                  <CardDescription>全{result.schedule.length}回の返済明細</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">回</th>
                          <th className="text-right py-2 px-2">返済額</th>
                          <th className="text-right py-2 px-2">元金</th>
                          <th className="text-right py-2 px-2">利息</th>
                          <th className="text-right py-2 px-2">残高</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.schedule.map((item) => (
                          <tr key={item.month} className="border-b">
                            <td className="py-1 px-2">{item.month}</td>
                            <td className="text-right py-1 px-2">
                              {formatCurrency(item.payment)}
                            </td>
                            <td className="text-right py-1 px-2">
                              {formatCurrency(item.principalPart)}
                            </td>
                            <td className="text-right py-1 px-2 text-orange-600">
                              {formatCurrency(item.interestPart)}
                            </td>
                            <td className="text-right py-1 px-2">
                              {formatCurrency(item.remainingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>

      </div>
  </ToastToaster>;
}
