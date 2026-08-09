import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SENSOR_SIZES, calcDepthOfField } from "@/utils/depthOfField";

const F_NUMBERS = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

function formatDistance(mm: number): string {
  if (mm === Infinity) return "∞";
  return mm >= 1000 ? `${(mm / 1000).toFixed(2)}m` : `${mm.toFixed(0)}mm`;
}

export default function App() {
  const [focalLength, setFocalLength] = useState("50");
  const [fNumber, setFNumber] = useState("8");
  const [subjectDistance, setSubjectDistance] = useState("3");
  const [sensorId, setSensorId] = useState("ff");

  const result = useMemo(() => {
    const fl = Number(focalLength);
    const fn = Number(fNumber);
    const sd = Number(subjectDistance) * 1000; // m→mm
    if (!fl || !fn || !sd) return null;
    try {
      return calcDepthOfField({ focalLength: fl, fNumber: fn, subjectDistance: sd, sensorId });
    } catch {
      return null;
    }
  }, [focalLength, fNumber, subjectDistance, sensorId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <div className="mb-2">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Tools トップに戻る
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Depth of Field Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">被写界深度・超焦点距離を計算</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>撮影設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>焦点距離 (mm)</Label>
                <Input
                  type="number"
                  min="1"
                  value={focalLength}
                  onChange={(e) => setFocalLength(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>f値</Label>
                <Select value={fNumber} onValueChange={setFNumber}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {F_NUMBERS.map((f) => (
                      <SelectItem key={f} value={String(f)}>
                        f/{f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>被写体距離 (m)</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={subjectDistance}
                  onChange={(e) => setSubjectDistance(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>センサーサイズ</Label>
                <Select value={sensorId} onValueChange={setSensorId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SENSOR_SIZES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>計算結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-500">被写界深度</p>
                  <p className="text-xl font-bold">{formatDistance(result.dof)}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-500">超焦点距離</p>
                  <p className="text-xl font-bold">{formatDistance(result.hyperfocalDistance)}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-500">ピント前景限界</p>
                  <p className="text-xl font-bold">{formatDistance(result.nearLimit)}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-500">ピント後景限界</p>
                  <p className="text-xl font-bold">{formatDistance(result.farLimit)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">許容錯乱円径: {result.coc}mm</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
