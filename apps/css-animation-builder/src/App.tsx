import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Plus, Trash2 } from 'lucide-react';
import {
  generateFullCss,
  generateKeyframesCss,
  createKeyframeId,
  DEFAULT_KEYFRAME_PROPERTIES,
  DEFAULT_ANIMATION_SETTINGS,
  type Keyframe,
  type AnimationSettings,
  type TimingFunction,
  type AnimationDirection,
} from '@/utils/animationBuilder';
import { toast, ToastToaster } from "@/components/ui/toast";

const TIMING_FUNCTIONS: TimingFunction[] = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'];
const DIRECTIONS: AnimationDirection[] = ['normal', 'reverse', 'alternate', 'alternate-reverse'];
const FILL_MODES = ['none', 'forwards', 'backwards', 'both'] as const;

export default function App() {
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    {
      id: createKeyframeId(),
      percentage: 0,
      properties: { ...DEFAULT_KEYFRAME_PROPERTIES },
    },
    {
      id: createKeyframeId(),
      percentage: 100,
      properties: {
        ...DEFAULT_KEYFRAME_PROPERTIES,
        translateX: 200,
        rotate: 360,
        backgroundColor: '#ef4444',
      },
    },
  ]);
  const [settings, setSettings] = useState<AnimationSettings>({
    ...DEFAULT_ANIMATION_SETTINGS,
  });
  const generatedCss = useMemo(
    () => generateFullCss(keyframes, settings),
    [keyframes, settings]
  );

  const keyframesCssForStyle = useMemo(
    () => generateKeyframesCss(keyframes, settings.name),
    [keyframes, settings.name]
  );

  const addKeyframe = () => {
    const maxPct = Math.max(...keyframes.map((kf) => kf.percentage), 0);
    const newPct = Math.min(maxPct + 10, 100);
    setKeyframes((prev) => [
      ...prev,
      {
        id: createKeyframeId(),
        percentage: newPct,
        properties: { ...DEFAULT_KEYFRAME_PROPERTIES },
      },
    ]);
  };

  const removeKeyframe = (id: string) => {
    setKeyframes((prev) => prev.filter((kf) => kf.id !== id));
  };

  const updateKeyframe = (id: string, updates: Partial<Keyframe>) => {
    setKeyframes((prev) =>
      prev.map((kf) => (kf.id === id ? { ...kf, ...updates } : kf))
    );
  };

  const updateKeyframeProperty = (
    id: string,
    key: keyof Keyframe['properties'],
    value: number | string
  ) => {
    setKeyframes((prev) =>
      prev.map((kf) =>
        kf.id === id
          ? { ...kf, properties: { ...kf.properties, [key]: value } }
          : kf
      )
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCss);
      toast.add({ title: 'CSS copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const iterCount =
    settings.iterationCount === 'infinite' ? 'infinite' : String(settings.iterationCount);

  const animationStyle = `
    ${keyframesCssForStyle}
    .preview-element {
      animation-name: ${settings.name};
      animation-duration: ${settings.duration}s;
      animation-timing-function: ${settings.timingFunction};
      animation-delay: ${settings.delay}s;
      animation-iteration-count: ${iterCount};
      animation-direction: ${settings.direction};
      animation-fill-mode: ${settings.fillMode};
    }
  `;

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">CSS Animation Builder</h1>
            <p className="text-muted-foreground">
              Build CSS keyframe animations visually with a live preview.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Animation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={settings.name}
                        onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (s)</Label>
                      <Input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={settings.duration}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, duration: parseFloat(e.target.value) || 1 }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Timing Function</Label>
                      <Select
                        value={settings.timingFunction}
                        onValueChange={(v) =>
                          setSettings((s) => ({ ...s, timingFunction: v as TimingFunction }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMING_FUNCTIONS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Iteration Count</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={settings.iterationCount === 'infinite' ? '' : settings.iterationCount}
                          placeholder="infinite"
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettings((s) => ({
                              ...s,
                              iterationCount: val === '' ? 'infinite' : parseInt(val) || 1,
                            }));
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Direction</Label>
                      <Select
                        value={settings.direction}
                        onValueChange={(v) =>
                          setSettings((s) => ({ ...s, direction: v as AnimationDirection }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIRECTIONS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fill Mode</Label>
                      <Select
                        value={settings.fillMode}
                        onValueChange={(v) =>
                          setSettings((s) => ({
                            ...s,
                            fillMode: v as AnimationSettings['fillMode'],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILL_MODES.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Keyframes</CardTitle>
                    <CardDescription>
                      Add keyframes and set properties for each.
                    </CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={addKeyframe}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {keyframes
                    .sort((a, b) => a.percentage - b.percentage)
                    .map((kf) => (
                      <div key={kf.id} className="rounded-md border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label>%</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              className="w-20"
                              value={kf.percentage}
                              onChange={(e) =>
                                updateKeyframe(kf.id, {
                                  percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeKeyframe(kf.id)}
                            disabled={keyframes.length <= 1}
                            aria-label="Remove keyframe"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Translate X (px)</Label>
                            <Input
                              type="number"
                              value={kf.properties.translateX}
                              onChange={(e) =>
                                updateKeyframeProperty(kf.id, 'translateX', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Translate Y (px)</Label>
                            <Input
                              type="number"
                              value={kf.properties.translateY}
                              onChange={(e) =>
                                updateKeyframeProperty(kf.id, 'translateY', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Rotate (deg)</Label>
                            <Input
                              type="number"
                              value={kf.properties.rotate}
                              onChange={(e) =>
                                updateKeyframeProperty(kf.id, 'rotate', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Scale</Label>
                            <Input
                              type="number"
                              step={0.1}
                              min={0}
                              value={kf.properties.scale}
                              onChange={(e) =>
                                updateKeyframeProperty(kf.id, 'scale', parseFloat(e.target.value) || 1)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Opacity</Label>
                            <Input
                              type="number"
                              step={0.1}
                              min={0}
                              max={1}
                              value={kf.properties.opacity}
                              onChange={(e) =>
                                updateKeyframeProperty(kf.id, 'opacity', parseFloat(e.target.value) ?? 1)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Color</Label>
                            <input
                              type="color"
                              value={kf.properties.color}
                              onChange={(e) =>
                                updateKeyframeProperty(kf.id, 'color', e.target.value)
                              }
                              className="h-10 w-full cursor-pointer rounded-md border border-input"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-xs">Background Color</Label>
                            <input
                              type="color"
                              value={kf.properties.backgroundColor}
                              onChange={(e) =>
                                updateKeyframeProperty(kf.id, 'backgroundColor', e.target.value)
                              }
                              className="h-10 w-full cursor-pointer rounded-md border border-input"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <style>{animationStyle}</style>
                  <div className="flex items-center justify-center h-64 bg-muted rounded-md overflow-hidden">
                    <div
                      className="preview-element w-16 h-16 rounded-md flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: '#3b82f6' }}
                    >
                      A
                    </div>
                  </div>
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
                  <pre className="p-4 rounded-md bg-muted text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    <code>{generatedCss}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
