import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Grid3X3, ArrowRight } from 'lucide-react';
import {
  latLngToGridCell,
  gridCellToLatLng,
  cellSizeAtLatitude,
  totalCells,
  RESOLUTIONS,
} from '@/utils/gridReference';
import type { GridCell } from '@/utils/gridReference';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [mode, setMode] = useState<'toGrid' | 'toLatLng'>('toGrid');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [cellId, setCellId] = useState('');
  const [resolution, setResolution] = useState(0.01);
  const [gridResult, setGridResult] = useState<GridCell | null>(null);
  const [latLngResult, setLatLngResult] = useState<{ lat: number; lng: number } | null>(null);
  const handleToGrid = () => {
    try {
      const result = latLngToGridCell(parseFloat(lat), parseFloat(lng), resolution);
      setGridResult(result);
      setLatLngResult(null);
      toast.add({ title: `Grid cell: ${result.id}` });
    } catch (e) {
      toast.add({ title: 'Error', description: String(e), type: "error" });
    }
  };

  const handleToLatLng = () => {
    try {
      const result = gridCellToLatLng(cellId, resolution);
      setLatLngResult(result);
      setGridResult(null);
      toast.add({ title: `Center: ${result.lat}, ${result.lng}` });
    } catch (e) {
      toast.add({ title: 'Error', description: String(e), type: "error" });
    }
  };

  const copyResult = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const currentSize = lat ? cellSizeAtLatitude(parseFloat(lat) || 0, resolution) : null;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Grid Reference Converter</h1>
            <p className="text-muted-foreground">
              Convert coordinates to grid cell references and back. Educational tool for understanding geographic grid systems.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Resolution</CardTitle>
              <CardDescription>Select grid cell size</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {RESOLUTIONS.map((r) => (
                  <Button
                    key={r.degrees}
                    type="button"
                    variant={resolution === r.degrees ? 'default' : 'outline'}
                    onClick={() => setResolution(r.degrees)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Total cells: {totalCells(resolution).toLocaleString()} |{' '}
                {RESOLUTIONS.find((r) => r.degrees === resolution)?.description}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'toGrid' ? 'default' : 'outline'}
              onClick={() => setMode('toGrid')}
            >
              Lat/Lng → Grid
            </Button>
            <Button
              type="button"
              variant={mode === 'toLatLng' ? 'default' : 'outline'}
              onClick={() => setMode('toLatLng')}
            >
              Grid → Lat/Lng
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                {mode === 'toGrid' ? 'Coordinate to Grid Cell' : 'Grid Cell to Coordinate'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'toGrid' ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input id="lat" type="number" step="any" placeholder="e.g. 35.6895" value={lat} onChange={(e) => setLat(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input id="lng" type="number" step="any" placeholder="e.g. 139.6917" value={lng} onChange={(e) => setLng(e.target.value)} />
                    </div>
                  </div>
                  <Button type="button" onClick={handleToGrid} disabled={!lat || !lng}>
                    <ArrowRight className="mr-2 h-4 w-4" /> Convert to Grid Cell
                  </Button>
                  {gridResult && (
                    <div className="p-4 rounded-md bg-muted space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-mono font-bold">{gridResult.id}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => copyResult(gridResult.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Center: {gridResult.centerLat}, {gridResult.centerLng}
                      </p>
                      {currentSize && (
                        <p className="text-sm text-muted-foreground">
                          Cell size: {currentSize.widthKm.toFixed(3)} km x {currentSize.heightKm.toFixed(3)} km
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cellId">Grid Cell ID</Label>
                    <Input id="cellId" placeholder="e.g. R1256C3196" value={cellId} onChange={(e) => setCellId(e.target.value)} />
                  </div>
                  <Button type="button" onClick={handleToLatLng} disabled={!cellId}>
                    <ArrowRight className="mr-2 h-4 w-4" /> Convert to Lat/Lng
                  </Button>
                  {latLngResult && (
                    <div className="p-4 rounded-md bg-muted space-y-2">
                      <p className="text-lg font-mono">
                        Lat: {latLngResult.lat}, Lng: {latLngResult.lng}
                      </p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => copyResult(`${latLngResult.lat}, ${latLngResult.lng}`)}>
                        <Copy className="mr-2 h-4 w-4" /> Copy
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How Grid Referencing Works</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-muted-foreground space-y-2">
              <p>
                A geographic grid reference system divides the Earth's surface into a regular grid of cells.
                Each cell is identified by a row and column index.
              </p>
              <p>
                The grid starts at the bottom-left corner (-90 latitude, -180 longitude).
                Row numbers increase northward, column numbers increase eastward.
              </p>
              <p>
                The resolution determines the size of each cell. A 1-degree resolution creates cells of approximately
                111 km x 111 km at the equator. Smaller resolutions create finer grids for more precise referencing.
              </p>
              <p>
                Note: Cell width (in km) decreases toward the poles because meridians converge,
                while cell height remains constant.
              </p>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
