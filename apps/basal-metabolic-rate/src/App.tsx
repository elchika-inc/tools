import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  calcHarrisBenedict, calcMifflin, calcTDEE,
  ACTIVITY_LEVELS, type ActivityLevel,
} from '@/utils/bmr';

type Formula = 'harris' | 'mifflin';

const fmt = (n: number) => Math.round(n).toLocaleString('ja-JP');

export default function App() {
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [formula, setFormula] = useState<Formula>('mifflin');

  const params = {
    heightCm: Number(height),
    weightKg: Number(weight),
    age: Number(age),
    gender,
  };

  const result = useMemo(() => {
    try {
      const bmrHarris = calcHarrisBenedict(params);
      const bmrMifflin = calcMifflin(params);
      const bmr = formula === 'harris' ? bmrHarris : bmrMifflin;
      const tdee = calcTDEE(bmr, activity);
      return { bmrHarris, bmrMifflin, bmr, tdee };
    } catch { return null; }
  }, [height, weight, age, gender, activity, formula]);

  const targets = result ? [
    { label: '減量 (−500kcal)', kcal: result.tdee - 500 },
    { label: '維持', kcal: result.tdee },
    { label: '増量 (+500kcal)', kcal: result.tdee + 500 },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Basal Metabolic Rate</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">基礎代謝・1日の必要カロリー計算</p>
        </header>

        <Card>
          <CardHeader><CardTitle>身体情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>身長 (cm)</Label><Input type="number" min="100" max="250" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
              <div className="space-y-2"><Label>体重 (kg)</Label><Input type="number" min="20" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
              <div className="space-y-2"><Label>年齢</Label><Input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>性別</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={gender === 'male' ? 'default' : 'outline'} onClick={() => setGender('male')}>男性</Button>
                  <Button type="button" variant={gender === 'female' ? 'default' : 'outline'} onClick={() => setGender('female')}>女性</Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>活動レベル</Label>
              <Select value={activity} onValueChange={(v) => setActivity(v as ActivityLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.label} — {a.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>計算式</Label>
              <div className="flex gap-2">
                <Button type="button" variant={formula === 'mifflin' ? 'default' : 'outline'} onClick={() => setFormula('mifflin')}>Mifflin-St Jeor</Button>
                <Button type="button" variant={formula === 'harris' ? 'default' : 'outline'} onClick={() => setFormula('harris')}>Harris-Benedict</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-gray-500">基礎代謝 (BMR)</p>
                  <p className="text-2xl font-bold">{fmt(result.bmr)} kcal</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-gray-500">1日の消費カロリー (TDEE)</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.tdee)} kcal</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>目標カロリー目安</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {targets.map((t) => (
                  <div key={t.label} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.label}</span>
                    <span className="font-bold">{fmt(t.kcal)} kcal/日</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
