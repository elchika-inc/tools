import { useState, useMemo } from 'react';
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
import { Copy } from 'lucide-react';
import {
  calculateTip,
  calculateTipComparison,
  type RoundingMode,
  type TipResult,
} from '@/utils/tipCalculator';
import { toast, ToastToaster } from "@/components/ui/toast";

const PRESET_TIPS = [10, 15, 18, 20, 25];

export default function App() {
  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [numPeople, setNumPeople] = useState('1');
  const [rounding, setRounding] = useState<RoundingMode>('nearest');
  const bill = Number(billAmount) || 0;
  const tip = isCustom ? Number(customTip) || 0 : tipPercent;
  const people = Math.max(1, Number(numPeople) || 1);

  const result: TipResult | null = useMemo(() => {
    if (bill <= 0) return null;
    try {
      return calculateTip({
        billAmount: bill,
        tipPercent: tip,
        numPeople: people,
        rounding,
      });
    } catch {
      return null;
    }
  }, [bill, tip, people, rounding]);

  const comparison = useMemo(() => {
    if (bill <= 0) return [];
    try {
      return calculateTipComparison(bill, PRESET_TIPS, people, rounding);
    } catch {
      return [];
    }
  }, [bill, people, rounding]);

  const formatCurrency = (n: number) =>
    n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });

  const copyResult = async () => {
    if (!result) return;
    const text = [
      `会計: ${formatCurrency(result.billAmount)}`,
      `チップ (${result.tipPercent}%): ${formatCurrency(result.tipAmount)}`,
      `合計: ${formatCurrency(result.totalAmount)}`,
      result.numPeople > 1
        ? `1人あたり: ${formatCurrency(result.perPersonTotal)}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'コピーしました' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4 md:p-8">
        <main className="max-w-3xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">チップ & 割り勘計算</h1>
            <p className="text-muted-foreground">
              チップ額の計算と割り勘。端数処理オプション付き。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>入力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bill">お会計金額</Label>
                <Input
                  id="bill"
                  type="number"
                  min="0"
                  placeholder="10000"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>チップ率</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TIPS.map((pct) => (
                    <Button
                      key={pct}
                      type="button"
                      variant={!isCustom && tipPercent === pct ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setTipPercent(pct);
                        setIsCustom(false);
                      }}
                    >
                      {pct}%
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant={isCustom ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsCustom(true)}
                  >
                    カスタム
                  </Button>
                </div>
                {isCustom && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="カスタム %"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="people">人数</Label>
                  <Input
                    id="people"
                    type="number"
                    min="1"
                    value={numPeople}
                    onChange={(e) => setNumPeople(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>端数処理</Label>
                  <Select value={rounding} onValueChange={(v) => setRounding(v as RoundingMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nearest">四捨五入</SelectItem>
                      <SelectItem value="up">切り上げ</SelectItem>
                      <SelectItem value="down">切り捨て</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>結果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">チップ ({result.tipPercent}%)</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(result.tipAmount)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">合計</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(result.totalAmount)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      1人あたり ({result.numPeople}人)
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.perPersonTotal)}
                    </p>
                  </div>
                </div>

                {result.numPeople > 1 && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>1人あたり会計: {formatCurrency(result.perPersonBill)}</p>
                    <p>1人あたりチップ: {formatCurrency(result.perPersonTip)}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="mr-2 h-3 w-3" /> コピー
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {comparison.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>チップ率比較</CardTitle>
                <CardDescription>各チップ率での金額一覧</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">チップ率</th>
                        <th className="text-right py-2 px-2">チップ額</th>
                        <th className="text-right py-2 px-2">合計</th>
                        {people > 1 && (
                          <th className="text-right py-2 px-2">1人あたり</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((r) => (
                        <tr
                          key={r.tipPercent}
                          className={`border-b ${
                            r.tipPercent === tip ? 'bg-muted/50 font-medium' : ''
                          }`}
                        >
                          <td className="py-2 px-2">{r.tipPercent}%</td>
                          <td className="text-right py-2 px-2">
                            {formatCurrency(r.tipAmount)}
                          </td>
                          <td className="text-right py-2 px-2">
                            {formatCurrency(r.totalAmount)}
                          </td>
                          {people > 1 && (
                            <td className="text-right py-2 px-2">
                              {formatCurrency(r.perPersonTotal)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
