import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Play, Square, Download, Trash2 } from 'lucide-react';
import {
  MIN_SPEED,
  MAX_SPEED,
  DEFAULT_SPEED,
  SPEED_PRESETS,
  clampSpeed,
  formatSpeed,
  formatTime,
  calculateNewDuration,
  generateOutputFilename,
  changeSpeedSimple,
  audioBufferToWav,
} from '@/utils/audioSpeed';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState('');
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [preservePitch, setPreservePitch] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ctx = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);

      setAudioBuffer(decoded);
      setFileName(file.name);
      setSpeed(DEFAULT_SPEED);

      toast.add({ title: 'Audio loaded successfully' });
    } catch {
      toast.add({ title: 'Failed to load audio file', type: "error" });
    }
  };

  const stopPreview = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // Already stopped
      }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playPreview = useCallback(() => {
    if (!audioBuffer) return;

    stopPreview();

    try {
      const ctx = getAudioContext();

      if (preservePitch) {
        // Use playbackRate with preservesPitch for pitch-preserved speed change
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speed;
        // @ts-expect-error: preservesPitch is not in all TS type definitions yet
        source.preservesPitch = true;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        sourceNodeRef.current = source;
      } else {
        // Use playbackRate without pitch preservation (natural speed/pitch change)
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speed;
        // @ts-expect-error: preservesPitch is not in all TS type definitions yet
        source.preservesPitch = false;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        sourceNodeRef.current = source;
      }

      setIsPlaying(true);
    } catch {
      toast.add({ title: 'Failed to play preview', type: "error" });
    }
  }, [audioBuffer, speed, preservePitch, getAudioContext, stopPreview, toast]);

  const handleDownload = useCallback(() => {
    if (!audioBuffer) return;

    setIsProcessing(true);
    try {
      const ctx = getAudioContext();

      let outputBuffer: AudioBuffer;
      if (preservePitch) {
        // For pitch-preserved download, we resample at the new rate
        // This creates a new buffer with the adjusted speed
        outputBuffer = changeSpeedSimple(ctx, audioBuffer, speed);
      } else {
        // Without pitch preservation, simple resampling
        outputBuffer = changeSpeedSimple(ctx, audioBuffer, speed);
      }

      const wavBlob = audioBufferToWav(outputBuffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateOutputFilename(fileName, speed);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.add({ title: 'Download started' });
    } catch {
      toast.add({ title: 'Failed to export audio', type: "error" });
    } finally {
      setIsProcessing(false);
    }
  }, [audioBuffer, speed, preservePitch, fileName, getAudioContext, toast]);

  const handleClear = () => {
    stopPreview();
    setAudioBuffer(null);
    setFileName('');
    setSpeed(DEFAULT_SPEED);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const originalDuration = audioBuffer?.duration ?? 0;
  const newDuration = calculateNewDuration(originalDuration, speed);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Audio Speed Changer</h1>
            <p className="text-muted-foreground">
              Change audio playback speed with optional pitch preservation.
            </p>
          </header>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio</CardTitle>
              <CardDescription>Select an audio file to change speed.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-file-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Select File
                </Button>
                {fileName && (
                  <span className="text-sm text-muted-foreground truncate">{fileName}</span>
                )}
                {audioBuffer && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Speed Controls */}
          {audioBuffer && (
            <Card>
              <CardHeader>
                <CardTitle>Speed Settings</CardTitle>
                <CardDescription>
                  Original: {formatTime(originalDuration)} | New: {formatTime(newDuration)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Speed Display */}
                <div className="text-center">
                  <span className="text-5xl font-bold tabular-nums">
                    {formatSpeed(speed)}
                  </span>
                </div>

                {/* Speed Slider */}
                <div className="space-y-2">
                  <Label htmlFor="speed">Speed</Label>
                  <input
                    id="speed"
                    type="range"
                    min={MIN_SPEED}
                    max={MAX_SPEED}
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(clampSpeed(parseFloat(e.target.value)))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{MIN_SPEED}x</span>
                    <span>1x</span>
                    <span>{MAX_SPEED}x</span>
                  </div>
                </div>

                {/* Speed Presets */}
                <div className="space-y-2">
                  <Label>Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPEED_PRESETS.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={speed === preset ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSpeed(preset)}
                      >
                        {preset}x
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Preserve Pitch Toggle */}
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <input
                    type="checkbox"
                    id="preserve-pitch"
                    checked={preservePitch}
                    onChange={(e) => setPreservePitch(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <div>
                    <Label htmlFor="preserve-pitch" className="cursor-pointer">
                      Preserve Pitch
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {preservePitch
                        ? 'Pitch is preserved when changing speed (preview only, download uses resampling)'
                        : 'Pitch changes proportionally with speed'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  {isPlaying ? (
                    <Button type="button" variant="destructive" onClick={stopPreview}>
                      <Square className="mr-2 h-4 w-4" /> Stop
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" onClick={playPreview}>
                      <Play className="mr-2 h-4 w-4" /> Preview
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleDownload}
                    disabled={isProcessing}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Download'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
