import { Camera, Download } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWebcamStream } from '@/utils/webcam';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [active, setActive] = useState(false);
  const [info, setInfo] = useState<Record<string, string>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const start = useCallback(async () => {
    try {
      const stream = await getWebcamStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setInfo({
            Resolution: `${videoRef.current?.videoWidth} x ${videoRef.current?.videoHeight}`,
          });
        };
      }
      setActive(true);
    } catch {
      toast.add({ title: 'カメラへのアクセスが拒否されました', type: "error" });
    }
  }, [toast]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
    }
    setActive(false);
  }, []);

  const snapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'snapshot.png';
    a.click();
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Webcam Test</h1>
            <p className="text-muted-foreground">Webカメラの動作確認ツールです。</p>
          </header>
          <main>
          <Card>
            <CardHeader>
              <CardTitle>Camera</CardTitle>
              <CardDescription>Startでカメラを起動します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="max-h-96" />
              </div>
              <div className="flex justify-center gap-2">
                {!active ? (
                  <Button type="button" onClick={start} size="lg">
                    <Camera className="mr-2 h-5 w-5" /> Start
                  </Button>
                ) : (
                  <>
                    <Button type="button" onClick={stop} variant="destructive" size="lg">
                      Stop
                    </Button>
                    <Button type="button" onClick={snapshot} variant="outline" size="lg">
                      <Download className="mr-2 h-4 w-4" /> Snapshot
                    </Button>
                  </>
                )}
              </div>
              {Object.keys(info).length > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  {Object.entries(info).map(([k, v]) => (
                    <span key={k} className="mr-4">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
