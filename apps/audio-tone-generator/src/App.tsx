import { useState, useRef, useCallback } from 'react';
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
  type WaveformType,
  WAVEFORM_TYPES,
  DEFAULT_FREQUENCY,
  DEFAULT_DURATION,
  DEFAULT_VOLUME,
  MIN_FREQUENCY,
  MAX_FREQUENCY,
  clampFrequency,
  clampVolume,
  clampDuration,
  frequencyToNote,
  createToneNodes,
} from '@/utils/toneGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [frequency, setFrequency] = useState(DEFAULT_FREQUENCY);
  const [waveform, setWaveform] = useState<WaveformType>('sine');
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTone = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {
        // Already stopped
      }
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playTone = useCallback(() => {
    stopTone();

    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const { oscillator, gainNode } = createToneNodes(ctx, {
        frequency: clampFrequency(frequency),
        waveform,
        duration: clampDuration(duration),
        volume: clampVolume(volume),
      });

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      oscillator.start();
      setIsPlaying(true);

      timeoutRef.current = setTimeout(() => {
        stopTone();
      }, clampDuration(duration) * 1000);
    } catch {
      toast.add({ title: 'Failed to play tone', type: "error" });
      setIsPlaying(false);
    }
  }, [frequency, waveform, duration, volume, stopTone, toast]);

  const handleFrequencyInputChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setFrequency(clampFrequency(num));
    }
  };

  const handleFrequencySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logMin = Math.log10(MIN_FREQUENCY);
    const logMax = Math.log10(MAX_FREQUENCY);
    const scale = (logMax - logMin) / 100;
    const freq = Math.round(Math.pow(10, logMin + scale * parseFloat(e.target.value)));
    setFrequency(clampFrequency(freq));
  };

  const frequencyToSliderValue = (freq: number): number => {
    const logMin = Math.log10(MIN_FREQUENCY);
    const logMax = Math.log10(MAX_FREQUENCY);
    const scale = (logMax - logMin) / 100;
    return (Math.log10(freq) - logMin) / scale;
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-2xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Audio Tone Generator</h1>
            <p className="text-muted-foreground">
              Generate test tones and beep sounds with customizable parameters.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Tone Settings</CardTitle>
              <CardDescription>Configure frequency, waveform, duration, and volume.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">
                  Frequency: {frequency} Hz - {frequencyToNote(frequency)}
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={frequencyToSliderValue(frequency)}
                    onChange={handleFrequencySliderChange}
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    aria-label="Frequency slider"
                  />
                  <Input
                    id="frequency"
                    type="number"
                    min={MIN_FREQUENCY}
                    max={MAX_FREQUENCY}
                    value={frequency}
                    onChange={(e) => handleFrequencyInputChange(e.target.value)}
                    className="w-28"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{MIN_FREQUENCY} Hz</span>
                  <span>{MAX_FREQUENCY} Hz</span>
                </div>
              </div>

              {/* Waveform */}
              <div className="space-y-2">
                <Label>Waveform</Label>
                <Select value={waveform} onValueChange={(v) => setWaveform(v as WaveformType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAVEFORM_TYPES.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration: {duration.toFixed(1)} s</Label>
                <input
                  id="duration"
                  type="range"
                  min="0.1"
                  max="30"
                  step="0.1"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.1 s</span>
                  <span>30 s</span>
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <Label htmlFor="volume">Volume: {Math.round(volume * 100)}%</Label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Play/Stop */}
              <div className="flex gap-4 pt-2">
                {isPlaying ? (
                  <Button type="button" variant="destructive" onClick={stopTone} className="flex-1">
                    <Square className="mr-2 h-4 w-4" /> Stop
                  </Button>
                ) : (
                  <Button type="button" onClick={playTone} className="flex-1">
                    <Play className="mr-2 h-4 w-4" /> Play
                  </Button>
                )}
              </div>

              {/* Preset frequencies */}
              <div className="space-y-2">
                <Label>Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'A4 (440Hz)', freq: 440 },
                    { label: 'Middle C (261Hz)', freq: 261 },
                    { label: '1kHz', freq: 1000 },
                    { label: '100Hz', freq: 100 },
                    { label: '8kHz', freq: 8000 },
                    { label: '15kHz', freq: 15000 },
                  ].map((preset) => (
                    <Button
                      key={preset.freq}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFrequency(preset.freq)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
