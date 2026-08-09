import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  calcEV,
  calcShutterSpeed,
  calcFNumber,
  calcISO,
  formatShutterSpeed,
  STANDARD_F_NUMBERS,
  STANDARD_SHUTTER_SPEEDS,
  STANDARD_ISO_VALUES,
} from '@/utils/exposure';
import { ToastToaster } from "@/components/ui/toast";

type Solve = 'ev' | 'ss' | 'f' | 'iso';

export default function App() {
  const [solve, setSolve] = useState<Solve>('ev');
  const [fVal, setFVal] = useState('8');
  const [ssVal, setSsVal] = useState('0.008');
  const [isoVal, setIsoVal] = useState('100');
  const [evVal, setEvVal] = useState('13');

  const compute = () => {
    try {
      const f = Number(fVal);
      const ss = Number(ssVal);
      const iso = Number(isoVal);
      const ev = Number(evVal);
      switch (solve) {
        case 'ev':
          return { label: 'EV値', value: calcEV(f, ss, iso).toFixed(2) };
        case 'ss':
          return {
            label: 'シャッタースピード',
            value: formatShutterSpeed(calcShutterSpeed(ev, f, iso)),
          };
        case 'f':
          return { label: 'f値', value: `f/${calcFNumber(ev, ss, iso).toFixed(1)}` };
        case 'iso':
          return { label: 'ISO', value: Math.round(calcISO(ev, f, ss)).toString() };
      }
    } catch {
      return null;
    }
  };

  const result = compute();

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Exposure Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              EV値・f値・ISO・シャッタースピードの相互計算
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>算出する値</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              {(['ev', 'ss', 'f', 'iso'] as Solve[]).map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={solve === s ? 'default' : 'outline'}
                  onClick={() => setSolve(s)}
                >
                  {s === 'ev' ? 'EV値' : s === 'ss' ? 'SS' : s === 'f' ? 'f値' : 'ISO'}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>既知の値を入力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {solve !== 'f' && (
                <div className="space-y-2">
                  <Label>f値</Label>
                  <Select value={fVal} onValueChange={setFVal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STANDARD_F_NUMBERS.map((f) => (
                        <SelectItem key={f} value={String(f)}>
                          f/{f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {solve !== 'ss' && (
                <div className="space-y-2">
                  <Label>シャッタースピード (秒)</Label>
                  <Select value={ssVal} onValueChange={setSsVal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STANDARD_SHUTTER_SPEEDS.map((ss) => (
                        <SelectItem key={ss} value={String(ss)}>
                          {formatShutterSpeed(ss)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {solve !== 'iso' && (
                <div className="space-y-2">
                  <Label>ISO感度</Label>
                  <Select value={isoVal} onValueChange={setIsoVal}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STANDARD_ISO_VALUES.map((iso) => (
                        <SelectItem key={iso} value={String(iso)}>
                          ISO {iso}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {solve !== 'ev' && (
                <div className="space-y-2">
                  <Label>EV値</Label>
                  <Input
                    type="number"
                    value={evVal}
                    onChange={(e) => setEvVal(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">{result.label}</p>
                <p className="text-4xl font-bold mt-2">{result.value}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
      </div>
  </ToastToaster>;
}
