import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calcBiorhythm, calcBiorhythmSeries } from '@/utils/biorhythm';
import { ToastToaster } from "@/components/ui/toast";

const TODAY = new Date().toISOString().slice(0, 10);

function toDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function levelLabel(v: number): string {
  if (v > 0.5) return '高';
  if (v < -0.5) return '低';
  return '普通';
}

export default function App() {
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [targetDate, setTargetDate] = useState(TODAY);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const birth = toDate(birthDate);
  const target = toDate(targetDate);

  const todayValues = useMemo(() => {
    if (!birth || !target) return null;
    try { return calcBiorhythm(birth, target); }
    catch { return null; }
  }, [birth, target]);

  const series = useMemo(() => {
    if (!birth || !target) return null;
    try { return calcBiorhythmSeries(birth, target, 30); }
    catch { return null; }
  }, [birth, target]);

  useEffect(() => {
    if (!series || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const pad = 20;
    const midY = H / 2;
    const scaleX = (W - pad * 2) / series.dates.length;
    const scaleY = (H - pad * 2) / 2;

    ctx.clearRect(0, 0, W, H);

    // ゼロライン
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(pad, midY);
    ctx.lineTo(W - pad, midY);
    ctx.stroke();

    const draw = (data: number[], color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      data.forEach((v, i) => {
        const x = pad + i * scaleX;
        const y = midY - v * scaleY;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    draw(series.physical, '#ef4444');
    draw(series.emotional, '#3b82f6');
    draw(series.intellectual, '#22c55e');
  }, [series]);

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Biorhythm</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">生年月日からバイオリズムを計算</p>
          </div>

          <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>生年月日</Label>
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>対象日</Label>
                <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {todayValues && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '身体', value: todayValues.physical, color: 'text-red-600 dark:text-red-400' },
                  { label: '感情', value: todayValues.emotional, color: 'text-blue-600 dark:text-blue-400' },
                  { label: '知性', value: todayValues.intellectual, color: 'text-green-600 dark:text-green-400' },
                ].map((item) => (
                  <Card key={item.label}>
                    <CardContent className="pt-4 text-center">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className={`text-2xl font-bold ${item.color}`}>{levelLabel(item.value)}</p>
                      <p className="text-xs text-gray-400">{(item.value * 100).toFixed(0)}%</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex gap-4">
                    <span className="text-red-500">— 身体 (23日)</span>
                    <span className="text-blue-500">— 感情 (28日)</span>
                    <span className="text-green-500">— 知性 (33日)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <canvas ref={canvasRef} width={560} height={160} className="w-full" />
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
      </div>
  </ToastToaster>;
}
