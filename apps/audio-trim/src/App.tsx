import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, Play, Square, Download, Trash2 } from 'lucide-react';
import {
  formatTime,
  validateTrimRange,
  calculateTrimmedDuration,
  drawWaveform,
  trimAudioBuffer,
  audioBufferToWav,
  generateOutputFilename,
} from '@/utils/audioTrim';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState('');
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const redrawWaveform = useCallback(() => {
    if (canvasRef.current && audioBuffer) {
      const canvas = canvasRef.current;
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      drawWaveform(canvas, audioBuffer, startTime, endTime);
    }
  }, [audioBuffer, startTime, endTime]);

  useEffect(() => {
    redrawWaveform();
  }, [redrawWaveform]);

  useEffect(() => {
    const handleResize = () => redrawWaveform();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawWaveform]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ctx = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);

      setAudioBuffer(decoded);
      setFileName(file.name);
      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(decoded.duration);

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

    const validation = validateTrimRange(startTime, endTime, duration);
    if (!validation.valid) {
      toast.add({ title: validation.error ?? 'Invalid range', type: "error" });
      return;
    }

    stopPreview();

    try {
      const ctx = getAudioContext();
      const trimmed = trimAudioBuffer(ctx, audioBuffer, startTime, endTime);
      const source = ctx.createBufferSource();
      source.buffer = trimmed;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    } catch {
      toast.add({ title: 'Failed to play preview', type: "error" });
    }
  }, [audioBuffer, startTime, endTime, duration, getAudioContext, stopPreview, toast]);

  const handleDownload = useCallback(() => {
    if (!audioBuffer) return;

    const validation = validateTrimRange(startTime, endTime, duration);
    if (!validation.valid) {
      toast.add({ title: validation.error ?? 'Invalid range', type: "error" });
      return;
    }

    setIsProcessing(true);
    try {
      const ctx = getAudioContext();
      const trimmed = trimAudioBuffer(ctx, audioBuffer, startTime, endTime);
      const wavBlob = audioBufferToWav(trimmed);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateOutputFilename(fileName);
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
  }, [audioBuffer, startTime, endTime, duration, fileName, getAudioContext, toast]);

  const handleClear = () => {
    stopPreview();
    setAudioBuffer(null);
    setFileName('');
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const trimmedDuration = calculateTrimmedDuration(startTime, endTime);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Audio Trim</h1>
            <p className="text-muted-foreground">
              Trim audio files with waveform visualization. Select a region, preview, and download.
            </p>
          </header>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio</CardTitle>
              <CardDescription>Select an audio file to trim.</CardDescription>
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

          {/* Waveform & Controls */}
          {audioBuffer && (
            <Card>
              <CardHeader>
                <CardTitle>Trim Editor</CardTitle>
                <CardDescription>
                  Duration: {formatTime(duration)} | Selected: {formatTime(trimmedDuration)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Waveform Canvas */}
                <div className="border rounded-md overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full"
                    style={{ height: '160px' }}
                  />
                </div>

                {/* Start Time Slider */}
                <div className="space-y-2">
                  <Label>Start: {formatTime(startTime)}</Label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.01"
                    value={startTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setStartTime(Math.min(val, endTime - 0.01));
                    }}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    aria-label="Start Time"
                  />
                </div>

                {/* End Time Slider */}
                <div className="space-y-2">
                  <Label>End: {formatTime(endTime)}</Label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.01"
                    value={endTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEndTime(Math.max(val, startTime + 0.01));
                    }}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    aria-label="End Time"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  {isPlaying ? (
                    <Button type="button" variant="destructive" onClick={stopPreview}>
                      <Square className="mr-2 h-4 w-4" /> Stop Preview
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
                    {isProcessing ? 'Processing...' : 'Download Trimmed'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
