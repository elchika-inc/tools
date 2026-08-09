import { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  type ViewMode,
  type ColorScheme,
  type VisualizerConfig,
  VIEW_MODE_OPTIONS,
  COLOR_SCHEME_OPTIONS,
  getDefaultConfig,
  drawWaveform,
  drawSpectrum,
  formatTime,
} from '@/utils/audioVisualizer';
import { toast, ToastToaster } from "@/components/ui/toast";

type SourceType = 'file' | 'mic';

export default function App() {
  const [config, setConfig] = useState<VisualizerConfig>(getDefaultConfig());
  const [sourceType, setSourceType] = useState<SourceType>('file');
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasBuffer, setHasBuffer] = useState(false);

  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | MediaStreamAudioSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPlayingRef = useRef(false);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    if (sourceNodeRef.current) {
      try {
        if ('stop' in sourceNodeRef.current) {
          sourceNodeRef.current.stop();
        }
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [cleanup]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const animate = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const cfg = configRef.current;
    const waveformCanvas = waveformCanvasRef.current;
    const spectrumCanvas = spectrumCanvasRef.current;
    const showWave = cfg.viewMode === 'waveform' || cfg.viewMode === 'both';
    const showSpec = cfg.viewMode === 'spectrum' || cfg.viewMode === 'both';

    if (showWave && waveformCanvas) {
      const waveCtx = waveformCanvas.getContext('2d');
      if (waveCtx) {
        const timeData = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(timeData);
        drawWaveform(waveCtx, timeData, waveformCanvas.width, waveformCanvas.height, cfg.colorScheme);
      }
    }

    if (showSpec && spectrumCanvas) {
      const specCtx = spectrumCanvas.getContext('2d');
      if (specCtx) {
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        drawSpectrum(specCtx, freqData, spectrumCanvas.width, spectrumCanvas.height, cfg.colorScheme);
      }
    }

    if (isPlayingRef.current && audioContextRef.current) {
      setCurrentTime(audioContextRef.current.currentTime - startTimeRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const startVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    cleanup();

    try {
      const ctx = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      setHasBuffer(true);
      setFileName(file.name);
      setDuration(audioBuffer.duration);
      setSourceType('file');
      toast.add({ title: 'File loaded', description: file.name });
    } catch {
      toast.add({
        title: 'Error',
        description: 'Failed to load audio file.',
        type: "error",
      });
    }
  }, [cleanup, getAudioContext]);

  const playFile = useCallback(() => {
    const buffer = audioBufferRef.current;
    if (!buffer) return;

    cleanup();

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = config.fftSize;
    analyserRef.current = analyser;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    source.onended = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
    };

    startTimeRef.current = ctx.currentTime;
    source.start(0);
    sourceNodeRef.current = source;
    isPlayingRef.current = true;
    setIsPlaying(true);
    startVisualization();
  }, [cleanup, getAudioContext, config.fftSize, startVisualization]);

  const startMic = useCallback(async () => {
    cleanup();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = config.fftSize;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceNodeRef.current = source;
      setSourceType('mic');
      isPlayingRef.current = true;
      setIsPlaying(true);
      setFileName('');
      setDuration(0);
      setHasBuffer(false);
      startVisualization();
      toast.add({ title: 'Microphone started' });
    } catch {
      toast.add({
        title: 'Error',
        description: 'Failed to access microphone.',
        type: "error",
      });
    }
  }, [cleanup, getAudioContext, config.fftSize, startVisualization]);

  const handleStop = useCallback(() => {
    cleanup();
    if (waveformCanvasRef.current) {
      const ctx = waveformCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, waveformCanvasRef.current.width, waveformCanvasRef.current.height);
      }
    }
    if (spectrumCanvasRef.current) {
      const ctx = spectrumCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, spectrumCanvasRef.current.width, spectrumCanvasRef.current.height);
      }
    }
  }, [cleanup]);

  const showWaveform = config.viewMode === 'waveform' || config.viewMode === 'both';
  const showSpectrum = config.viewMode === 'spectrum' || config.viewMode === 'both';

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Audio Visualizer</h1>
            <p className="text-muted-foreground">
              オーディオの波形と周波数スペクトラムをリアルタイムで可視化します
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>入力ソース</CardTitle>
              <CardDescription>ファイルまたはマイクから入力を選択</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor="audio-file">オーディオファイル</Label>
                  <Input
                    id="audio-file"
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>
                <Button type="button" variant="outline" onClick={startMic}>
                  マイク入力
                </Button>
              </div>
              {fileName && (
                <p className="text-sm text-muted-foreground">
                  {fileName} ({formatTime(duration)})
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>表示設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>表示モード</Label>
                  <Select
                    value={config.viewMode}
                    onValueChange={(v) =>
                      setConfig((prev) => ({ ...prev, viewMode: v as ViewMode }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIEW_MODE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>カラースキーム</Label>
                  <Select
                    value={config.colorScheme}
                    onValueChange={(v) =>
                      setConfig((prev) => ({ ...prev, colorScheme: v as ColorScheme }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_SCHEME_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {sourceType === 'file' ? (
              <Button
                type="button"
                onClick={playFile}
                disabled={!hasBuffer || isPlaying}
                className="flex-1"
              >
                再生
              </Button>
            ) : (
              <Button
                type="button"
                onClick={startMic}
                disabled={isPlaying}
                className="flex-1"
              >
                マイク開始
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleStop} disabled={!isPlaying}>
              停止
            </Button>
          </div>

          {isPlaying && sourceType === 'file' && duration > 0 && (
            <p className="text-sm text-center text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          )}

          <Card>
            <CardContent className="p-4 space-y-4">
              {showWaveform && (
                <div>
                  <p className="text-sm font-medium mb-2">Waveform</p>
                  <canvas
                    ref={waveformCanvasRef}
                    width={800}
                    height={200}
                    className="w-full rounded-md bg-gray-900"
                  />
                </div>
              )}
              {showSpectrum && (
                <div>
                  <p className="text-sm font-medium mb-2">Frequency Spectrum</p>
                  <canvas
                    ref={spectrumCanvasRef}
                    width={800}
                    height={200}
                    className="w-full rounded-md bg-gray-900"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
