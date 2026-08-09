import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Square } from 'lucide-react';
import {
  TIME_SIGNATURES,
  DEFAULT_BPM,
  MIN_BPM,
  MAX_BPM,
  clampBpm,
  bpmToIntervalMs,
  findTimeSignature,
  playClick,
  isAccentBeat,
} from '@/utils/metronome';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatRef = useRef(0);
  const isPlayingRef = useRef(false);
  const ts = findTimeSignature(timeSignature);

  const stopMetronome = useCallback(() => {
    isPlayingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    beatRef.current = 0;
    setCurrentBeat(-1);
    setIsPlaying(false);
  }, []);

  const tick = useCallback(() => {
    if (!isPlayingRef.current || !audioContextRef.current) return;

    const beat = beatRef.current;
    const accent = isAccentBeat(beat);
    const currentTs = findTimeSignature(timeSignature);

    try {
      playClick(audioContextRef.current, accent);
    } catch {
      // Audio playback error
    }

    setCurrentBeat(beat);
    beatRef.current = (beat + 1) % currentTs.beats;

    timerRef.current = setTimeout(() => {
      tick();
    }, bpmToIntervalMs(bpm));
  }, [bpm, timeSignature]);

  const startMetronome = useCallback(() => {
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      beatRef.current = 0;
      isPlayingRef.current = true;
      setIsPlaying(true);
      tick();
    } catch {
      toast.add({ title: 'Failed to start metronome', type: "error" });
    }
  }, [tick, toast]);

  const toggleMetronome = useCallback(() => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [isPlaying, startMetronome, stopMetronome]);

  // Update interval when BPM changes while playing
  useEffect(() => {
    if (isPlaying && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        tick();
      }, bpmToIntervalMs(bpm));
    }
  }, [bpm]);

  // Reset beat when time signature changes
  useEffect(() => {
    beatRef.current = 0;
  }, [timeSignature]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMetronome();
    };
  }, [stopMetronome]);

  const handleBpmInput = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setBpm(clampBpm(num));
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-2xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Audio Metronome</h1>
            <p className="text-muted-foreground">
              Metronome with adjustable BPM, time signature, and visual beat indicator.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Metronome</CardTitle>
              <CardDescription>Set your tempo and time signature.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Beat Indicator */}
              <div className="flex justify-center gap-3 py-6">
                {Array.from({ length: ts.beats }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-100 ${
                      currentBeat === i
                        ? isAccentBeat(i)
                          ? 'bg-primary text-primary-foreground border-primary scale-110'
                          : 'bg-secondary text-secondary-foreground border-secondary scale-110'
                        : 'border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* BPM Display */}
              <div className="text-center">
                <span className="text-6xl font-bold tabular-nums">{bpm}</span>
                <span className="text-2xl text-muted-foreground ml-2">BPM</span>
              </div>

              {/* BPM Slider */}
              <div className="space-y-2">
                <Label htmlFor="bpm">BPM</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="bpm"
                    type="range"
                    min={MIN_BPM}
                    max={MAX_BPM}
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <Input
                    type="number"
                    min={MIN_BPM}
                    max={MAX_BPM}
                    value={bpm}
                    onChange={(e) => handleBpmInput(e.target.value)}
                    className="w-20"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{MIN_BPM}</span>
                  <span>{MAX_BPM}</span>
                </div>
              </div>

              {/* BPM Presets */}
              <div className="flex flex-wrap gap-2">
                {[60, 80, 100, 120, 140, 160, 180, 200].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={bpm === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBpm(preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>

              {/* Time Signature */}
              <div className="space-y-2">
                <Label>Time Signature</Label>
                <Select value={timeSignature} onValueChange={setTimeSignature}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SIGNATURES.map((ts) => (
                      <SelectItem key={ts.label} value={ts.label}>
                        {ts.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start/Stop */}
              <Button
                type="button"
                onClick={toggleMetronome}
                variant={isPlaying ? 'destructive' : 'default'}
                className="w-full h-14 text-lg"
              >
                {isPlaying ? (
                  <>
                    <Square className="mr-2 h-5 w-5" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Start
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
