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
import {
  Download,
  Loader2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
} from 'lucide-react';
import {
  type Transform,
  type RotationAngle,
  createDefaultTransform,
  rotateClockwise,
  rotateCounterClockwise,
  rotate180,
  getTransformLabel,
  getOutputDimensions,
  applyTransformToContext,
  formatFileSize,
  getSupportedMimeType,
  getOutputFileName,
} from '@/utils/videoRotate';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [transform, setTransform] = useState<Transform>(createDefaultTransform());
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
      setTransform(createDefaultTransform());
      setResultUrl('');
      setResultSize(0);
      setProgress(0);
    },
    [videoUrl, resultUrl]
  );

  const drawPreview = useCallback(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas) return;

    const { width, height } = getOutputDimensions(
      video.videoWidth,
      video.videoHeight,
      transform.rotation
    );

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    applyTransformToContext(ctx, width, height, transform);
    ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
    ctx.restore();
  }, [transform]);

  const handleVideoLoaded = useCallback(() => {
    drawPreview();
  }, [drawPreview]);

  const handleTimeUpdate = useCallback(() => {
    drawPreview();
  }, [drawPreview]);

  const handleRotateCW = useCallback(() => {
    setTransform((t) => ({ ...t, rotation: rotateClockwise(t.rotation) }));
    requestAnimationFrame(drawPreview);
  }, [drawPreview]);

  const handleRotateCCW = useCallback(() => {
    setTransform((t) => ({ ...t, rotation: rotateCounterClockwise(t.rotation) }));
    requestAnimationFrame(drawPreview);
  }, [drawPreview]);

  const handleRotate180 = useCallback(() => {
    setTransform((t) => ({ ...t, rotation: rotate180(t.rotation) }));
    requestAnimationFrame(drawPreview);
  }, [drawPreview]);

  const handleFlipH = useCallback(() => {
    setTransform((t) => ({ ...t, flipH: !t.flipH }));
    requestAnimationFrame(drawPreview);
  }, [drawPreview]);

  const handleFlipV = useCallback(() => {
    setTransform((t) => ({ ...t, flipV: !t.flipV }));
    requestAnimationFrame(drawPreview);
  }, [drawPreview]);

  const handleReset = useCallback(() => {
    setTransform(createDefaultTransform());
    requestAnimationFrame(drawPreview);
  }, [drawPreview]);

  const handleProcess = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const mimeType = getSupportedMimeType();
      const { width, height } = getOutputDimensions(
        video.videoWidth,
        video.videoHeight,
        transform.rotation
      );

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_500_000,
      });

      const chunks: Blob[] = [];
      const duration = video.duration;

      const blob = await new Promise<Blob>((resolve, reject) => {
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunks.push(ev.data);
        };
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
        recorder.onerror = () => reject(new Error('Recording failed'));

        video.currentTime = 0;
        video.muted = true;

        video.onseeked = () => {
          recorder.start(100);
          video.play();

          const drawFrame = () => {
            if (video.paused || video.ended) {
              if (recorder.state === 'recording') recorder.stop();
              return;
            }
            ctx.clearRect(0, 0, width, height);
            applyTransformToContext(ctx, width, height, transform);
            ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
            ctx.restore();

            setProgress(Math.min(video.currentTime / duration, 1));
            requestAnimationFrame(drawFrame);
          };
          requestAnimationFrame(drawFrame);
        };
      });

      video.muted = false;

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      setProgress(1);
      toast.add({ title: 'Transform complete' });
    } catch (err) {
      toast.add({
        title: 'Processing failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  }, [file, transform, resultUrl, toast]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = getOutputFileName(file.name, transform);
    a.click();
  }, [resultUrl, file, transform]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Video Rotate</h1>
            <p className="text-muted-foreground">
              Rotate and flip video files. Supports 90/180/270 degree rotation and horizontal/vertical
              flipping.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Select a video file to rotate or flip.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" accept="video/*" onChange={handleFileSelect} />

              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  onLoadedMetadata={handleVideoLoaded}
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full rounded-md border"
                />
              )}
            </CardContent>
          </Card>

          {videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Transform</CardTitle>
                <CardDescription>{getTransformLabel(transform)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={handleRotateCW}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    90 CW
                  </Button>
                  <Button type="button" variant="outline" onClick={handleRotateCCW}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    90 CCW
                  </Button>
                  <Button type="button" variant="outline" onClick={handleRotate180}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    180
                  </Button>
                  <Button type="button" variant="outline" onClick={handleFlipH}>
                    <FlipHorizontal className="mr-2 h-4 w-4" />
                    Flip H
                  </Button>
                  <Button type="button" variant="outline" onClick={handleFlipV}>
                    <FlipVertical className="mr-2 h-4 w-4" />
                    Flip V
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleReset}>
                    Reset
                  </Button>
                </div>

                <div className="border rounded-md p-2 bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Preview</p>
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: '300px' }}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleProcess}
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
                      <RotateCw className="mr-2 h-4 w-4" />
                      Apply Transform
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
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  {getTransformLabel(transform)} | Size: {formatFileSize(resultSize)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <video src={resultUrl} controls className="w-full rounded-md border" />
                <Button type="button" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Rotated Video
                </Button>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </main>

      </div>
  </ToastToaster>;
}
