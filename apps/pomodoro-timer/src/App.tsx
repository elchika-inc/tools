import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Settings, BarChart3 } from 'lucide-react';
import {
  type TimerPhase,
  type PomodoroSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  getPhaseDuration,
  getNextPhase,
  getPhaseLabel,
  formatTime,
  recordSession,
  loadStats,
  getTodayStats,
  getWeekStats,
  playBeep,
} from '@/utils/pomodoroTimer';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [settings, setSettings] = useState<PomodoroSettings>(loadSettings);
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [timeLeft, setTimeLeft] = useState(() => getPhaseDuration('work', loadSettings()));
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(loadStats);
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = getPhaseDuration(phase, settings);
  const progress = timeLeft / totalDuration;

  const handlePhaseComplete = useCallback(() => {
    playBeep();
    if (phase === 'work') {
      const newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);
      const updatedStats = recordSession(settings.workDuration);
      setStats(updatedStats);
      toast.add({ title: 'Work session complete!' });
    } else {
      toast.add({ title: 'Break is over. Time to work!' });
    }
    const nextPhase = getNextPhase(phase, completedCycles, settings);
    setPhase(nextPhase);
    setTimeLeft(getPhaseDuration(nextPhase, settings));
    setIsRunning(false);
  }, [phase, completedCycles, settings, toast]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handlePhaseComplete]);

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(getPhaseDuration('work', settings));
    setCompletedCycles(0);
  };

  const handleSaveSettings = () => {
    saveSettings(tempSettings);
    setSettings(tempSettings);
    if (!isRunning) {
      setTimeLeft(getPhaseDuration(phase, tempSettings));
    }
    setShowSettings(false);
    toast.add({ title: 'Settings saved' });
  };

  const phaseColors: Record<TimerPhase, string> = {
    work: '#ef4444',
    shortBreak: '#22c55e',
    longBreak: '#3b82f6',
  };

  const strokeColor = phaseColors[phase];
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const todayStats = getTodayStats(stats);
  const weekStats = getWeekStats(stats);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-2xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
            <p className="text-muted-foreground">
              Stay focused with the Pomodoro Technique. Work, break, repeat.
            </p>
          </header>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-6">
                <div
                  className="text-lg font-semibold px-4 py-1 rounded-full"
                  style={{ backgroundColor: `${strokeColor}20`, color: strokeColor }}
                >
                  {getPhaseLabel(phase)}
                </div>

                <div className="relative w-56 h-56">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-mono font-bold">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" size="lg" onClick={handleStartPause}>
                    {isRunning ? (
                      <>
                        <Pause className="mr-2 h-5 w-5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" /> Start
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-5 w-5" /> Reset
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Session {(completedCycles % settings.cyclesBeforeLongBreak) + 1} of{' '}
                  {settings.cyclesBeforeLongBreak} | Total completed: {completedCycles}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTempSettings(settings);
                setShowSettings(!showSettings);
                setShowStats(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowStats(!showStats);
                setShowSettings(false);
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4" /> Statistics
            </Button>
          </div>

          {showSettings && (
            <Card>
              <CardHeader>
                <CardTitle>Timer Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work">Work (min)</Label>
                    <Input
                      id="work"
                      type="number"
                      min={1}
                      max={120}
                      value={tempSettings.workDuration}
                      onChange={(e) =>
                        setTempSettings({ ...tempSettings, workDuration: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortBreak">Short Break (min)</Label>
                    <Input
                      id="shortBreak"
                      type="number"
                      min={1}
                      max={60}
                      value={tempSettings.shortBreakDuration}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          shortBreakDuration: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longBreak">Long Break (min)</Label>
                    <Input
                      id="longBreak"
                      type="number"
                      min={1}
                      max={60}
                      value={tempSettings.longBreakDuration}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          longBreakDuration: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cycles">Cycles before long break</Label>
                    <Input
                      id="cycles"
                      type="number"
                      min={1}
                      max={10}
                      value={tempSettings.cyclesBeforeLongBreak}
                      onChange={(e) =>
                        setTempSettings({
                          ...tempSettings,
                          cyclesBeforeLongBreak: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleSaveSettings}>
                    Save Settings
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTempSettings(DEFAULT_SETTINGS)}
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showStats && (
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold">{todayStats.sessions} sessions</p>
                    <p className="text-sm text-muted-foreground">{todayStats.minutes} minutes</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">{weekStats.sessions} sessions</p>
                    <p className="text-sm text-muted-foreground">{weekStats.minutes} minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
