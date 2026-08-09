import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calcTotal, CO2_CATEGORIES, type CO2Category } from '@/utils/co2Footprint';
import { ToastToaster } from "@/components/ui/toast";

const MONTH_CATEGORIES: CO2Category[] = [
  'electricity', 'gas', 'car', 'beef', 'pork', 'chicken', 'bus', 'train',
];
const YEAR_CATEGORIES: CO2Category[] = ['flight_domestic', 'flight_intl'];

export default function App() {
  const [amounts, setAmounts] = useState<Partial<Record<CO2Category, string>>>({
    electricity: '300',
    gas: '20',
    car: '500',
  });

  const setAmount = (id: CO2Category, value: string) =>
    setAmounts((prev) => ({ ...prev, [id]: value }));

  const result = useMemo(() => {
    const inputs = CO2_CATEGORIES.map((cat) => ({
      categoryId: cat.id,
      amount: Number(amounts[cat.id] ?? 0),
    }));
    try {
      return calcTotal(inputs);
    } catch {
      return null;
    }
  }, [amounts]);

  const monthlyTotal = result
    ? result.perCategory
        .filter((c) => MONTH_CATEGORIES.includes(c.categoryId))
        .reduce((s, c) => s + c.kgCO2, 0)
    : 0;

  const yearlyTotal = result
    ? monthlyTotal * 12 +
      result.perCategory
        .filter((c) => YEAR_CATEGORIES.includes(c.categoryId))
        .reduce((s, c) => s + c.kgCO2, 0)
    : 0;

  const comparisonPct = result
    ? (yearlyTotal / result.japanAverageKgCO2PerYear) * 100
    : 0;

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <header>
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">CO2 Footprint</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">生活行動別CO2排出量計算</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>月間の生活行動</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CO2_CATEGORIES.filter((c) => MONTH_CATEGORIES.includes(c.id)).map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-sm">{cat.label}</Label>
                    <p className="text-xs text-gray-400">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-1 w-40">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={amounts[cat.id] ?? ''}
                      onChange={(e) => setAmount(cat.id, e.target.value)}
                      className="w-24 text-right"
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {cat.unit.split('/')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>年間のフライト</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CO2_CATEGORIES.filter((c) => YEAR_CATEGORIES.includes(c.id)).map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-sm">{cat.label}</Label>
                    <p className="text-xs text-gray-400">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-1 w-40">
                    <Input
                      type="number"
                      min="0"
                      value={amounts[cat.id] ?? ''}
                      onChange={(e) => setAmount(cat.id, e.target.value)}
                      className="w-24 text-right"
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">回</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">月間CO2排出量</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">
                      {monthlyTotal.toFixed(1)} kg
                    </p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">年間CO2排出量（推計）</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {yearlyTotal.toFixed(0)} kg
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">日本人平均（9,000 kg/年）との比較</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${comparisonPct > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, comparisonPct)}%` }}
                    />
                  </div>
                  <p className="text-right text-sm mt-1 font-bold">{comparisonPct.toFixed(0)}%</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
  </ToastToaster>;
}
