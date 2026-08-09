import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type NoiseGateOptions,
  getDefaultOptions,
  formatDuration,
  formatFileSize,
  decodeAudioFile,
  processAudio,
  encodeWav,
  downloadBlob,
} from '@/utils/noiseGate';
import { toast, ToastToaster } from "@/components/ui/toast";

interface FileInfo {
  file: File;
  buffer: AudioBuffer;
  duration: number;
}

export default function App() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [options, setOptions] = useState<NoiseGateOptions>(getDefaultOptions());
  const [processing, setProcessing] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanupUrls = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessedBlob(null);
  }, [originalUrl, processedUrl]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    cleanupUrls();

    try {
      const buffer = await decodeAudioFile(file);
      setFileInfo({ file, buffer, duration: buffer.duration });

      const origUrl = URL.createObjectURL(file);
      setOriginalUrl(origUrl);

      toast.add({ title: 'File loaded', description: file.name });
    } catch {
      toast.add({
        title: 'Error',
        description: 'Failed to load audio file.',
        type: "error",
      });
      setFileInfo(null);
    }
  }, [cleanupUrls]);

  const handleProcess = useCallback(async () => {
    if (!fileInfo) return;

    setProcessing(true);
    if (processedUrl) {
      URL.revokeObjectURL(processedUrl);
      setProcessedUrl(null);
    }
    setProcessedBlob(null);

    try {
      const processedBuffer = processAudio(fileInfo.buffer, options);
      const blob = encodeWav(processedBuffer);
      setProcessedBlob(blob);
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      toast.add({
        title: 'Processing complete',
        description: `Output: ${formatFileSize(blob.size)}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed';
      toast.add({ title: 'Error', description: message, type: "error" });
    } finally {
      setProcessing(false);
    }
  }, [fileInfo, options, processedUrl]);

  const handleDownload = useCallback(() => {
    if (!processedBlob || !fileInfo) return;
    const baseName = fileInfo.file.name.replace(/\.[^.]+$/, '');
    downloadBlob(processedBlob, `${baseName}-processed.wav`);
  }, [processedBlob, fileInfo]);

  const handleReset = useCallback(() => {
    cleanupUrls();
    setFileInfo(null);
    setOptions(getDefaultOptions());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [cleanupUrls]);

  const updateOption = useCallback(
    <K extends keyof NoiseGateOptions>(key: K, value: NoiseGateOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-2xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Audio Noise Gate</h1>
            <p className="text-muted-foreground">
              ノイズゲートとフィルタでオーディオのノイズを除去します
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>ファイル選択</CardTitle>
              <CardDescription>処理するオーディオファイルを選択してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
              />
              {fileInfo && (
                <div className="text-sm text-muted-foreground space-y-1 rounded-md bg-muted p-3">
                  <p>ファイル名: {fileInfo.file.name}</p>
                  <p>サイズ: {formatFileSize(fileInfo.file.size)}</p>
                  <p>再生時間: {formatDuration(fileInfo.duration)}</p>
                  <p>サンプルレート: {fileInfo.buffer.sampleRate} Hz</p>
                  <p>チャンネル: {fileInfo.buffer.numberOfChannels}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ノイズゲート設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <Label>スレッショルド</Label>
                  <span className="text-sm text-muted-foreground">{options.thresholdDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="0"
                  step="1"
                  value={options.thresholdDb}
                  onChange={(e) => updateOption('thresholdDb', Number(e.target.value))}
                  className="w-full mt-1"
                  aria-label="スレッショルド (dB)"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>-80 dB</span>
                  <span>0 dB</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>アタック (ms)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={options.attackMs}
                    onChange={(e) =>
                      updateOption('attackMs', Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>リリース (ms)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    step="1"
                    value={options.releaseMs}
                    onChange={(e) =>
                      updateOption('releaseMs', Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>フィルター設定</CardTitle>
              <CardDescription>
                ハイパスとローパスフィルタで不要な周波数帯を除去
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ハイパスフィルタ (Hz)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1000"
                    step="10"
                    value={options.highPassFreq}
                    onChange={(e) =>
                      updateOption('highPassFreq', Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>ローパスフィルタ (Hz)</Label>
                  <Input
                    type="number"
                    min="1000"
                    max="22000"
                    step="100"
                    value={options.lowPassFreq}
                    onChange={(e) =>
                      updateOption('lowPassFreq', Math.max(1000, parseInt(e.target.value) || 1000))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleProcess}
              disabled={!fileInfo || processing}
              className="flex-1"
            >
              {processing ? '処理中...' : '処理実行'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              リセット
            </Button>
          </div>

          {(originalUrl || processedUrl) && (
            <Card>
              <CardHeader>
                <CardTitle>プレビュー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {originalUrl && (
                  <div>
                    <p className="text-sm font-medium mb-2">オリジナル</p>
                    <audio controls src={originalUrl} className="w-full" />
                  </div>
                )}
                {processedUrl && (
                  <div>
                    <p className="text-sm font-medium mb-2">処理済み</p>
                    <audio controls src={processedUrl} className="w-full" />
                  </div>
                )}
                {processedBlob && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      出力サイズ: {formatFileSize(processedBlob.size)}
                    </p>
                    <Button type="button" onClick={handleDownload} className="w-full">
                      ダウンロード
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
