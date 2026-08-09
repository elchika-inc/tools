import { Circle, Download, Square, Video } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  downloadBlob,
  FORMATS,
  formatDuration,
  getSupportedMimeType,
  type RecordingFormat,
} from '@/utils/screenRecorder';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [format, setFormat] = useState<RecordingFormat>('webm');
  const [duration, setDuration] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getSupportedMimeType(format);
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = getSupportedMimeType(format);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);

        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        cleanupStream();
        setIsRecording(false);
      };

      // Handle stream ending (user clicks "Stop sharing" in browser UI)
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setDuration(0);
      setRecordedBlob(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      cleanupStream();
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.add({
          title: 'Recording failed',
          description: error.message,
          type: "error",
        });
      }
    }
  }, [format, previewUrl, cleanupStream, toast]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!recordedBlob) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `recording-${timestamp}.${format}`;
    downloadBlob(recordedBlob, filename);
  }, [recordedBlob, format]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [cleanupStream, previewUrl]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Screen Recorder</h1>
            <p className="text-muted-foreground">
              Record your screen directly in the browser. No external tools required.
            </p>
          </header>

          <main>
          <Card>
            <CardHeader>
              <CardTitle>Recording Controls</CardTitle>
              <CardDescription>Select format and start recording your screen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Controls Row */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={format}
                    onValueChange={(v) => setFormat(v as RecordingFormat)}
                    disabled={isRecording}
                  >
                    <SelectTrigger className="w-[140px]" id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!isRecording ? (
                  <Button type="button" onClick={handleStartRecording}>
                    <Circle className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
                    Start Recording
                  </Button>
                ) : (
                  <Button type="button" variant="destructive" onClick={handleStopRecording}>
                    <Square className="mr-2 h-4 w-4" />
                    Stop Recording
                  </Button>
                )}

                {recordedBlob && (
                  <Button type="button" variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>

              {/* Timer */}
              {isRecording && (
                <div className="flex items-center gap-2 text-lg font-mono">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span>Recording: {formatDuration(duration)}</span>
                </div>
              )}

              {/* Duration after recording */}
              {!isRecording && recordedBlob && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  <span>
                    Duration: {formatDuration(duration)} | Size:{' '}
                    {(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              )}

              {/* Video Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    controls
                    className="w-full rounded-md border bg-black"
                    style={{ maxHeight: '480px' }}
                  >
                    <track kind="captions" />
                  </video>
                </div>
              )}
            </CardContent>
          </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
