import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { calcCalorieBurn, EXERCISES, type CalorieBurnResult } from '@/utils/calorieBurn';

const CATEGORIES = Array.from(new Set(EXERCISES.map((e) => e.category)));

interface ExerciseEntry {
  id: string;
  exerciseId: string;
  minutes: string;
}

let counter = 0;
const newId = () => String(++counter);

export default function App() {
  const [weight, setWeight] = useState('60');
  const [entries, setEntries] = useState<ExerciseEntry[]>([
    { id: newId(), exerciseId: 'walk_normal', minutes: '30' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  const addEntry = () =>
    setEntries((prev) => [
      ...prev,
      { id: newId(), exerciseId: EXERCISES.find((e) => e.category === selectedCategory)?.id ?? EXERCISES[0].id, minutes: '30' },
    ]);

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const updateEntry = (id: string, field: 'exerciseId' | 'minutes', value: string) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const totalResult = useMemo(() => {
    const w = Number(weight);
    if (!w) return null;
    let totalKcal = 0;
    let totalFatGrams = 0;
    for (const entry of entries) {
      const ex = EXERCISES.find((e) => e.id === entry.exerciseId);
      if (!ex) continue;
      try {
        const r = calcCalorieBurn(w, ex.met, Number(entry.minutes));
        totalKcal += r.kcal;
        totalFatGrams += r.fatGrams;
      } catch { /* skip invalid entries */ }
    }
    return { kcal: totalKcal, fatGrams: totalFatGrams };
  }, [weight, entries]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Calorie Burn Calculator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">運動種目別消費カロリー計算（MET値使用）</p>
        </header>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>体重 (kg)</Label>
              <Input type="number" min="1" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-32" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>運動リスト</CardTitle>
              <div className="flex gap-2 items-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                  <Plus className="h-4 w-4 mr-1" />追加
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.map((entry) => {
              const ex = EXERCISES.find((e) => e.id === entry.exerciseId);
              let result: CalorieBurnResult | null = null;
              if (ex && Number(weight) > 0) {
                try {
                  result = calcCalorieBurn(Number(weight), ex.met, Number(entry.minutes));
                } catch { /* skip */ }
              }
              return (
                <div key={entry.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Select value={entry.exerciseId} onValueChange={(v) => updateEntry(entry.id, 'exerciseId', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EXERCISES.map((e) => (
                          <SelectItem key={e.id} value={e.id}>{e.name} (MET {e.met})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input type="number" min="0" placeholder="分" value={entry.minutes} onChange={(e) => updateEntry(entry.id, 'minutes', e.target.value)} />
                  </div>
                  {result && (
                    <div className="text-sm text-right w-20 pt-2">
                      <p className="font-bold text-orange-600 dark:text-orange-400">{result.kcal.toFixed(0)} kcal</p>
                    </div>
                  )}
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {totalResult && totalResult.kcal > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-gray-500 text-sm">合計消費カロリー</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalResult.kcal.toFixed(0)} kcal</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">脂肪燃焼量（推定）</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalResult.fatGrams.toFixed(1)} g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
