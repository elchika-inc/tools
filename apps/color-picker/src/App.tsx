import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getFormats } from '@/utils/colorPicker';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [color, setColor] = useState('#3b82f6');
  const formats = useMemo(() => getFormats(color), [color]);

  const copyValue = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      toast.add({ title: `${v} copied` });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-md mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Color Picker</h1>
            <p className="text-muted-foreground">色を選択してHEX/RGB/HSL形式で取得します。</p>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Picker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-24 h-24 rounded-lg cursor-pointer border-0"
                    aria-label="カラーピッカー"
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="hex-input">HEX</Label>
                    <input
                      id="hex-input"
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    />
                  </div>
                </div>
                <div
                  className="w-full h-16 rounded-lg border"
                  style={{ backgroundColor: color }}
                  aria-label="カラープレビュー"
                />
                <div className="space-y-2 pt-4 border-t">
                  {Object.entries(formats).map(([label, value]) => (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <span className="w-12 text-muted-foreground">{label}</span>
                      <code className="flex-1 font-mono">{value}</code>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => copyValue(value)}
                        aria-label={`${label} をコピー`}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
