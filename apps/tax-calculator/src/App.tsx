import { useState } from 'react';
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
import { ArrowRightLeft, Plus, Trash2, Copy, Calculator } from 'lucide-react';
import {
  calculateTax,
  calculateBatch,
  type TaxRate,
  type TaxResult,
  type BatchItem,
} from '@/utils/taxCalculator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState<TaxRate>(0.1);
  const [isInclusive, setIsInclusive] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchName, setBatchName] = useState('');
  const [batchAmount, setBatchAmount] = useState('');
  const [batchRate, setBatchRate] = useState<TaxRate>(0.1);
  const [batchIsInclusive, setBatchIsInclusive] = useState(false);
  const handleCalculate = () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num < 0) {
      toast.add({ title: '正の数値を入力してください', type: "error" });
      return;
    }
    try {
      setResult(calculateTax(num, rate, isInclusive));
    } catch (e) {
      toast.add({ title: '計算エラー', type: "error" });
    }
  };

  const toggleDirection = () => {
    setIsInclusive((prev) => !prev);
    setResult(null);
  };

  const addBatchItem = () => {
    const num = Number(batchAmount);
    if (!batchAmount || isNaN(num) || num < 0) {
      toast.add({ title: '正の金額を入力してください', type: "error" });
      return;
    }
    setBatchItems((prev) => [
      ...prev,
      {
        name: batchName || `品目 ${prev.length + 1}`,
        amount: num,
        rate: batchRate,
        isInclusive: batchIsInclusive,
      },
    ]);
    setBatchName('');
    setBatchAmount('');
  };

  const removeBatchItem = (index: number) => {
    setBatchItems((prev) => prev.filter((_, i) => i !== index));
  };

  const batchResult = batchItems.length > 0 ? calculateBatch(batchItems) : null;

  const formatCurrency = (n: number) =>
    n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });

  const copyResult = async () => {
    if (!result) return;
    const text = `税抜: ${formatCurrency(result.exclusive)}\n税込: ${formatCurrency(result.inclusive)}\n消費税: ${formatCurrency(result.tax)} (${result.rate * 100}%)`;
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'コピーしました' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4 md:p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">消費税計算ツール</h1>
            <p className="text-muted-foreground">
              税込・税抜の相互変換。標準税率(10%)と軽減税率(8%)に対応。
            </p>
          </header>

          {/* Single Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>単品計算</CardTitle>
              <CardDescription>
                {isInclusive ? '税込金額 → 税抜金額' : '税抜金額 → 税込金額'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {isInclusive ? '税込金額' : '税抜金額'}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setResult(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>税率</Label>
                  <Select
                    value={String(rate)}
                    onValueChange={(v) => {
                      setRate(Number(v) as TaxRate);
                      setResult(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">10% (標準税率)</SelectItem>
                      <SelectItem value="0.08">8% (軽減税率)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button type="button" onClick={handleCalculate} className="flex-1">
                    <Calculator className="mr-2 h-4 w-4" /> 計算
                  </Button>
                  <Button type="button" variant="outline" onClick={toggleDirection} aria-label="Toggle calculation direction">
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {result && (
                <div className="mt-4 rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">税抜金額</p>
                      <p className="text-xl font-bold">{formatCurrency(result.exclusive)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        消費税 ({result.rate * 100}%)
                      </p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(result.tax)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">税込金額</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(result.inclusive)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t">
                    <Button type="button" variant="outline" size="sm" onClick={copyResult}>
                      <Copy className="mr-2 h-3 w-3" /> コピー
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Batch Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>一括計算</CardTitle>
              <CardDescription>複数品目をまとめて計算</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-5 items-end">
                <div className="space-y-2">
                  <Label htmlFor="batchName">品名</Label>
                  <Input
                    id="batchName"
                    placeholder="品名"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchAmount">金額</Label>
                  <Input
                    id="batchAmount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={batchAmount}
                    onChange={(e) => setBatchAmount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addBatchItem()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>税率</Label>
                  <Select
                    value={String(batchRate)}
                    onValueChange={(v) => setBatchRate(Number(v) as TaxRate)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">10%</SelectItem>
                      <SelectItem value="0.08">8%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>入力形式</Label>
                  <Select
                    value={batchIsInclusive ? 'inclusive' : 'exclusive'}
                    onValueChange={(v) => setBatchIsInclusive(v === 'inclusive')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exclusive">税抜</SelectItem>
                      <SelectItem value="inclusive">税込</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={addBatchItem}>
                  <Plus className="mr-2 h-4 w-4" /> 追加
                </Button>
              </div>

              {batchItems.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">品名</th>
                        <th className="text-right py-2 px-2">税抜</th>
                        <th className="text-right py-2 px-2">消費税</th>
                        <th className="text-right py-2 px-2">税込</th>
                        <th className="text-center py-2 px-2">税率</th>
                        <th className="py-2 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResult?.items.map((item, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2 px-2">{item.name}</td>
                          <td className="text-right py-2 px-2">
                            {formatCurrency(item.exclusive)}
                          </td>
                          <td className="text-right py-2 px-2 text-orange-600">
                            {formatCurrency(item.tax)}
                          </td>
                          <td className="text-right py-2 px-2 text-blue-600">
                            {formatCurrency(item.inclusive)}
                          </td>
                          <td className="text-center py-2 px-2">
                            {item.rate * 100}%
                          </td>
                          <td className="py-2 px-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBatchItem(i)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold border-t-2">
                        <td className="py-2 px-2">合計</td>
                        <td className="text-right py-2 px-2">
                          {formatCurrency(batchResult?.totalExclusive ?? 0)}
                        </td>
                        <td className="text-right py-2 px-2 text-orange-600">
                          {formatCurrency(batchResult?.totalTax ?? 0)}
                        </td>
                        <td className="text-right py-2 px-2 text-blue-600">
                          {formatCurrency(batchResult?.totalInclusive ?? 0)}
                        </td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
