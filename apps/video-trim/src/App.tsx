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
import { Download, Scissors, Upload, Loader2 } from 'lucide-react';
import {
  formatTime,
  parseTime,
  validateTrimRange,
  getOutputFileName,
  getSupportedMimeType,
} from '@/utils/videoTrim';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState('00:00.00');
  const [endTime, setEndTime] = useState('00:00.00');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string>('');
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
    if (!video) return;
    const dur = video.duration;
    setDuration(dur);
    setStartTime('00:00.00');
    setEndTime(formatTime(dur));
  }, []);

  const handleTrim = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !file) return;

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    const validation = validateTrimRange(start, end, duration);
    if (!validation.valid) {
      toast.add({ title: 'Invalid range', description: validation.error, type: "error" });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const mimeType = getSupportedMimeType();
      const trimDuration = end - start;

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

        video.currentTime = start;
        video.onseeked = () => {
          recorder.start(100);
          video.play();

          const drawFrame = () => {
            if (video.currentTime >= end || video.paused || video.ended) {
              video.pause();
              if (recorder.state === 'recording') recorder.stop();
              return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setProgress(Math.min((video.currentTime - start) / trimDuration, 1));
            requestAnimationFrame(drawFrame);
          };
          requestAnimationFrame(drawFrame);
        };
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      setProgress(1);
      toast.add({ title: 'Trim complete' });
    } catch (err) {
      toast.add({
        title: 'Trim failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  }, [file, startTime, endTime, duration, resultUrl, toast]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = getOutputFileName(file.name);
    a.click();
  }, [resultUrl, file]);

  const handleSetStart = useCallback(() => {
    const video = videoRef.current;
    if (video) setStartTime(formatTime(video.currentTime));
  }, []);

  const handleSetEnd = useCallback(() => {
    const video = videoRef.current;
    if (video) setEndTime(formatTime(video.currentTime));
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Video Trim</h1>
            <p className="text-muted-foreground">
              Trim video files by specifying start and end times. All processing happens in your
              browser.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Select a video file to trim.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
              </div>

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
                <CardTitle>Trim Settings</CardTitle>
                <CardDescription>
                  Duration: {formatTime(duration)} | Set start and end points for trimming.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <div className="flex gap-2">
                      <Input
                        id="start-time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="00:00.00"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleSetStart}>
                        Current
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <div className="flex gap-2">
                      <Input
                        id="end-time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="00:00.00"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleSetEnd}>
                        Current
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleTrim}
                    disabled={processing || !file}
                    className="flex-1"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Trimming... {Math.round(progress * 100)}%
                      </>
                    ) : (
                      <>
                        <Scissors className="mr-2 h-4 w-4" />
                        Trim Video
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
                  Original: {file ? formatFileSize(file.size) : ''} | Trimmed:{' '}
                  {formatFileSize(resultSize)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <video src={resultUrl} controls className="w-full rounded-md border" />
                <Button type="button" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Trimmed Video
                </Button>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </main>

      </div>
  </ToastToaster>;
}
