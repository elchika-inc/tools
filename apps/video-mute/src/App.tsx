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
import { Download, Loader2, VolumeX } from 'lucide-react';
import {
  formatFileSize,
  formatTime,
  getSupportedMimeType,
  getOutputFileName,
  calculateSizeReduction,
} from '@/utils/videoMute';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
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

  const handleMute = useCallback(async () => {
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

      // Capture stream WITHOUT audio tracks
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

        // Mute the video element during playback
        video.muted = true;
        video.currentTime = 0;

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

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      setProgress(1);
      video.muted = false;
      toast.add({ title: 'Audio removed successfully' });
    } catch (err) {
      toast.add({
        title: 'Processing failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  }, [file, resultUrl, toast]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = getOutputFileName(file.name);
    a.click();
  }, [resultUrl, file]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Video Mute</h1>
            <p className="text-muted-foreground">
              Remove audio from video files. The output contains only the video track with no sound.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Select a video file to remove audio from.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" accept="video/*" onChange={handleFileSelect} />

              {videoUrl && (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    onLoadedMetadata={handleVideoLoaded}
                    className="w-full rounded-md border"
                  />
                  <p className="text-sm text-muted-foreground">
                    Duration: {formatTime(duration)} | Size: {file ? formatFileSize(file.size) : ''}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Remove Audio</CardTitle>
                <CardDescription>
                  Re-encodes the video without any audio tracks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  onClick={handleMute}
                  disabled={processing || !file}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing... {Math.round(progress * 100)}%
                    </>
                  ) : (
                    <>
                      <VolumeX className="mr-2 h-4 w-4" />
                      Remove Audio
                    </>
                  )}
                </Button>

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
                <CardTitle>Result (No Audio)</CardTitle>
                <CardDescription>
                  Original: {file ? formatFileSize(file.size) : ''} | Output:{' '}
                  {formatFileSize(resultSize)}
                  {file
                    ? ` | Size reduction: ${calculateSizeReduction(file.size, resultSize)}`
                    : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <video src={resultUrl} controls className="w-full rounded-md border" />
                <Button type="button" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Muted Video
                </Button>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </main>

      </div>
  </ToastToaster>;
}
