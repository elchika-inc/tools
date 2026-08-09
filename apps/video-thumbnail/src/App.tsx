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
import { Camera, Download, Trash2, Image } from 'lucide-react';
import {
  type Thumbnail,
  type ImageFormat,
  formatTime,
  generateId,
  captureFrame,
  getDownloadFileName,
  dataUrlToBlob,
} from '@/utils/videoThumbnail';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [format, setFormat] = useState<ImageFormat>('png');
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (videoUrl) URL.revokeObjectURL(videoUrl);

      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
      setThumbnails([]);
    },
    [videoUrl]
  );

  const handleVideoLoaded = useCallback(() => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    try {
      const dataUrl = captureFrame(video, canvas, format);
      const thumbnail: Thumbnail = {
        id: generateId(),
        dataUrl,
        timestamp: video.currentTime,
        width: video.videoWidth,
        height: video.videoHeight,
        format,
      };
      setThumbnails((prev) => [...prev, thumbnail]);
      toast.add({ title: `Frame captured at ${formatTime(video.currentTime)}` });
    } catch (err) {
      toast.add({
        title: 'Capture failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        type: "error",
      });
    }
  }, [format, toast]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleDownload = useCallback(
    (thumbnail: Thumbnail) => {
      if (!file) return;
      const blob = dataUrlToBlob(thumbnail.dataUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getDownloadFileName(file.name, thumbnail.timestamp, thumbnail.format);
      a.click();
      URL.revokeObjectURL(url);
    },
    [file]
  );

  const handleDelete = useCallback((id: string) => {
    setThumbnails((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleDownloadAll = useCallback(() => {
    if (!file) return;
    thumbnails.forEach((thumb) => {
      const blob = dataUrlToBlob(thumb.dataUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getDownloadFileName(file.name, thumb.timestamp, thumb.format);
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [file, thumbnails]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Video Thumbnail</h1>
            <p className="text-muted-foreground">
              Extract thumbnails from video files. Scrub through the timeline and capture frames.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Select a video file to extract thumbnails from.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" accept="video/*" onChange={handleFileSelect} />

              {videoUrl && (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={handleVideoLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full rounded-md border"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.01}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="space-y-2 flex-1">
                      <Label>Format</Label>
                      <Select value={format} onValueChange={(v) => setFormat(v as ImageFormat)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" onClick={handleCapture} className="flex-1">
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Frame
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {thumbnails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Captured Thumbnails ({thumbnails.length})
                </CardTitle>
                <CardDescription>
                  Click on a thumbnail to download it, or download all at once.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {thumbnails.map((thumb) => (
                    <div key={thumb.id} className="relative group rounded-md border overflow-hidden">
                      <img
                        src={thumb.dataUrl}
                        alt={`Thumbnail at ${formatTime(thumb.timestamp)}`}
                        className="w-full h-auto"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 flex items-center justify-between">
                        <span>{formatTime(thumb.timestamp)}</span>
                        <span>{thumb.format.toUpperCase()}</span>
                      </div>
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDownload(thumb)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDelete(thumb.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button type="button" onClick={handleDownloadAll} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download All ({thumbnails.length})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setThumbnails([])}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </main>
        
      </div>
  </ToastToaster>;
}
