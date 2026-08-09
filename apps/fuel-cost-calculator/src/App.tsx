import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calcFuelCost } from '@/utils/fuelCost';

const fmt = (n: number) =>
  n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

export default function App() {
  const [distance, setDistance] = useState('100');
  const [efficiency, setEfficiency] = useState('15');
  const [price, setPrice] = useState('175');

  const result = useMemo(() => {
    try {
      return calcFuelCost({
        distanceKm: Number(distance),
        fuelEfficiencyKmL: Number(efficiency),
        pricePerLiter: Number(price),
      });
    } catch { return null; }
  }, [distance, efficiency, price]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <header>
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Fuel Cost Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">燃費・ガソリン代・CO2排出量計算</p>
        </header>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>走行距離 (km/日)</Label>
              <Input type="number" min="0" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>燃費 (km/L)</Label>
              <Input type="number" min="0.1" step="0.1" value={efficiency} onChange={(e) => setEfficiency(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ガソリン価格 (円/L)</Label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader><CardTitle>計算結果（1日あたり）</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">必要燃料量</p>
                  <p className="font-bold">{result.litersNeeded.toFixed(2)} L</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">燃料代</p>
                  <p className="font-bold text-orange-700 dark:text-orange-400">{fmt(result.fuelCost)}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">CO2排出量</p>
                  <p className="font-bold text-green-700 dark:text-green-400">{result.co2Kg.toFixed(2)} kg</p>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">推計（同じ走行距離で）</p>
                <div className="flex justify-between">
                  <span className="text-sm">月間（×30日）</span>
                  <span className="font-bold">{fmt(result.monthlyEstimate)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">年間（月額×12）</span>
                  <span className="font-bold">{fmt(result.yearlyEstimate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
