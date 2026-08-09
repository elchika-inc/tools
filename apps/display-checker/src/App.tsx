import { Copy, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type DisplayInfo, getBreakpoint, getDisplayInfo } from '@/utils/displayInfo';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [info, setInfo] = useState<DisplayInfo | null>(null);
  const refresh = useCallback(() => {
    setInfo(getDisplayInfo());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('resize', refresh);
    return () => window.removeEventListener('resize', refresh);
  }, [refresh]);

  const copyAll = async () => {
    if (!info) return;
    try {
      const text = Object.entries(info)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\n');
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  if (!info) return null;

  const items = [
    { label: 'Screen Resolution', value: `${info.screenWidth} x ${info.screenHeight}` },
    { label: 'Viewport Size', value: `${info.viewportWidth} x ${info.viewportHeight}` },
    { label: 'Breakpoint (Tailwind)', value: getBreakpoint(info.viewportWidth) },
    { label: 'Device Pixel Ratio', value: `${info.devicePixelRatio}x` },
    { label: 'Color Depth', value: `${info.colorDepth} bit` },
    { label: 'Orientation', value: info.orientation },
    {
      label: 'Touch Support',
      value: info.touchSupport ? `Yes (${info.maxTouchPoints} points)` : 'No',
    },
    { label: 'Online', value: info.onLine ? 'Yes' : 'No' },
    { label: 'CPU Cores', value: String(info.hardwareConcurrency) },
    { label: 'Language', value: info.language },
    { label: 'Languages', value: info.languages.join(', ') },
    { label: 'Cookie Enabled', value: info.cookieEnabled ? 'Yes' : 'No' },
    { label: 'Platform', value: info.platform },
  ];

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Display Checker</h1>
            <p className="text-muted-foreground">ブラウザの画面サイズ、デバイス情報を表示します。</p>
          </header>

          <main className="space-y-6">
          <div className="flex gap-2">
            <Button type="button" onClick={refresh}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button type="button" variant="outline" onClick={copyAll}>
              <Copy className="mr-2 h-4 w-4" /> Copy All
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Display Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {items.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <span className="w-44 text-muted-foreground">{item.label}</span>
                    <code className="font-mono">{item.value}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="text-xs font-mono break-all">{info.userAgent}</code>
            </CardContent>
          </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
