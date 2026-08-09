import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, MapPin, Navigation } from 'lucide-react';
import {
  calculateDistance,
  bearingToCompass,
  isValidLatitude,
  isValidLongitude,
} from '@/utils/geoDistance';
import type { DistanceResult } from '@/utils/geoDistance';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [lat1, setLat1] = useState('');
  const [lng1, setLng1] = useState('');
  const [lat2, setLat2] = useState('');
  const [lng2, setLng2] = useState('');
  const [result, setResult] = useState<DistanceResult | null>(null);
  const handleCalculate = () => {
    const la1 = parseFloat(lat1);
    const lo1 = parseFloat(lng1);
    const la2 = parseFloat(lat2);
    const lo2 = parseFloat(lng2);

    if (!isValidLatitude(la1) || !isValidLatitude(la2)) {
      toast.add({ title: 'Invalid latitude', description: 'Must be between -90 and 90', type: "error" });
      return;
    }
    if (!isValidLongitude(lo1) || !isValidLongitude(lo2)) {
      toast.add({ title: 'Invalid longitude', description: 'Must be between -180 and 180', type: "error" });
      return;
    }

    const res = calculateDistance(la1, lo1, la2, lo2);
    setResult(res);
    toast.add({ title: 'Distance calculated' });
  };

  const copyResult = async () => {
    if (!result) return;
    const text = `Distance: ${result.km.toFixed(2)} km (${result.miles.toFixed(2)} mi)\nBearing: ${result.bearing.toFixed(2)}° (${bearingToCompass(result.bearing)})`;
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleClear = () => {
    setLat1('');
    setLng1('');
    setLat2('');
    setLng2('');
    setResult(null);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Geo Distance Calculator</h1>
            <p className="text-muted-foreground">
              Calculate the distance and bearing between two geographic coordinates using the Haversine formula.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Point 1
                </CardTitle>
                <CardDescription>Enter the first coordinate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lat1">Latitude</Label>
                  <Input
                    id="lat1"
                    type="number"
                    step="any"
                    placeholder="e.g. 35.6762"
                    value={lat1}
                    onChange={(e) => setLat1(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng1">Longitude</Label>
                  <Input
                    id="lng1"
                    type="number"
                    step="any"
                    placeholder="e.g. 139.6503"
                    value={lng1}
                    onChange={(e) => setLng1(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Point 2
                </CardTitle>
                <CardDescription>Enter the second coordinate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lat2">Latitude</Label>
                  <Input
                    id="lat2"
                    type="number"
                    step="any"
                    placeholder="e.g. 40.7128"
                    value={lat2}
                    onChange={(e) => setLat2(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng2">Longitude</Label>
                  <Input
                    id="lng2"
                    type="number"
                    step="any"
                    placeholder="e.g. -74.0060"
                    value={lng2}
                    onChange={(e) => setLng2(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleCalculate} disabled={!lat1 || !lng1 || !lat2 || !lng2}>
              <Navigation className="mr-2 h-4 w-4" /> Calculate Distance
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Distance (km)</p>
                    <p className="text-2xl font-bold">{result.km.toFixed(2)} km</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Distance (miles)</p>
                    <p className="text-2xl font-bold">{result.miles.toFixed(2)} mi</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bearing</p>
                    <p className="text-2xl font-bold">
                      {result.bearing.toFixed(2)}° {bearingToCompass(result.bearing)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Button type="button" variant="outline" onClick={copyResult}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
