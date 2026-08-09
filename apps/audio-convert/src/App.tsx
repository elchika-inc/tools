import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type OutputFormat,
  type ConvertOptions,
  FORMAT_OPTIONS,
  SAMPLE_RATES,
  BIT_RATES,
  getDefaultOptions,
  convertAudio,
  downloadBlob,
  getOutputFileName,
  formatFileSize,
  formatDuration,
} from '@/utils/audioConvert';
import { toast, ToastToaster } from "@/components/ui/toast";

interface FileInfo {
  file: File;
  duration: number;
  sampleRate: number;
  channels: number;
}

export default function App() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [options, setOptions] = useState<ConvertOptions>(getDefaultOptions());
  const [converting, setConverting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResultBlob(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      await audioContext.close();

      setFileInfo({
        file,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
      });

      toast.add({ title: 'File loaded', description: file.name });
    } catch {
      toast.add({
        title: 'Error',
        description: 'Failed to load audio file. Please check the format.',
        type: "error",
      });
      setFileInfo(null);
    }
  }, [resultUrl]);

  const handleConvert = useCallback(async () => {
    if (!fileInfo) return;

    setConverting(true);
    setResultBlob(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    try {
      const { blob } = await convertAudio(fileInfo.file, options);
      setResultBlob(blob);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      toast.add({ title: 'Conversion complete', description: formatFileSize(blob.size) });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Conversion failed';
      toast.add({ title: 'Error', description: message, type: "error" });
    } finally {
      setConverting(false);
    }
  }, [fileInfo, options, resultUrl]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !fileInfo) return;
    const fileName = getOutputFileName(fileInfo.file.name, options.format);
    downloadBlob(resultBlob, fileName);
  }, [resultBlob, fileInfo, options.format]);

  const handleReset = useCallback(() => {
    setFileInfo(null);
    setResultBlob(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setOptions(getDefaultOptions());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resultUrl]);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-2xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Audio Convert</h1>
            <p className="text-muted-foreground">
              オーディオファイルのフォーマットを変換します
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>ファイル選択</CardTitle>
              <CardDescription>変換するオーディオファイルを選択してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="audio-file">オーディオファイル</Label>
                <Input
                  id="audio-file"
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>
              {fileInfo && (
                <div className="text-sm text-muted-foreground space-y-1 rounded-md bg-muted p-3">
                  <p>ファイル名: {fileInfo.file.name}</p>
                  <p>サイズ: {formatFileSize(fileInfo.file.size)}</p>
                  <p>再生時間: {formatDuration(fileInfo.duration)}</p>
                  <p>サンプルレート: {fileInfo.sampleRate} Hz</p>
                  <p>チャンネル: {fileInfo.channels}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>変換設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>出力フォーマット</Label>
                <Select
                  value={options.format}
                  onValueChange={(v) => setOptions((prev) => ({ ...prev, format: v as OutputFormat }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((fmt) => (
                      <SelectItem key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>サンプルレート</Label>
                <Select
                  value={String(options.sampleRate)}
                  onValueChange={(v) =>
                    setOptions((prev) => ({ ...prev, sampleRate: Number(v) }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_RATES.map((rate) => (
                      <SelectItem key={rate} value={String(rate)}>
                        {rate} Hz
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {options.format !== 'wav' && (
                <div>
                  <Label>ビットレート</Label>
                  <Select
                    value={String(options.bitRate)}
                    onValueChange={(v) =>
                      setOptions((prev) => ({ ...prev, bitRate: Number(v) }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BIT_RATES.map((rate) => (
                        <SelectItem key={rate} value={String(rate)}>
                          {rate} kbps
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleConvert}
              disabled={!fileInfo || converting}
              className="flex-1"
            >
              {converting ? '変換中...' : '変換'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              リセット
            </Button>
          </div>

          {resultUrl && resultBlob && (
            <Card>
              <CardHeader>
                <CardTitle>変換結果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>出力サイズ: {formatFileSize(resultBlob.size)}</p>
                </div>
                <audio controls src={resultUrl} className="w-full" />
                <Button type="button" onClick={handleDownload} className="w-full">
                  ダウンロード
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
