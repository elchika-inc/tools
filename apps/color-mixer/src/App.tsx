import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { generateMixSteps, mixTwo } from '@/utils/colorMixer';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [color1, setColor1] = useState('#ff0000');
  const [color2, setColor2] = useState('#0000ff');
  const [ratio, setRatio] = useState(50);
  const mixed = useMemo(() => mixTwo(color1, color2, ratio), [color1, color2, ratio]);
  const steps = useMemo(() => generateMixSteps(color1, color2, 11), [color1, color2]);

  const copyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast.add({ title: `${hex} copied` });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Color Mixer</h1>
            <p className="text-muted-foreground">2色を混合して新しい色を作ります。</p>
          </header>

          <main>
            <Card>
              <CardHeader>
                <CardTitle>Mixer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                      className="w-16 h-16 rounded cursor-pointer border-0"
                      aria-label="カラー1"
                    />
                    <div className="text-xs font-mono mt-1">{color1}</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label>Ratio: {ratio}%</Label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={ratio}
                      onChange={(e) => setRatio(Number(e.target.value))}
                      className="w-full"
                      aria-label="混合比率"
                      aria-valuetext={`${ratio}%`}
                    />
                  </div>
                  <div className="text-center">
                    <input
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      className="w-16 h-16 rounded cursor-pointer border-0"
                      aria-label="カラー2"
                    />
                    <div className="text-xs font-mono mt-1">{color2}</div>
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className="w-32 h-32 rounded-lg border mx-auto"
                    style={{ backgroundColor: mixed }}
                    aria-label={`混合カラープレビュー: ${mixed}`}
                  />
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <code className="text-lg font-mono font-bold">{mixed}</code>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => copyColor(mixed)}
                      aria-label="混合色をコピー"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">Mix Steps</Label>
                  <div className="flex rounded-lg overflow-hidden mt-1">
                    {steps.map((hex) => (
                      <button
                        type="button"
                        key={hex}
                        onClick={() => copyColor(hex)}
                        className="flex-1 h-12 relative group"
                        style={{ backgroundColor: hex }}
                        aria-label={`${hex} をコピー`}
                      >
                        <span className="absolute bottom-0 left-0 right-0 text-[8px] font-mono text-center opacity-0 group-hover:opacity-100 bg-black/50 text-white py-0.5">
                          {hex}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
