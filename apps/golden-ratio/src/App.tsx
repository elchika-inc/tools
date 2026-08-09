import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { calcRatio, RATIOS } from '@/utils/goldenRatio';
import { toast, ToastToaster } from "@/components/ui/toast";

type Side = 'width' | 'height';

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [side, setSide] = useState<Side>('width');
  const numVal = Number(inputValue);
  const isValid = inputValue !== '' && !isNaN(numVal) && numVal >= 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.add({ title: 'コピーしました' }))
      .catch(() => toast.add({ title: 'コピーに失敗しました', type: "error" }));
  };

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <header>
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Golden Ratio</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">黄金比・白銀比などから寸法を計算</p>
          </header>

          <Card>
            <CardHeader>
              <header>
                <h1 className="text-3xl font-bold tracking-tight">入力</h1>
                <p className="mt-2 text-sm text-muted-foreground">基準となる辺の値を入力してください</p>
              </header>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="value">基準値 (px)</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  placeholder="例: 1200"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={side === 'width' ? 'default' : 'outline'}
                  onClick={() => setSide('width')}
                >
                  幅を指定
                </Button>
                <Button
                  type="button"
                  variant={side === 'height' ? 'default' : 'outline'}
                  onClick={() => setSide('height')}
                >
                  高さを指定
                </Button>
              </div>
            </CardContent>
          </Card>

          {isValid && (
            <div className="space-y-3">
              {RATIOS.map((r) => {
                const other = calcRatio(numVal, side, r.ratio);
                const w = side === 'width' ? numVal : other;
                const h = side === 'height' ? numVal : other;
                const text = `${Math.round(w)} × ${Math.round(h)}`;
                return (
                  <Card key={r.id}>
                    <CardContent className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{r.label}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{r.description}</p>
                        <p className="text-lg font-mono mt-1">
                          {Math.round(w)} × {Math.round(h)} px
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleCopy(text)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
  </ToastToaster>;
}
