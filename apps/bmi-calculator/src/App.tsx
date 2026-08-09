import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calcBMI, getIdealWeightRange } from '@/utils/bmi';

const CATEGORY_COLORS: Record<string, string> = {
  underweight: 'text-blue-600 dark:text-blue-400',
  normal: 'text-green-600 dark:text-green-400',
  obese1: 'text-yellow-600 dark:text-yellow-400',
  obese2: 'text-orange-600 dark:text-orange-400',
  obese3: 'text-red-600 dark:text-red-400',
  obese4: 'text-red-800 dark:text-red-300',
};

export default function App() {
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('60');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const toMetric = (h: string, w: string) => {
    if (unit === 'metric') return { h: Number(h), w: Number(w) };
    return { h: Number(h) * 2.54, w: Number(w) * 0.453592 };
  };

  const { h: heightCm, w: weightKg } = toMetric(height, weight);

  const result = useMemo(() => {
    try { return calcBMI(heightCm, weightKg); }
    catch { return null; }
  }, [heightCm, weightKg]);

  const range = useMemo(() => {
    try { return getIdealWeightRange(heightCm); }
    catch { return null; }
  }, [heightCm]);

  const bmiPercent = result ? Math.min(100, Math.max(0, ((result.bmi - 10) / 40) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <header>
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">BMI Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">BMI・標準体重・肥満度計算（日本肥満学会基準）</p>
        </header>

        <div className="flex gap-2">
          <Button type="button" variant={unit === 'metric' ? 'default' : 'outline'} onClick={() => {
            if (unit !== 'metric') {
              setHeight(String(Math.round(Number(height) * 2.54)));
              setWeight(String(Math.round(Number(weight) * 0.453592)));
            }
            setUnit('metric');
          }}>cm / kg</Button>
          <Button type="button" variant={unit === 'imperial' ? 'default' : 'outline'} onClick={() => {
            if (unit !== 'imperial') {
              setHeight(String(Math.round(Number(height) / 2.54)));
              setWeight(String(Math.round(Number(weight) / 0.453592)));
            }
            setUnit('imperial');
          }}>in / lb</Button>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>身長 ({unit === 'metric' ? 'cm' : 'in'})</Label>
                <Input type="number" min="50" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>体重 ({unit === 'metric' ? 'kg' : 'lb'})</Label>
                <Input type="number" min="1" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <>
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <p className="text-gray-500">BMI</p>
                <p className={`text-5xl font-bold ${CATEGORY_COLORS[result.category]}`}>
                  {result.bmi.toFixed(1)}
                </p>
                <p className={`text-lg font-semibold ${CATEGORY_COLORS[result.category]}`}>
                  {result.label}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-red-500"
                    style={{ width: `${bmiPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">10 ← BMI → 50</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-gray-500">標準体重</p>
                  <p className="text-xl font-bold">{result.standardWeight.toFixed(1)} kg</p>
                  <p className="text-xs text-gray-400">(BMI 22)</p>
                </CardContent>
              </Card>
              {range && (
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-gray-500">健康体重範囲</p>
                    <p className="text-sm font-bold">{range.min.toFixed(1)}〜{range.max.toFixed(1)} kg</p>
                    <p className="text-xs text-gray-400">(BMI 18.5〜24.9)</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
