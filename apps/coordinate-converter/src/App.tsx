import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ArrowDownUp } from 'lucide-react';
import {
  dmsToDecimal,
  decimalToDms,
  formatDms,
  isValidDecimalLatitude,
  isValidDecimalLongitude,
} from '@/utils/coordinateConverter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [mode, setMode] = useState<'dmsToDecimal' | 'decimalToDms'>('decimalToDms');

  // Decimal inputs
  const [decLat, setDecLat] = useState('');
  const [decLng, setDecLng] = useState('');

  // DMS inputs
  const [latDeg, setLatDeg] = useState('');
  const [latMin, setLatMin] = useState('');
  const [latSec, setLatSec] = useState('');
  const [latDir, setLatDir] = useState<'N' | 'S'>('N');
  const [lngDeg, setLngDeg] = useState('');
  const [lngMin, setLngMin] = useState('');
  const [lngSec, setLngSec] = useState('');
  const [lngDir, setLngDir] = useState<'E' | 'W'>('E');

  const [result, setResult] = useState('');
  const handleConvert = () => {
    if (mode === 'decimalToDms') {
      const lat = parseFloat(decLat);
      const lng = parseFloat(decLng);
      if (!isValidDecimalLatitude(lat)) {
        toast.add({ title: 'Invalid latitude', description: 'Must be -90 to 90', type: "error" });
        return;
      }
      if (!isValidDecimalLongitude(lng)) {
        toast.add({ title: 'Invalid longitude', description: 'Must be -180 to 180', type: "error" });
        return;
      }
      const latDms = decimalToDms(lat, true);
      const lngDms = decimalToDms(lng, false);
      setResult(`Lat: ${formatDms(latDms)}\nLng: ${formatDms(lngDms)}`);
      toast.add({ title: 'Converted to DMS' });
    } else {
      const lat = dmsToDecimal({
        degrees: parseInt(latDeg, 10) || 0,
        minutes: parseInt(latMin, 10) || 0,
        seconds: parseFloat(latSec) || 0,
        direction: latDir,
      });
      const lng = dmsToDecimal({
        degrees: parseInt(lngDeg, 10) || 0,
        minutes: parseInt(lngMin, 10) || 0,
        seconds: parseFloat(lngSec) || 0,
        direction: lngDir,
      });
      if (!isValidDecimalLatitude(lat)) {
        toast.add({ title: 'Invalid DMS latitude', type: "error" });
        return;
      }
      if (!isValidDecimalLongitude(lng)) {
        toast.add({ title: 'Invalid DMS longitude', type: "error" });
        return;
      }
      setResult(`Lat: ${lat.toFixed(6)}\nLng: ${lng.toFixed(6)}`);
      toast.add({ title: 'Converted to Decimal' });
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Coordinate Converter</h1>
            <p className="text-muted-foreground">
              Convert between DMS (degrees/minutes/seconds) and decimal degree formats.
            </p>
          </header>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'decimalToDms' ? 'default' : 'outline'}
              onClick={() => { setMode('decimalToDms'); setResult(''); }}
            >
              Decimal → DMS
            </Button>
            <Button
              type="button"
              variant={mode === 'dmsToDecimal' ? 'default' : 'outline'}
              onClick={() => { setMode('dmsToDecimal'); setResult(''); }}
            >
              DMS → Decimal
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownUp className="h-5 w-5" />
                {mode === 'decimalToDms' ? 'Decimal to DMS' : 'DMS to Decimal'}
              </CardTitle>
              <CardDescription>
                {mode === 'decimalToDms'
                  ? 'Enter decimal degrees to convert to DMS format'
                  : 'Enter DMS values to convert to decimal degrees'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mode === 'decimalToDms' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="decLat">Latitude (decimal)</Label>
                    <Input
                      id="decLat"
                      type="number"
                      step="any"
                      placeholder="e.g. 35.6762"
                      value={decLat}
                      onChange={(e) => setDecLat(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decLng">Longitude (decimal)</Label>
                    <Input
                      id="decLng"
                      type="number"
                      step="any"
                      placeholder="e.g. 139.6503"
                      value={decLng}
                      onChange={(e) => setDecLng(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Latitude (DMS)</Label>
                    <div className="flex gap-2 items-center">
                      <Input type="number" placeholder="Deg" value={latDeg} onChange={(e) => setLatDeg(e.target.value)} className="w-20" />
                      <span>&deg;</span>
                      <Input type="number" placeholder="Min" value={latMin} onChange={(e) => setLatMin(e.target.value)} className="w-20" />
                      <span>&prime;</span>
                      <Input type="number" step="any" placeholder="Sec" value={latSec} onChange={(e) => setLatSec(e.target.value)} className="w-24" />
                      <span>&Prime;</span>
                      <select
                        className="h-10 rounded-md border border-input bg-background px-2 text-sm"
                        value={latDir}
                        onChange={(e) => setLatDir(e.target.value as 'N' | 'S')}
                        aria-label="Latitude Direction"
                      >
                        <option value="N">N</option>
                        <option value="S">S</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Longitude (DMS)</Label>
                    <div className="flex gap-2 items-center">
                      <Input type="number" placeholder="Deg" value={lngDeg} onChange={(e) => setLngDeg(e.target.value)} className="w-20" />
                      <span>&deg;</span>
                      <Input type="number" placeholder="Min" value={lngMin} onChange={(e) => setLngMin(e.target.value)} className="w-20" />
                      <span>&prime;</span>
                      <Input type="number" step="any" placeholder="Sec" value={lngSec} onChange={(e) => setLngSec(e.target.value)} className="w-24" />
                      <span>&Prime;</span>
                      <select
                        className="h-10 rounded-md border border-input bg-background px-2 text-sm"
                        value={lngDir}
                        onChange={(e) => setLngDir(e.target.value as 'E' | 'W')}
                        aria-label="Longitude Direction"
                      >
                        <option value="E">E</option>
                        <option value="W">W</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <Button type="button" onClick={handleConvert}>
                Convert
              </Button>

              {result && (
                <div className="mt-4 p-4 rounded-md bg-muted space-y-2">
                  <Label>Result</Label>
                  <pre className="font-mono text-sm whitespace-pre-wrap">{result}</pre>
                  <Button type="button" variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
