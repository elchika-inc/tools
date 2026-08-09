import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Loader2, Gauge } from 'lucide-react';
import {
  SPEED_PRESETS,
  SPEED_MIN,
  SPEED_MAX,
  SPEED_STEP,
  formatSpeed,
  formatFileSize,
  formatTime,
  calculateOutputDuration,
  getSupportedMimeType,
  getOutputFileName,
  clampSpeed,
} from '@/utils/videoSpeed';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState('');
  const [resultSize, setResultSize] = useState(0);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);

      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
      setResultUrl('');
      setResultSize(0);
      setProgress(0);
    },
    [videoUrl, resultUrl]
  );

  const handleVideoLoaded = useCallback(() => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  }, []);

  const handlePreview = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      video.play();
    }
  }, [speed]);

  const handleProcess = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const mimeType = getSupportedMimeType();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_500_000,
      });

      const chunks: Blob[] = [];

      const blob = await new Promise<Blob>((resolve, reject) => {
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunks.push(ev.data);
        };
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = () => reject(new Error('Recording failed'));

        video.currentTime = 0;
        video.playbackRate = speed;
        video.muted = true;

        video.onseeked = () => {
          recorder.start(100);
          video.play();

          const drawFrame = () => {
            if (video.paused || video.ended) {
              if (recorder.state === 'recording') recorder.stop();
              return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setProgress(Math.min(video.currentTime / video.duration, 1));
            requestAnimationFrame(drawFrame);
          };
          requestAnimationFrame(drawFrame);
        };
      });

      video.playbackRate = 1;
      video.muted = false;

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      setProgress(1);
      toast.add({ title: 'Speed change complete' });
    } catch (err) {
      toast.add({
        title: 'Processing failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  }, [file, speed, resultUrl, toast]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = getOutputFileName(file.name, speed);
    a.click();
  }, [resultUrl, file, speed]);

  const outputDuration = calculateOutputDuration(duration, speed);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Video Speed</h1>
            <p className="text-muted-foreground">
              Change video playback speed. Speed up or slow down videos from 0.25x to 4x.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Select a video file to change its speed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" accept="video/*" onChange={handleFileSelect} />

              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  onLoadedMetadata={handleVideoLoaded}
                  className="w-full rounded-md border"
                />
              )}
            </CardContent>
          </Card>

          {videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Speed Settings</CardTitle>
                <CardDescription>
                  Original: {formatTime(duration)} | At {formatSpeed(speed)}:{' '}
                  {formatTime(outputDuration)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Speed: {formatSpeed(speed)}</Label>
                  </div>
                  <input
                    type="range"
                    min={SPEED_MIN}
                    max={SPEED_MAX}
                    step={SPEED_STEP}
                    value={speed}
                    onChange={(e) => setSpeed(clampSpeed(Number(e.target.value)))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatSpeed(SPEED_MIN)}</span>
                    <span>{formatSpeed(1)}</span>
                    <span>{formatSpeed(SPEED_MAX)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SPEED_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={speed === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSpeed(preset)}
                    >
                      {formatSpeed(preset)}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    className="flex-1"
                  >
                    Preview at {formatSpeed(speed)}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleProcess}
                    disabled={processing || !file}
                    className="flex-1"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing... {Math.round(progress * 100)}%
                      </>
                    ) : (
                      <>
                        <Gauge className="mr-2 h-4 w-4" />
                        Apply Speed Change
                      </>
                    )}
                  </Button>
                </div>

                {processing && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {resultUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  Speed: {formatSpeed(speed)} | Size: {formatFileSize(resultSize)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <video src={resultUrl} controls className="w-full rounded-md border" />
                <Button type="button" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Video
                </Button>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </main>

      </div>
  </ToastToaster>;
}
