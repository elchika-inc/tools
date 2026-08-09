import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { simulateColorBlind, TYPES } from '@/utils/colorBlind';
import { ToastToaster } from "@/components/ui/toast";

const SAMPLE_COLORS = [
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ff8000',
  '#8000ff',
];

export default function App() {
  const [color, setColor] = useState('#3b82f6');

  const simulations = useMemo(
    () => TYPES.map((t) => ({ ...t, simulated: simulateColorBlind(color, t.id) })),
    [color]
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Color Blind Simulator</h1>
            <p className="text-muted-foreground">色覚特性のシミュレーションを行います。</p>
          </header>

          <main className="space-y-6">
            <div className="flex items-center gap-4">
              <Label>カラー</Label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 rounded cursor-pointer border-0"
                aria-label="シミュレーション対象カラーピッカー"
              />
              <code className="text-sm font-mono">{color}</code>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {simulations.map((sim) => (
                <Card key={sim.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{sim.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{sim.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="h-24 rounded-lg"
                      style={{ backgroundColor: sim.simulated }}
                      aria-label={`${sim.name} シミュレーション: ${sim.simulated}`}
                    />
                    <code className="text-xs font-mono text-muted-foreground mt-1 block">
                      {sim.simulated}
                    </code>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">カラーパレット比較</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {TYPES.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="w-20 text-xs text-muted-foreground">{t.name}</span>
                      <div className="flex gap-1 flex-1">
                        {SAMPLE_COLORS.map((c) => (
                          <div
                            key={`${t.id}-${c}`}
                            className="flex-1 h-8 rounded"
                            style={{ backgroundColor: simulateColorBlind(c, t.id) }}
                            aria-label={`${t.name}: ${simulateColorBlind(c, t.id)}`}
                          />
                        ))}
                      </div>
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
