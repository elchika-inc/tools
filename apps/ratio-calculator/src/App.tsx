import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy } from 'lucide-react';
import { RATIOS, getRatio, split, scale, formatNumber, type RatioKey } from '@/utils/ratio';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [length, setLength] = useState(1000);
  const [ratioKey, setRatioKey] = useState<RatioKey>('golden');
  const current = getRatio(ratioKey);
  const splitResult = useMemo(() => split(length, current.value), [length, current.value]);
  const scaleResult = useMemo(() => scale(length, current.value), [length, current.value]);

  const copy = async (value: number, label: string) => {
    try {
      const text = formatNumber(value);
      await navigator.clipboard.writeText(text);
      toast.add({ title: `Copied ${label}: ${text}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const previewMaxWidth = 360;
  // long の幅割合 = long / total = ratio / (ratio + 1)（long : short = ratio : 1 のため）
  const longRatio = current.value > 0 ? current.value / (current.value + 1) : 0.5;
  const previewWidth = previewMaxWidth;
  const previewHeight = current.value > 0 ? previewMaxWidth / current.value : previewMaxWidth;

  return <ToastToaster>
  <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">📐 比率計算ツール</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              黄金比・白銀比・白金比・青銅比で長さを分割・拡縮するツール。長方形プレビューと4比率の早見表つき。
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              🔒 すべての処理はブラウザ内で完結 - データは外部に送信・保存されません
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>入力と比率</CardTitle>
                <CardDescription>長さと比率を選ぶと、分割・拡縮の結果を表示します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="length">長さ</Label>
                  <Input
                    id="length"
                    type="number"
                    min={0}
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>比率</Label>
                  <Select value={ratioKey} onValueChange={(v) => setRatioKey(v as RatioKey)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RATIOS.map((r) => (
                        <SelectItem key={r.key} value={r.key}>
                          {r.label}（{formatNumber(r.value)} : 1）
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center pt-2">
                  <div
                    className="relative border-2 border-primary rounded-md bg-primary/10 flex"
                    style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, maxWidth: '100%' }}
                  >
                    <div
                      className="flex items-center justify-center text-xs text-muted-foreground border-r-2 border-primary/60"
                      style={{ width: `${longRatio * 100}%` }}
                    >
                      long
                    </div>
                    <div className="flex items-center justify-center text-xs text-muted-foreground flex-1">
                      short
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{current.label} の計算結果</CardTitle>
                <CardDescription>{formatNumber(current.value)} : 1</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">全体分割（長さ {formatNumber(length)} を分割）</p>
                  <ResultRow label="長い部分 (long)" value={splitResult.long} onCopy={copy} />
                  <ResultRow label="短い部分 (short)" value={splitResult.short} onCopy={copy} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">拡大・縮小</p>
                  <ResultRow label="拡大 (×比率)" value={scaleResult.larger} onCopy={copy} />
                  <ResultRow label="縮小 (÷比率)" value={scaleResult.smaller} onCopy={copy} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>4比率の早見表</CardTitle>
              <CardDescription>長さ {formatNumber(length)} に対する各比率の分割値。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">比率</th>
                      <th className="py-2 pr-4 font-medium">値</th>
                      <th className="py-2 pr-4 font-medium">long</th>
                      <th className="py-2 pr-4 font-medium">short</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RATIOS.map((r) => {
                      const s = split(length, r.value);
                      return (
                        <tr key={r.key} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            {r.label}
                            <span className="ml-1 text-xs text-muted-foreground">{r.englishLabel}</span>
                          </td>
                          <td className="py-2 pr-4 font-mono">{formatNumber(r.value)}</td>
                          <td className="py-2 pr-4 font-mono">{formatNumber(s.long)}</td>
                          <td className="py-2 pr-4 font-mono">{formatNumber(s.short)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}

function ResultRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: number;
  onCopy: (value: number, label: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-medium">{formatNumber(value)}</span>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(value, label)}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
