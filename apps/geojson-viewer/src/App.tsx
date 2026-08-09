import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, Trash2 } from 'lucide-react';
import {
  parseGeoJSON,
  toFeatureCollection,
  calculateBBox,
  render,
  findFeatureAtPoint,
} from '@/utils/geojsonRenderer';
import type { GeoJSONFeatureCollection, GeoJSONFeature } from '@/utils/geojsonRenderer';
import { toast, ToastToaster } from "@/components/ui/toast";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDING = 40;

const SAMPLE_GEOJSON = JSON.stringify(
  {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [139.6917, 35.6895] },
        properties: { name: 'Tokyo' },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[139.5, 35.6], [139.9, 35.6], [139.9, 35.8], [139.5, 35.8], [139.5, 35.6]]],
        },
        properties: { name: 'Tokyo Area' },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[139.6, 35.65], [139.75, 35.7], [139.85, 35.75]],
        },
        properties: { name: 'Route' },
      },
    ],
  },
  null,
  2,
);

export default function App() {
  const [input, setInput] = useState('');
  const [fc, setFc] = useState<GeoJSONFeatureCollection | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [featureCount, setFeatureCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderGeoJSON = useCallback((geojsonStr: string) => {
    try {
      const parsed = parseGeoJSON(geojsonStr);
      const collection = toFeatureCollection(parsed);
      setFc(collection);
      setFeatureCount(collection.features.length);
      setSelectedFeature(null);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      render(ctx, collection, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, padding: PADDING });
      toast.add({ title: `Rendered ${collection.features.length} feature(s)` });
    } catch (e) {
      toast.add({ title: 'Parse error', description: String(e), type: "error" });
    }
  }, [toast]);

  const handleRender = () => {
    renderGeoJSON(input);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    const bbox = calculateBBox(fc);
    const feature = findFeatureAtPoint(x, y, fc, bbox, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, padding: PADDING });
    setSelectedFeature(feature);
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_GEOJSON);
    renderGeoJSON(SAMPLE_GEOJSON);
  };

  const handleClear = () => {
    setInput('');
    setFc(null);
    setSelectedFeature(null);
    setFeatureCount(0);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">GeoJSON Viewer</h1>
            <p className="text-muted-foreground">
              Paste GeoJSON data to visualize on a 2D canvas with equirectangular projection.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>GeoJSON Input</CardTitle>
                <CardDescription>Paste GeoJSON (FeatureCollection, Feature, or Geometry)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                  placeholder='{"type": "FeatureCollection", "features": [...]}'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button type="button" onClick={handleRender} disabled={!input}>
                    <MapPin className="mr-2 h-4 w-4" /> Render
                  </Button>
                  <Button type="button" variant="outline" onClick={handleLoadSample}>
                    Load Sample
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClear}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Map View</CardTitle>
                  <CardDescription>
                    {featureCount > 0 ? `${featureCount} feature(s) rendered. Click to inspect.` : 'No data rendered yet.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="w-full border rounded-md cursor-crosshair"
                    onClick={handleCanvasClick}
                  />
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Point
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> LineString
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Polygon
                    </span>
                  </div>
                </CardContent>
              </Card>

              {selectedFeature && (
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">Type:</span> {selectedFeature.geometry.type}</p>
                      {selectedFeature.properties && Object.entries(selectedFeature.properties).map(([key, value]) => (
                        <p key={key} className="text-sm">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </p>
                      ))}
                      {(!selectedFeature.properties || Object.keys(selectedFeature.properties).length === 0) && (
                        <p className="text-sm text-muted-foreground">No properties</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
