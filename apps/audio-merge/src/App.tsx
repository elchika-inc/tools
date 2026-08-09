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
  type AudioTrack,
  type MergeOptions,
  getDefaultMergeOptions,
  generateId,
  formatDuration,
  formatFileSize,
  moveTrack,
  removeTrack,
  calculateTotalDuration,
  decodeAudioFile,
  mergeAudioBuffers,
  encodeWav,
  downloadBlob,
} from '@/utils/audioMerge';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE_RATES = [22050, 44100, 48000];

export default function App() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [options, setOptions] = useState<MergeOptions>(getDefaultMergeOptions());
  const [merging, setMerging] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: AudioTrack[] = [];

    for (const file of Array.from(files)) {
      try {
        const buffer = await decodeAudioFile(file);
        newTracks.push({
          id: generateId(),
          file,
          name: file.name,
          duration: buffer.duration,
          sampleRate: buffer.sampleRate,
          channels: buffer.numberOfChannels,
          buffer,
        });
      } catch {
        toast.add({
          title: 'Error',
          description: `Failed to load: ${file.name}`,
          type: "error",
        });
      }
    }

    if (newTracks.length > 0) {
      setTracks((prev) => [...prev, ...newTracks]);
      toast.add({
        title: 'Files loaded',
        description: `${newTracks.length} file(s) added`,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleMove = useCallback((index: number, direction: 'up' | 'down') => {
    setTracks((prev) => moveTrack(prev, index, direction));
  }, []);

  const handleRemove = useCallback((index: number) => {
    setTracks((prev) => removeTrack(prev, index));
  }, []);

  const handleMerge = useCallback(async () => {
    if (tracks.length < 2) {
      toast.add({
        title: 'Error',
        description: 'At least 2 tracks are required to merge.',
        type: "error",
      });
      return;
    }

    setMerging(true);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setResultBlob(null);

    try {
      const mergedBuffer = mergeAudioBuffers(tracks, options);
      const blob = encodeWav(mergedBuffer);
      setResultBlob(blob);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      toast.add({
        title: 'Merge complete',
        description: `Output: ${formatFileSize(blob.size)}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Merge failed';
      toast.add({ title: 'Error', description: message, type: "error" });
    } finally {
      setMerging(false);
    }
  }, [tracks, options, resultUrl]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, 'merged-audio.wav');
  }, [resultBlob]);

  const handleClear = useCallback(() => {
    setTracks([]);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setResultBlob(null);
    setOptions(getDefaultMergeOptions());
  }, [resultUrl]);

  const totalDuration = calculateTotalDuration(tracks, options);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-2xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Audio Merge</h1>
            <p className="text-muted-foreground">
              複数のオーディオファイルを結合します
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>ファイル追加</CardTitle>
              <CardDescription>結合するオーディオファイルを選択してください</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFilesChange}
              />
            </CardContent>
          </Card>

          {tracks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>トラック一覧 ({tracks.length})</CardTitle>
                <CardDescription>
                  合計: {formatDuration(totalDuration)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-2 p-3 rounded-md border bg-muted/50"
                  >
                    <span className="text-sm font-mono text-muted-foreground w-6 text-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(track.duration)} / {track.sampleRate}Hz / {track.channels}ch
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === tracks.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(index)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>結合設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ギャップ (秒)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={options.gapSeconds}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        gapSeconds: Math.max(0, parseFloat(e.target.value) || 0),
                        crossfadeSeconds: 0,
                      }))
                    }
                    disabled={options.crossfadeSeconds > 0}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>クロスフェード (秒)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={options.crossfadeSeconds}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        crossfadeSeconds: Math.max(0, parseFloat(e.target.value) || 0),
                        gapSeconds: 0,
                      }))
                    }
                    disabled={options.gapSeconds > 0}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>出力サンプルレート</Label>
                <Select
                  value={String(options.outputSampleRate)}
                  onValueChange={(v) =>
                    setOptions((prev) => ({ ...prev, outputSampleRate: Number(v) }))
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
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleMerge}
              disabled={tracks.length < 2 || merging}
              className="flex-1"
            >
              {merging ? '結合中...' : '結合'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              クリア
            </Button>
          </div>

          {resultUrl && resultBlob && (
            <Card>
              <CardHeader>
                <CardTitle>結合結果</CardTitle>
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
