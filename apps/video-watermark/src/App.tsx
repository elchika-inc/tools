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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Loader2, Type } from 'lucide-react';
import {
  type WatermarkConfig,
  type WatermarkPosition,
  createDefaultWatermarkConfig,
  POSITION_OPTIONS,
  drawWatermark,
  formatFileSize,
  getSupportedMimeType,
  getOutputFileName,
} from '@/utils/videoWatermark';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [config, setConfig] = useState<WatermarkConfig>(createDefaultWatermarkConfig());
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

  const drawPreview = useCallback(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    drawWatermark(ctx, canvas.width, canvas.height, config);
  }, [config]);

  const handleVideoLoaded = useCallback(() => {
    drawPreview();
  }, [drawPreview]);

  const handleTimeUpdate = useCallback(() => {
    drawPreview();
  }, [drawPreview]);

  const updateConfig = useCallback(
    <K extends keyof WatermarkConfig>(key: K, value: WatermarkConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
      requestAnimationFrame(drawPreview);
    },
    [drawPreview]
  );

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
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            drawWatermark(ctx, canvas.width, canvas.height, config);
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
      toast.add({ title: 'Watermark applied successfully' });
    } catch (err) {
      toast.add({
        title: 'Processing failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  }, [file, config, resultUrl, toast]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = getOutputFileName(file.name);
    a.click();
  }, [resultUrl, file]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Video Watermark</h1>
            <p className="text-muted-foreground">
              Add text watermarks to video files. Customize text, size, color, opacity, and position.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Select a video file to add a watermark to.</CardDescription>
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
                <CardTitle>Watermark Settings</CardTitle>
                <CardDescription>Customize the watermark appearance and position.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="wm-text">Text</Label>
                    <Input
                      id="wm-text"
                      value={config.text}
                      onChange={(e) => updateConfig('text', e.target.value)}
                      placeholder="Enter watermark text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wm-size">Font Size: {config.fontSize}px</Label>
                    <input
                      id="wm-size"
                      type="range"
                      min={8}
                      max={120}
                      step={1}
                      value={config.fontSize}
                      onChange={(e) => updateConfig('fontSize', Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wm-opacity">
                      Opacity: {Math.round(config.opacity * 100)}%
                    </Label>
                    <input
                      id="wm-opacity"
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.05}
                      value={config.opacity}
                      onChange={(e) => updateConfig('opacity', Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wm-color">Color</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        id="wm-color"
                        type="color"
                        value={config.color}
                        onChange={(e) => updateConfig('color', e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={config.color}
                        onChange={(e) => updateConfig('color', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                      value={config.position}
                      onValueChange={(v) => updateConfig('position', v as WatermarkPosition)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-md p-2 bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Preview</p>
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full h-auto mx-auto rounded"
                    style={{ maxHeight: '300px' }}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleProcess}
                  disabled={processing || !file || !config.text.trim()}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing... {Math.round(progress * 100)}%
                    </>
                  ) : (
                    <>
                      <Type className="mr-2 h-4 w-4" />
                      Apply Watermark
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
                <CardDescription>Size: {formatFileSize(resultSize)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <video src={resultUrl} controls className="w-full rounded-md border" />
                <Button type="button" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Watermarked Video
                </Button>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </main>

      </div>
  </ToastToaster>;
}
