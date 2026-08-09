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
  calculateCompoundInterest,
  type CompoundingFrequency,
  type CompoundResult,
} from '@/utils/compoundInterest';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [principal, setPrincipal] = useState('');
  const [annualRate, setAnnualRate] = useState('');
  const [years, setYears] = useState('');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('monthly');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [result, setResult] = useState<CompoundResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleCalculate = () => {
    const p = Number(principal) || 0;
    const r = Number(annualRate);
    const y = Number(years);
    const mc = Number(monthlyContribution) || 0;

    if (p < 0 || isNaN(p)) {
      toast.add({ title: '元本を0以上で入力してください', type: "error" });
      return;
    }
    if (isNaN(r) || r < 0) {
      toast.add({ title: '年利を0以上で入力してください', type: "error" });
      return;
    }
    if (!y || y <= 0) {
      toast.add({ title: '運用期間を入力してください', type: "error" });
      return;
    }

    try {
      const res = calculateCompoundInterest({
        principal: p,
        annualRate: r,
        years: y,
        frequency,
        monthlyContribution: mc,
      });
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

  // Draw line chart
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
    const padding = { top: 20, right: 20, bottom: 40, left: 70 };

    ctx.clearRect(0, 0, width, height);

    const data = result.yearlySnapshots;
    if (data.length === 0) return;

    const maxVal = Math.max(...data.map((d) => d.balance));
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Y-axis grid
    ctx.strokeStyle = '#eee';
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
        val >= 100000000
          ? `${(val / 100000000).toFixed(1)}億`
          : val >= 10000
            ? `${Math.round(val / 10000)}万`
            : String(Math.round(val)),
        padding.left - 5,
        y + 3,
      );
    }

    const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

    // Contributions area (fill)
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartH);
    data.forEach((d, i) => {
      const x = padding.left + xStep * i;
      const y =
        padding.top + chartH - (maxVal > 0 ? (d.totalContributions / maxVal) * chartH : 0);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + xStep * (data.length - 1), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();

    // Balance line
    ctx.beginPath();
    ctx.strokeStyle = 'hsl(222, 47%, 40%)';
    ctx.lineWidth = 2;
    data.forEach((d, i) => {
      const x = padding.left + xStep * i;
      const y = padding.top + chartH - (maxVal > 0 ? (d.balance / maxVal) * chartH : 0);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Contribution line
    ctx.beginPath();
    ctx.strokeStyle = 'hsl(200, 70%, 50%)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    data.forEach((d, i) => {
      const x = padding.left + xStep * i;
      const y =
        padding.top + chartH - (maxVal > 0 ? (d.totalContributions / maxVal) * chartH : 0);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // X labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const labelStep = data.length > 20 ? Math.ceil(data.length / 20) : 1;
    data.forEach((d, i) => {
      if (i % labelStep === 0 || i === data.length - 1) {
        const x = padding.left + xStep * i;
        ctx.fillText(`${d.year}年`, x, height - padding.bottom + 15);
      }
    });

    // Legend
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeStyle = 'hsl(222, 47%, 40%)';
    ctx.moveTo(padding.left, height - 12);
    ctx.lineTo(padding.left + 20, height - 12);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('総額', padding.left + 24, height - 7);

    ctx.beginPath();
    ctx.strokeStyle = 'hsl(200, 70%, 50%)';
    ctx.setLineDash([5, 3]);
    ctx.moveTo(padding.left + 70, height - 12);
    ctx.lineTo(padding.left + 90, height - 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('元本+積立', padding.left + 94, height - 7);
  }, [result]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4 md:p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">複利計算シミュレーター</h1>
            <p className="text-muted-foreground">
              元本・利率・期間・積立額から複利運用の成長をシミュレーション。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>入力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="principal">元本 (円)</Label>
                  <Input
                    id="principal"
                    type="number"
                    min="0"
                    placeholder="1000000"
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
                    placeholder="5.0"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years">運用期間 (年)</Label>
                  <Input
                    id="years"
                    type="number"
                    min="1"
                    placeholder="20"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>複利頻度</Label>
                  <Select
                    value={frequency}
                    onValueChange={(v) => setFrequency(v as CompoundingFrequency)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">毎月</SelectItem>
                      <SelectItem value="quarterly">四半期</SelectItem>
                      <SelectItem value="yearly">毎年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly">毎月積立額 (円)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
              </div>
              <Button type="button" onClick={handleCalculate} className="w-full sm:w-auto">
                <Calculator className="mr-2 h-4 w-4" /> 計算する
              </Button>
            </CardContent>
          </Card>

          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>結果</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">最終金額</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(result.finalAmount)}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">元本+積立合計</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(result.totalContributions)}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">運用益</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(result.totalInterest)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>成長グラフ</CardTitle>
                </CardHeader>
                <CardContent>
                  <canvas ref={canvasRef} className="w-full" style={{ height: '300px' }} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>年別推移</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">年</th>
                          <th className="text-right py-2 px-2">総額</th>
                          <th className="text-right py-2 px-2">元本+積立</th>
                          <th className="text-right py-2 px-2">運用益</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearlySnapshots.map((s) => (
                          <tr key={s.year} className="border-b">
                            <td className="py-1 px-2">{s.year}年目</td>
                            <td className="text-right py-1 px-2 text-blue-600">
                              {formatCurrency(s.balance)}
                            </td>
                            <td className="text-right py-1 px-2">
                              {formatCurrency(s.totalContributions)}
                            </td>
                            <td className="text-right py-1 px-2 text-green-600">
                              {formatCurrency(s.totalInterest)}
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
