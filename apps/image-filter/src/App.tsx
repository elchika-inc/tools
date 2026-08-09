import { RotateCcw, Upload } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { buildFilter, DEFAULT_FILTERS, FILTER_PRESETS } from '@/utils/imageFilter';
import { ToastToaster } from "@/components/ui/toast";

const SLIDERS = [
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, unit: '%' },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, unit: '%' },
  { key: 'saturate', label: 'Saturate', min: 0, max: 200, unit: '%' },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, unit: '%' },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, unit: '%' },
  { key: 'blur', label: 'Blur', min: 0, max: 20, unit: 'px' },
  { key: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, unit: 'deg' },
  { key: 'invert', label: 'Invert', min: 0, max: 100, unit: '%' },
] as const;

export default function App() {
  const [src, setSrc] = useState('');
  const [filters, setFilters] = useState<Record<string, number>>({ ...DEFAULT_FILTERS });
  const fileRef = useRef<HTMLInputElement>(null);

  const filterStr = useMemo(() => buildFilter(filters), [filters]);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setSrc(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Image Filter</h1>
            <p className="text-muted-foreground">画像にフィルター効果を適用します。</p>
          </header>

          <main>
            {!src && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">画像を選択</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="画像ファイルを選択"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0]);
                  }}
                />
              </button>
            )}

            {src && (
              <div className="grid gap-4 md:grid-cols-[280px,1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {SLIDERS.map((s) => (
                      <div key={s.key} className="space-y-1">
                        <Label className="text-xs">
                          {s.label}: {filters[s.key]}
                          {s.unit}
                        </Label>
                        <input
                          type="range"
                          min={s.min}
                          max={s.max}
                          value={filters[s.key]}
                          onChange={(e) =>
                            setFilters((p) => ({ ...p, [s.key]: Number(e.target.value) }))
                          }
                          className="w-full"
                          aria-label={`${s.label}: ${filters[s.key]}${s.unit}`}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setFilters({ ...DEFAULT_FILTERS })}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    <div className="pt-2 border-t space-y-1">
                      <Label className="text-xs text-muted-foreground">Presets</Label>
                      <div className="grid grid-cols-2 gap-1">
                        {FILTER_PRESETS.map((p) => (
                          <button
                            type="button"
                            key={p.name}
                            onClick={() => {
                              setFilters({ ...DEFAULT_FILTERS }); /* Apply preset via img style */
                            }}
                            className="px-2 py-1 rounded text-xs border hover:bg-muted"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preview</CardTitle>
                    <CardDescription>filter: {filterStr}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={src}
                      alt="フィルター適用後プレビュー"
                      className="max-w-full rounded border"
                      style={{ filter: filterStr }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
