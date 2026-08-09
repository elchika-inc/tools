import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calcBreakEven } from '@/utils/breakEven';

const fmt = (n: number) =>
  n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

export default function App() {
  const [fixedCost, setFixedCost] = useState('1000000');
  const [variableRatio, setVariableRatio] = useState('60');
  const [revenue, setRevenue] = useState('3000000');

  const result = useMemo(() => {
    try {
      return calcBreakEven({
        fixedCost: Number(fixedCost),
        variableRatio: Number(variableRatio),
        revenue: Number(revenue),
      });
    } catch {
      return null;
    }
  }, [fixedCost, variableRatio, revenue]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">損益分岐点計算</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">損益分岐点・安全余裕率計算</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>入力</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>固定費 (円)</Label>
              <Input
                type="number"
                min="0"
                value={fixedCost}
                onChange={(e) => setFixedCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>変動費率 (%)</Label>
              <Input
                type="number"
                min="0"
                max="99"
                value={variableRatio}
                onChange={(e) => setVariableRatio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>売上高 (円)</Label>
              <Input
                type="number"
                min="1"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>計算結果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">損益分岐点売上高</p>
                  <p className="font-bold text-yellow-700 dark:text-yellow-400">
                    {fmt(result.breakEvenRevenue)}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 text-center ${result.profit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                >
                  <p className="text-xs text-gray-500">利益</p>
                  <p
                    className={`font-bold ${result.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {fmt(result.profit)}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">安全余裕率</p>
                  <p className="font-bold">{result.safetyMarginRatio.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">営業レバレッジ</p>
                  <p className="font-bold">
                    {isFinite(result.operatingLeverage)
                      ? result.operatingLeverage.toFixed(2)
                      : '∞'}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">貢献利益率</p>
                  <p className="font-bold">{result.contributionMarginRatio.toFixed(1)}%</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">変動費</p>
                  <p className="font-bold">{fmt(result.variableCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
