import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, RotateCcw } from 'lucide-react';
import {
  generateFilterCss,
  generateFilterStyleValue,
  isDefault,
  DEFAULT_FILTER_VALUES,
  FILTER_CONFIGS,
  type FilterValues,
} from '@/utils/filterGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [values, setValues] = useState<FilterValues>({ ...DEFAULT_FILTER_VALUES });
  const filterCss = generateFilterCss(values);
  const filterStyle = generateFilterStyleValue(values);

  const updateValue = (key: keyof FilterValues, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setValues({ ...DEFAULT_FILTER_VALUES });
    toast.add({ title: 'Filters reset to defaults' });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(filterCss);
      toast.add({ title: 'CSS copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">CSS Filter Generator</h1>
            <p className="text-muted-foreground">
              Adjust CSS filter properties with sliders and see the result in real-time.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Filters are applied to the gradient below.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="w-full h-48 rounded-md"
                style={{
                  filter: filterStyle,
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #fda085 100%)',
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Drag the sliders to adjust each filter.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={reset}
                disabled={isDefault(values)}
              >
                <RotateCcw className="mr-1 h-4 w-4" /> Reset
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {FILTER_CONFIGS.map((config) => (
                <div key={config.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{config.label}</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {values[config.key]}
                      {config.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={values[config.key]}
                    onChange={(e) => updateValue(config.key, parseFloat(e.target.value))}
                    className="w-full accent-primary"
                    aria-label={config.label}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated CSS</CardTitle>
              <Button type="button" size="sm" onClick={copyToClipboard}>
                <Copy className="mr-1 h-4 w-4" /> Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-md bg-muted text-sm overflow-auto">
                <code>{filterCss}</code>
              </pre>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
