import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Download, Upload, Flame } from 'lucide-react';
import {
  type HabitData,
  loadData,
  addHabit,
  deleteHabit,
  toggleHabitDay,
  isHabitDoneOnDate,
  calculateStreak,
  getHeatmapData,
  getTodayKey,
  exportData,
  importData,
} from '@/utils/habitTracker';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [data, setData] = useState<HabitData>(loadData);
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState(7);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = getTodayKey();

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.add({ title: 'Please enter a habit name', type: "error" });
      return;
    }
    const updated = addHabit(data, newName.trim(), newFreq);
    setData(updated);
    setNewName('');
    toast.add({ title: 'Habit added' });
  };

  const handleDelete = (habitId: string) => {
    const updated = deleteHabit(data, habitId);
    setData(updated);
    if (selectedHabit === habitId) setSelectedHabit(null);
    toast.add({ title: 'Habit deleted' });
  };

  const handleToggle = (habitId: string, date: string) => {
    const updated = toggleHabitDay(data, habitId, date);
    setData(updated);
  };

  const handleExport = () => {
    const json = exportData(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit-tracker-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.add({ title: 'Data exported' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = importData(ev.target?.result as string);
        setData(imported);
        toast.add({ title: 'Data imported successfully' });
      } catch {
        toast.add({ title: 'Import failed', type: "error" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getLast7Days = (): string[] => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const formatDayLabel = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en', { weekday: 'short' });
  };

  const heatmapColors = ['hsl(var(--muted))', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
            <p className="text-muted-foreground">
              Track your daily habits. Build streaks. Achieve your goals.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Add New Habit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="habitName">Habit Name</Label>
                  <Input
                    id="habitName"
                    placeholder="e.g., Exercise, Read, Meditate..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor="freq">Target / week</Label>
                  <Input
                    id="freq"
                    type="number"
                    min={1}
                    max={7}
                    value={newFreq}
                    onChange={(e) => setNewFreq(Number(e.target.value))}
                  />
                </div>
                <Button type="button" onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {data.habits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Habits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-muted-foreground pb-2 pr-4">
                          Habit
                        </th>
                        {last7Days.map((day) => (
                          <th
                            key={day}
                            className="text-center text-xs font-medium text-muted-foreground pb-2 px-1"
                          >
                            {formatDayLabel(day)}
                          </th>
                        ))}
                        <th className="text-center text-sm font-medium text-muted-foreground pb-2 px-2">
                          <Flame className="h-4 w-4 mx-auto" />
                        </th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {data.habits.map((habit) => {
                        const streak = calculateStreak(data, habit.id);
                        return (
                          <tr key={habit.id} className="border-t">
                            <td className="py-3 pr-4">
                              <button
                                type="button"
                                className="text-sm font-medium hover:text-primary cursor-pointer text-left"
                                onClick={() =>
                                  setSelectedHabit(selectedHabit === habit.id ? null : habit.id)
                                }
                              >
                                {habit.name}
                              </button>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({habit.targetFrequency}x/week)
                              </span>
                            </td>
                            {last7Days.map((day) => {
                              const done = isHabitDoneOnDate(data, habit.id, day);
                              return (
                                <td key={day} className="text-center px-1 py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(habit.id, day)}
                                    className={`w-8 h-8 rounded-md border-2 transition-colors ${
                                      done
                                        ? 'bg-green-500 border-green-600 text-white'
                                        : 'border-muted-foreground/30 hover:border-primary/50'
                                    }`}
                                  >
                                    {done ? '\u2713' : ''}
                                  </button>
                                </td>
                              );
                            })}
                            <td className="text-center px-2 py-3">
                              <span className="text-sm font-bold text-orange-500">{streak}</span>
                            </td>
                            <td className="py-3 pl-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(habit.id)}
                                aria-label="Delete habit"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedHabit && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Heatmap: {data.habits.find((h) => h.id === selectedHabit)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {getHeatmapData(data, selectedHabit, 12).map((cell) => (
                    <div
                      key={cell.date}
                      title={`${cell.date}: ${cell.count ? 'Done' : 'Not done'}`}
                      className="w-3 h-3 rounded-sm cursor-pointer"
                      style={{
                        backgroundColor: cell.count > 0 ? heatmapColors[2] : heatmapColors[0],
                      }}
                      onClick={() => handleToggle(selectedHabit, cell.date)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>Less</span>
                  {heatmapColors.map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
