import { Download, Image, Play, Trash2, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type ConversionOptions,
  DEFAULT_OPTIONS,
  dataUrlToBlob,
  extractFrames,
  formatFileSize,
  formatTime,
} from '@/utils/videoToGif';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);

  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [frames, setFrames] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('video/')) {
        toast.add({
          title: 'Invalid file type',
          description: 'Please select a video file.',
          type: "error",
        });
        return;
      }

      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoFileName(file.name);
      setFrames([]);
      setProgress(0);
    },
    [toast]
  );

  const handleVideoLoaded = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setVideoDuration(video.duration);
    setVideoWidth(video.videoWidth);
    setVideoHeight(video.videoHeight);

    setOptions((prev) => ({
      ...prev,
      duration: Math.min(prev.duration, video.duration),
      width: Math.min(prev.width, video.videoWidth),
    }));
  }, []);

  const handleExtractFrames = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsExtracting(true);
    setProgress(0);
    setFrames([]);

    try {
      const extractedFrames = await extractFrames(video, options, (p) => {
        setProgress(p);
      });
      setFrames(extractedFrames);
      toast.add({
        title: 'Frames extracted',
        description: `${extractedFrames.length} frames extracted successfully.`,
      });
    } catch {
      toast.add({
        title: 'Extraction failed',
        description: 'Failed to extract frames from video.',
        type: "error",
      });
    } finally {
      setIsExtracting(false);
    }
  }, [options, toast]);

  const handleDownloadFrame = useCallback(
    async (frameDataUrl: string, index: number) => {
      try {
        const blob = dataUrlToBlob(frameDataUrl);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `frame-${(index + 1).toString().padStart(4, '0')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        toast.add({
          title: 'Download failed',
          description: 'Failed to download frame.',
          type: "error",
        });
      }
    },
    [toast]
  );

  const handleDownloadAll = useCallback(async () => {
    try {
      for (let i = 0; i < frames.length; i++) {
        await handleDownloadFrame(frames[i], i);
      }
      toast.add({
        title: 'Download complete',
        description: `${frames.length} frames downloaded.`,
      });
    } catch {
      toast.add({
        title: 'Download failed',
        description: 'Failed to download frames.',
        type: "error",
      });
    }
  }, [frames, handleDownloadFrame, toast]);

  const handleClear = useCallback(() => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setVideoFileName('');
    setVideoDuration(0);
    setVideoWidth(0);
    setVideoHeight(0);
    setFrames([]);
    setProgress(0);
    setOptions(DEFAULT_OPTIONS);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [videoSrc]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.type.startsWith('video/')) {
        toast.add({
          title: 'Invalid file type',
          description: 'Please select a video file.',
          type: "error",
        });
        return;
      }

      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoFileName(file.name);
      setFrames([]);
      setProgress(0);
    },
    [toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const estimatedFrameCount = Math.ceil(options.duration * options.fps);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Video to GIF</h1>
            <p className="text-muted-foreground">
              Extract frames from video and download as images. All processing happens in your
              browser.
            </p>
          </header>

          <main className="space-y-6">
          {/* Video Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Video Input</CardTitle>
              <CardDescription>Upload a video file to extract frames.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!videoSrc ? (
                <button
                  type="button"
                  className="w-full border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">MP4, WebM, OGG, MOV supported</p>
                </button>
              ) : (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    className="w-full max-h-[400px] rounded-lg bg-black"
                    onLoadedMetadata={handleVideoLoaded}
                    crossOrigin="anonymous"
                  >
                    <track kind="captions" />
                  </video>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{videoFileName}</span>
                    <span>
                      {videoWidth}x{videoHeight} | {formatTime(videoDuration)}
                    </span>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </CardContent>
          </Card>

          {/* Options */}
          {videoSrc && (
            <Card>
              <CardHeader>
                <CardTitle>Extraction Options</CardTitle>
                <CardDescription>Configure frame extraction settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="fps">FPS (frames per second)</Label>
                    <Input
                      id="fps"
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      value={options.fps}
                      onChange={(e) =>
                        updateOption('fps', Math.max(1, Math.min(30, Number(e.target.value))))
                      }
                    />
                    <p className="text-xs text-muted-foreground">1-30, lower = smaller file</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Output Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      min={50}
                      max={videoWidth || 1920}
                      step={10}
                      value={options.width}
                      onChange={(e) =>
                        updateOption(
                          'width',
                          Math.max(50, Math.min(videoWidth || 1920, Number(e.target.value)))
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">Original: {videoWidth}px</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality</Label>
                    <Input
                      id="quality"
                      type="number"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={options.quality}
                      onChange={(e) =>
                        updateOption('quality', Math.max(0.1, Math.min(1, Number(e.target.value))))
                      }
                    />
                    <p className="text-xs text-muted-foreground">0.1-1.0, higher = better quality</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time (sec)</Label>
                    <Input
                      id="startTime"
                      type="number"
                      min={0}
                      max={Math.max(0, videoDuration - 0.1)}
                      step={0.1}
                      value={options.startTime}
                      onChange={(e) =>
                        updateOption(
                          'startTime',
                          Math.max(0, Math.min(videoDuration - 0.1, Number(e.target.value)))
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">{formatTime(options.startTime)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (sec)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={0.1}
                      max={Math.max(0.1, videoDuration - options.startTime)}
                      step={0.1}
                      value={options.duration}
                      onChange={(e) =>
                        updateOption(
                          'duration',
                          Math.max(
                            0.1,
                            Math.min(videoDuration - options.startTime, Number(e.target.value))
                          )
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Max: {formatTime(videoDuration - options.startTime)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Frames</Label>
                    <p className="text-2xl font-bold">{estimatedFrameCount}</p>
                    <p className="text-xs text-muted-foreground">
                      {options.fps} fps x {options.duration.toFixed(1)}s
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={handleExtractFrames}
                    disabled={isExtracting}
                    className="flex-1"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isExtracting ? `Extracting... ${Math.round(progress * 100)}%` : 'Extract Frames'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClear}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>

                {isExtracting && (
                  <div className="mt-4">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-200"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Extracted Frames */}
          {frames.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Extracted Frames</CardTitle>
                    <CardDescription>
                      {frames.length} frames extracted |{' '}
                      {formatFileSize(frames.reduce((sum, f) => sum + dataUrlToBlob(f).size, 0))}{' '}
                      total
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={handleDownloadAll} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Download All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {frames.map((frame, i) => (
                    <div key={frame.slice(-20)} className="group relative">
                      <img
                        src={frame}
                        alt={`Frame ${i + 1}`}
                        className="w-full rounded-md border bg-muted"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownloadFrame(frame, i)}
                        >
                          <Image className="mr-1 h-3 w-3" />#{i + 1}
                        </Button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-1">Frame {i + 1}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
