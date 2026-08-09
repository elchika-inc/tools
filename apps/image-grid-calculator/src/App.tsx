import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { calcGridColumns, calcImageWidthFromColumns } from '@/utils/imageGrid';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [containerWidth, setContainerWidth] = useState('1200');
  const [imageWidth, setImageWidth] = useState('300');
  const [gap, setGap] = useState('16');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualColumns, setManualColumns] = useState('3');
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.add({ title: 'コピーしました' });
    }).catch(() => {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    });
  };

  const autoResult = useMemo(() => {
    const cw = Number(containerWidth);
    const iw = Number(imageWidth);
    const g = Number(gap);
    if (!cw || !iw || isNaN(g)) return null;
    try {
      return calcGridColumns(cw, iw, g);
    } catch {
      return null;
    }
  }, [containerWidth, imageWidth, gap]);

  const manualResult = useMemo(() => {
    const cw = Number(containerWidth);
    const cols = Number(manualColumns);
    const g = Number(gap);
    if (!cw || !cols || isNaN(g)) return null;
    try {
      return calcImageWidthFromColumns(cw, cols, g);
    } catch {
      return null;
    }
  }, [containerWidth, manualColumns, gap]);

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <header>
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Image Grid Calculator</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">コンテナ幅と画像サイズからグリッド列数を計算</p>
          </header>

          <Card>
            <CardHeader><CardTitle>共通設定</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="container">コンテナ幅 (px)</Label>
                <Input
                  id="container"
                  type="number"
                  min="1"
                  value={containerWidth}
                  onChange={(e) => setContainerWidth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gap">ギャップ (px)</Label>
                <Input
                  id="gap"
                  type="number"
                  min="0"
                  value={gap}
                  onChange={(e) => setGap(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'auto' ? 'default' : 'outline'}
              onClick={() => setMode('auto')}
            >
              画像幅→列数
            </Button>
            <Button
              type="button"
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
            >
              列数→画像幅
            </Button>
          </div>

          {mode === 'auto' && (
            <Card>
              <CardHeader><CardTitle>画像幅から列数を算出</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageWidth">画像幅 (px)</Label>
                  <Input
                    id="imageWidth"
                    type="number"
                    min="1"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                  />
                </div>
                {autoResult && (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <p className="text-2xl font-bold">{autoResult.columns} 列</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">余白: {autoResult.remainder}px</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono">{autoResult.cssGridTemplate}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(autoResult.cssGridTemplate)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {mode === 'manual' && (
            <Card>
              <CardHeader><CardTitle>列数から画像幅を算出</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="columns">列数</Label>
                  <Input
                    id="columns"
                    type="number"
                    min="1"
                    value={manualColumns}
                    onChange={(e) => setManualColumns(e.target.value)}
                  />
                </div>
                {manualResult !== null && (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-2xl font-bold">{manualResult.toFixed(1)} px</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">推奨画像幅</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
  </ToastToaster>;
}
