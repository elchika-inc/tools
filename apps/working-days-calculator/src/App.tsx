import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Plus, Trash2, Copy } from 'lucide-react';
import {
  calculateWorkingDays,
  addWorkingDays,
  type WorkingDaysResult,
} from '@/utils/workingDays';
import { toast, ToastToaster } from "@/components/ui/toast";

const today = new Date().toISOString().slice(0, 10);

export default function App() {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [result, setResult] = useState<WorkingDaysResult | null>(null);
  const [customHolidays, setCustomHolidays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState('');

  // Reverse mode
  const [reverseStart, setReverseStart] = useState(today);
  const [reverseWorkDays, setReverseWorkDays] = useState('');
  const [reverseResult, setReverseResult] = useState<string | null>(null);
  const handleCalculate = () => {
    if (!startDate || !endDate) {
      toast.add({ title: '日付を入力してください', type: "error" });
      return;
    }
    try {
      const res = calculateWorkingDays(startDate, endDate, customHolidays);
      setResult(res);
    } catch (e) {
      toast.add({
        title: '計算エラー',
        description: e instanceof Error ? e.message : '',
        type: "error",
      });
    }
  };

  const handleReverseCalculate = () => {
    const n = Number(reverseWorkDays);
    if (!reverseStart || !n || n <= 0) {
      toast.add({ title: '開始日と営業日数を入力してください', type: "error" });
      return;
    }
    try {
      const endDateStr = addWorkingDays(reverseStart, n, customHolidays);
      setReverseResult(endDateStr);
    } catch (e) {
      toast.add({
        title: '計算エラー',
        description: e instanceof Error ? e.message : '',
        type: "error",
      });
    }
  };

  const addCustomHoliday = () => {
    if (!newHoliday) return;
    if (customHolidays.includes(newHoliday)) {
      toast.add({ title: 'その日付は既に追加されています', type: "error" });
      return;
    }
    setCustomHolidays((prev) => [...prev, newHoliday].sort());
    setNewHoliday('');
  };

  const removeCustomHoliday = (date: string) => {
    setCustomHolidays((prev) => prev.filter((d) => d !== date));
  };

  const copyResult = async () => {
    if (!result) return;
    const text = [
      `期間: ${result.startDate} ~ ${result.endDate}`,
      `総日数: ${result.totalDays}日`,
      `営業日: ${result.workingDays}日`,
      `土日: ${result.weekendDays}日`,
      `祝日: ${result.holidayDays}日`,
    ].join('\n');
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
            <h1 className="text-3xl font-bold tracking-tight">営業日計算ツール</h1>
            <p className="text-muted-foreground">
              期間内の営業日数を計算。日本の祝日(2024-2027)に対応。カスタム休日追加可能。
            </p>
          </header>

          {/* Period Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>期間から営業日数を計算</CardTitle>
              <CardDescription>開始日から終了日までの営業日数を計算</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3 items-end">
                <div className="space-y-2">
                  <Label htmlFor="startDate">開始日</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">終了日</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={handleCalculate}>
                  <Calculator className="mr-2 h-4 w-4" /> 計算
                </Button>
              </div>

              {result && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">総日数</p>
                      <p className="text-2xl font-bold">{result.totalDays}日</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">営業日</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {result.workingDays}日
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">土日</p>
                      <p className="text-2xl font-bold text-muted-foreground">
                        {result.weekendDays}日
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">祝日</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {result.holidayDays}日
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

          {/* Reverse Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>営業日数から終了日を計算</CardTitle>
              <CardDescription>
                開始日からN営業日後の日付を計算
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3 items-end">
                <div className="space-y-2">
                  <Label htmlFor="reverseStart">開始日</Label>
                  <Input
                    id="reverseStart"
                    type="date"
                    value={reverseStart}
                    onChange={(e) => setReverseStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reverseWorkDays">営業日数</Label>
                  <Input
                    id="reverseWorkDays"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={reverseWorkDays}
                    onChange={(e) => setReverseWorkDays(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={handleReverseCalculate}>
                  <Calculator className="mr-2 h-4 w-4" /> 計算
                </Button>
              </div>

              {reverseResult && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {reverseStart} から {reverseWorkDays} 営業日後
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{reverseResult}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Holidays */}
          <Card>
            <CardHeader>
              <CardTitle>カスタム休日</CardTitle>
              <CardDescription>
                会社独自の休日を追加できます(日本の祝日は自動的に含まれます)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-end">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="newHoliday">休日を追加</Label>
                  <Input
                    id="newHoliday"
                    type="date"
                    value={newHoliday}
                    onChange={(e) => setNewHoliday(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={addCustomHoliday}>
                  <Plus className="mr-2 h-4 w-4" /> 追加
                </Button>
              </div>

              {customHolidays.length > 0 && (
                <div className="space-y-1">
                  {customHolidays.map((date) => (
                    <div
                      key={date}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span className="text-sm">{date}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomHoliday(date)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
