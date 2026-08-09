import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calcRetirement } from '@/utils/retirement';

const fmt = (n: number) =>
  n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

export default function App() {
  const [currentAge, setCurrentAge] = useState('35');
  const [retireAge, setRetireAge] = useState('65');
  const [targetAge, setTargetAge] = useState('90');
  const [currentAssets, setCurrentAssets] = useState('5000000');
  const [monthlyContribution, setMonthlyContribution] = useState('30000');
  const [monthlyExpense, setMonthlyExpense] = useState('200000');
  const [rate, setRate] = useState('3');

  const result = useMemo(() => {
    try {
      return calcRetirement({
        currentAge: Number(currentAge),
        retireAge: Number(retireAge),
        targetAge: Number(targetAge),
        currentAssets: Number(currentAssets),
        monthlyContribution: Number(monthlyContribution),
        monthlyExpenseAfterRetire: Number(monthlyExpense),
        annualRate: Number(rate),
      });
    } catch {
      return null;
    }
  }, [currentAge, retireAge, targetAge, currentAssets, monthlyContribution, monthlyExpense, rate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <header>
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">老後資金シミュレーション</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">積立フェーズ・取崩しフェーズの資産推移を計算します</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAge">現在年齢</Label>
              <Input
                id="currentAge"
                type="number"
                min="20"
                max="80"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retireAge">退職年齢</Label>
              <Input
                id="retireAge"
                type="number"
                min="50"
                max="80"
                value={retireAge}
                onChange={(e) => setRetireAge(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAge">目標寿命</Label>
              <Input
                id="targetAge"
                type="number"
                min="70"
                max="110"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">年利 (%)</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>資産・収支</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAssets">現在の資産 (円)</Label>
              <Input
                id="currentAssets"
                type="number"
                min="0"
                value={currentAssets}
                onChange={(e) => setCurrentAssets(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">月積立額 (円)</Label>
              <Input
                id="monthlyContribution"
                type="number"
                min="0"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="monthlyExpense">退職後の月支出 (円)</Label>
              <Input
                id="monthlyExpense"
                type="number"
                min="0"
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {result ? (
          <Card>
            <CardHeader>
              <CardTitle>シミュレーション結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">退職時資産</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-sm mt-1">
                    {fmt(result.assetsAtRetirement)}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 text-center ${
                    result.depletionAge
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : 'bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">資産枯渇年齢</p>
                  <p
                    className={`font-bold text-sm mt-1 ${
                      result.depletionAge
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {result.depletionAge ? `${Math.floor(result.depletionAge)}歳` : '枯渇なし'}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400">
                      <th className="pb-2 pr-4">年齢</th>
                      <th className="pb-2 pr-4">残高</th>
                      <th className="pb-2">フェーズ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyBreakdown
                      .filter((_, i) => i % 5 === 0)
                      .map((entry) => (
                        <tr
                          key={entry.age}
                          className="border-t border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-1 pr-4">{entry.age}歳</td>
                          <td className="py-1 pr-4">{fmt(entry.balance)}</td>
                          <td className="py-1 text-xs text-gray-500 dark:text-gray-400">
                            {entry.phase === 'accumulation' ? '積立' : '取崩し'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-red-500 text-center">
                入力値を確認してください（退職年齢は現在年齢以上、目標寿命は退職年齢より大きくしてください）
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
