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
import { Calculator, Plus, Trash2 } from 'lucide-react';
import {
  calculateDiscount,
  type DiscountMode,
  type DiscountInput,
  type DiscountResult,
} from '@/utils/discountCalculator';
import { toast, ToastToaster } from "@/components/ui/toast";

interface CompareItem {
  id: number;
  input: DiscountInput;
  result: DiscountResult | null;
}

let nextId = 1;

export default function App() {
  const [originalPrice, setOriginalPrice] = useState('');
  const [mode, setMode] = useState<DiscountMode>('percentage');
  const [percentageOff, setPercentageOff] = useState('');
  const [amountOff, setAmountOff] = useState('');
  const [buyX, setBuyX] = useState('2');
  const [getY, setGetY] = useState('1');
  const [totalItems, setTotalItems] = useState('3');
  const [bundleSize, setBundleSize] = useState('3');
  const [bundlePrice, setBundlePrice] = useState('');
  const [bundleItems, setBundleItems] = useState('3');
  const [result, setResult] = useState<DiscountResult | null>(null);
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const formatCurrency = (n: number) =>
    n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });

  const buildInput = (): DiscountInput => ({
    originalPrice: Number(originalPrice),
    mode,
    percentageOff: Number(percentageOff),
    amountOff: Number(amountOff),
    buyX: Number(buyX),
    getY: Number(getY),
    totalItems: Number(totalItems),
    bundleSize: Number(bundleSize),
    bundlePrice: Number(bundlePrice),
    bundleItems: Number(bundleItems),
  });

  const handleCalculate = () => {
    const price = Number(originalPrice);
    if (!originalPrice || isNaN(price) || price < 0) {
      toast.add({ title: '正の金額を入力してください', type: "error" });
      return;
    }
    try {
      const input = buildInput();
      const res = calculateDiscount(input);
      setResult(res);
    } catch (e) {
      toast.add({
        title: '計算エラー',
        description: e instanceof Error ? e.message : '',
        type: "error",
      });
    }
  };

  const addToCompare = () => {
    if (!result) return;
    const input = buildInput();
    setCompareList((prev) => [
      ...prev,
      { id: nextId++, input, result },
    ]);
  };

  const removeFromCompare = (id: number) => {
    setCompareList((prev) => prev.filter((item) => item.id !== id));
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4 md:p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">割引計算ツール</h1>
            <p className="text-muted-foreground">
              パーセント割引、金額割引、まとめ買い割引など様々な割引を計算。比較機能付き。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>割引計算</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {mode === 'buyXgetY' || mode === 'bundle' ? '単価 (円)' : '元の価格 (円)'}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={originalPrice}
                    onChange={(e) => {
                      setOriginalPrice(e.target.value);
                      setResult(null);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>割引タイプ</Label>
                  <Select
                    value={mode}
                    onValueChange={(v) => {
                      setMode(v as DiscountMode);
                      setResult(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">パーセント割引 (%)</SelectItem>
                      <SelectItem value="amount">金額割引 (円)</SelectItem>
                      <SelectItem value="buyXgetY">X個買うとY個無料</SelectItem>
                      <SelectItem value="bundle">セット価格</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {mode === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="pctOff">割引率 (%)</Label>
                  <Input
                    id="pctOff"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="20"
                    value={percentageOff}
                    onChange={(e) => {
                      setPercentageOff(e.target.value);
                      setResult(null);
                    }}
                  />
                </div>
              )}

              {mode === 'amount' && (
                <div className="space-y-2">
                  <Label htmlFor="amtOff">割引額 (円)</Label>
                  <Input
                    id="amtOff"
                    type="number"
                    min="0"
                    placeholder="200"
                    value={amountOff}
                    onChange={(e) => {
                      setAmountOff(e.target.value);
                      setResult(null);
                    }}
                  />
                </div>
              )}

              {mode === 'buyXgetY' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="buyX">X個買うと</Label>
                    <Input
                      id="buyX"
                      type="number"
                      min="1"
                      value={buyX}
                      onChange={(e) => {
                        setBuyX(e.target.value);
                        setResult(null);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="getY">Y個無料</Label>
                    <Input
                      id="getY"
                      type="number"
                      min="1"
                      value={getY}
                      onChange={(e) => {
                        setGetY(e.target.value);
                        setResult(null);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalItems">購入個数</Label>
                    <Input
                      id="totalItems"
                      type="number"
                      min="1"
                      value={totalItems}
                      onChange={(e) => {
                        setTotalItems(e.target.value);
                        setResult(null);
                      }}
                    />
                  </div>
                </div>
              )}

              {mode === 'bundle' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bundleSize">セット数</Label>
                    <Input
                      id="bundleSize"
                      type="number"
                      min="1"
                      value={bundleSize}
                      onChange={(e) => {
                        setBundleSize(e.target.value);
                        setResult(null);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bundlePrice">セット価格 (円)</Label>
                    <Input
                      id="bundlePrice"
                      type="number"
                      min="0"
                      placeholder="1200"
                      value={bundlePrice}
                      onChange={(e) => {
                        setBundlePrice(e.target.value);
                        setResult(null);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bundleItems">購入個数</Label>
                    <Input
                      id="bundleItems"
                      type="number"
                      min="1"
                      value={bundleItems}
                      onChange={(e) => {
                        setBundleItems(e.target.value);
                        setResult(null);
                      }}
                    />
                  </div>
                </div>
              )}

              <Button type="button" onClick={handleCalculate}>
                <Calculator className="mr-2 h-4 w-4" /> 計算
              </Button>

              {result && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">{result.label}</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">元の価格</p>
                      <p className="text-xl font-bold">{formatCurrency(result.originalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">割引後</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(result.finalPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">お得額</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(result.savingsAmount)} ({result.savingsPercent}%)
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <Button type="button" variant="outline" size="sm" onClick={addToCompare}>
                      <Plus className="mr-2 h-3 w-3" /> 比較リストに追加
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {compareList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>割引比較</CardTitle>
                <CardDescription>複数の割引条件を比較</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">割引内容</th>
                        <th className="text-right py-2 px-2">元価格</th>
                        <th className="text-right py-2 px-2">割引後</th>
                        <th className="text-right py-2 px-2">お得額</th>
                        <th className="text-right py-2 px-2">割引率</th>
                        <th className="py-2 px-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareList.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 px-2">{item.result?.label}</td>
                          <td className="text-right py-2 px-2">
                            {formatCurrency(item.result?.originalPrice ?? 0)}
                          </td>
                          <td className="text-right py-2 px-2 text-blue-600">
                            {formatCurrency(item.result?.finalPrice ?? 0)}
                          </td>
                          <td className="text-right py-2 px-2 text-green-600">
                            {formatCurrency(item.result?.savingsAmount ?? 0)}
                          </td>
                          <td className="text-right py-2 px-2">
                            {item.result?.savingsPercent}%
                          </td>
                          <td className="py-2 px-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCompare(item.id)}
                              aria-label="Remove from comparison"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
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
