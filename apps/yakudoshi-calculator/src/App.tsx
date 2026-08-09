import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calcYakudoshi } from '@/utils/yakudoshi';
import { ToastToaster } from "@/components/ui/toast";

const TYPE_COLORS: Record<string, string> = {
  main: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold',
  pre: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  post: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  ko: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
};

export default function App() {
  const [birthYear, setBirthYear] = useState(String(new Date().getFullYear() - 30));
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const result = useMemo(() => {
    const year = Number(birthYear);
    if (!year || year < 1900 || year > 2100) return null;
    try { return calcYakudoshi(year, gender); }
    catch { return null; }
  }, [birthYear, gender]);

  const currentYear = new Date().getFullYear();

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <header>
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">厄年カレンダー</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">生まれ年と性別から厄年・小厄を計算</p>
          </header>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>生まれ年（西暦）</Label>
                <Input type="number" min="1900" max="2100" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className="w-36" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant={gender === 'male' ? 'default' : 'outline'} onClick={() => setGender('male')}>男性</Button>
                <Button type="button" variant={gender === 'female' ? 'default' : 'outline'} onClick={() => setGender('female')}>女性</Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader><CardTitle>厄年リスト</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 text-xs mb-3 flex-wrap">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">本厄</span>
                  <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded">前厄・後厄</span>
                  <span className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded">小厄</span>
                </div>
                <div className="space-y-2">
                  {result.entries.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-lg px-4 py-2 ${TYPE_COLORS[entry.type]} ${entry.year === currentYear ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                    >
                      <div>
                        <span className="text-sm font-medium">{entry.label}</span>
                        {entry.year === currentYear && <span className="ml-2 text-xs bg-white/50 dark:bg-black/20 px-1 rounded">今年</span>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.year}年（{entry.waYear}）</p>
                        <p className="text-xs opacity-70">数え年 {entry.age}歳</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
      </div>
  </ToastToaster>;
}
