import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type CheckboxConfig, DEFAULT_CONFIG, generateCSS } from '@/utils/cssCheckbox';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [config, setConfig] = useState<CheckboxConfig>(DEFAULT_CONFIG);
  const css = useMemo(() => generateCSS(config), [config]);

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(css);
      toast.add({ title: 'Copied' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CSS Checkbox / Switch</h1>
            <p className="text-muted-foreground">カスタムCheckbox/SwitchのCSS生成ツールです。</p>
          </header>
          <main className="space-y-6">
            <div className="flex items-center justify-center p-12 bg-muted rounded-lg">
              <style>{css}</style>
              {config.type === 'switch' ? (
                <label className="switch">
                  <span className="sr-only">Toggle switch</span>
                  <input type="checkbox" defaultChecked />
                  <span className="slider" />
                </label>
              ) : (
                <input type="checkbox" className="checkbox" defaultChecked aria-label="チェックボックスプレビュー" />
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-[280px,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    {(['switch', 'checkbox'] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setConfig((p) => ({ ...p, type: t }))}
                        className={`px-3 py-1 rounded text-sm ${config.type === t ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {(
                    [
                      ['width', 'Width', 32, 80],
                      ['height', 'Height', 16, 48],
                      ['borderRadius', 'Radius', 0, 24],
                    ] as const
                  ).map(([key, label, min, max]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs">
                        {label}: {config[key]}px
                      </Label>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={config[key]}
                        onChange={(e) => setConfig((p) => ({ ...p, [key]: Number(e.target.value) }))}
                        className="w-full"
                        aria-label={label}
                        aria-valuetext={`${config[key]}px`}
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ['activeColor', 'Active'],
                        ['inactiveColor', 'Inactive'],
                        ['knobColor', 'Knob'],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{label}</Label>
                        <input
                          type="color"
                          value={config[key]}
                          onChange={(e) => setConfig((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full h-8 rounded cursor-pointer border-0"
                          aria-label={`${label}カラーピッカー`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CSS Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="bg-muted rounded p-3 text-xs font-mono whitespace-pre-wrap max-h-[300px] overflow-auto">
                    {css}
                  </pre>
                  <Button type="button" onClick={copyCSS}>
                    <Copy className="mr-2 h-4 w-4" /> Copy CSS
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
