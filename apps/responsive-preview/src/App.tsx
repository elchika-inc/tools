import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  ExternalLink,
  Columns,
  Maximize,
} from 'lucide-react';
import {
  DEVICE_PRESETS,
  validateUrl,
  type DevicePreset,
} from '@/utils/devicePresets';
import { toast, ToastToaster } from "@/components/ui/toast";

const CATEGORY_ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export default function App() {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[0]);
  const [isRotated, setIsRotated] = useState(false);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');
  const [multiDevices, setMultiDevices] = useState<string[]>(['iphone-se', 'ipad', 'laptop']);
  const handleLoad = () => {
    const validated = validateUrl(url);
    if (validated) {
      setActiveUrl(validated);
    } else {
      toast.add({ title: 'Invalid URL', type: "error" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLoad();
  };

  const getDisplaySize = (device: DevicePreset) => {
    if (isRotated) {
      return { width: device.height, height: device.width };
    }
    return { width: device.width, height: device.height };
  };

  const currentSize = customWidth && customHeight
    ? { width: Number(customWidth), height: Number(customHeight) }
    : getDisplaySize(selectedDevice);

  const toggleMultiDevice = (deviceId: string) => {
    setMultiDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-[1600px] mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Responsive Preview</h1>
            <p className="text-muted-foreground">
              Preview any website at different device sizes to test responsive design.
            </p>
          </header>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter URL (e.g., https://example.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9"
                  />
                </div>
                <Button type="button" onClick={handleLoad}>
                  Load
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={viewMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('single')}
              >
                <Maximize className="mr-1 h-4 w-4" /> Single
              </Button>
              <Button
                type="button"
                variant={viewMode === 'multi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('multi')}
              >
                <Columns className="mr-1 h-4 w-4" /> Side-by-side
              </Button>
            </div>

            {viewMode === 'single' && (
              <>
                <div className="h-6 border-r" />
                <div className="flex flex-wrap gap-1">
                  {DEVICE_PRESETS.map((device) => {
                    const Icon = CATEGORY_ICONS[device.category];
                    return (
                      <Button
                        type="button"
                        key={device.id}
                        variant={selectedDevice.id === device.id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setSelectedDevice(device);
                          setCustomWidth('');
                          setCustomHeight('');
                        }}
                        title={`${device.name} (${device.width}x${device.height})`}
                      >
                        <Icon className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">{device.name}</span>
                      </Button>
                    );
                  })}
                </div>

                <div className="h-6 border-r" />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRotated(!isRotated)}
                >
                  <RotateCcw className="mr-1 h-4 w-4" /> Rotate
                </Button>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="W"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-20 h-9"
                  />
                  <span className="text-muted-foreground">x</span>
                  <Input
                    type="number"
                    placeholder="H"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-20 h-9"
                  />
                </div>
              </>
            )}

            {viewMode === 'multi' && (
              <>
                <div className="h-6 border-r" />
                <div className="flex flex-wrap gap-1">
                  {DEVICE_PRESETS.map((device) => (
                    <Button
                      type="button"
                      key={device.id}
                      variant={multiDevices.includes(device.id) ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => toggleMultiDevice(device.id)}
                    >
                      {device.name}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>

          {activeUrl ? (
            viewMode === 'single' ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {customWidth && customHeight
                      ? `Custom (${customWidth}x${customHeight})`
                      : `${selectedDevice.name} - ${currentSize.width}x${currentSize.height}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center overflow-auto">
                    <div
                      className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg"
                      style={{
                        width: Math.min(currentSize.width, 1400),
                        height: Math.min(currentSize.height, 800),
                      }}
                    >
                      <iframe
                        src={activeUrl}
                        title="Preview"
                        style={{
                          width: currentSize.width,
                          height: currentSize.height,
                          transform: currentSize.width > 1400
                            ? `scale(${1400 / currentSize.width})`
                            : undefined,
                          transformOrigin: 'top left',
                        }}
                        className="border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {multiDevices.map((deviceId) => {
                  const device = DEVICE_PRESETS.find((d) => d.id === deviceId);
                  if (!device) return null;
                  const size = getDisplaySize(device);
                  const scale = Math.min(350 / size.width, 500 / size.height, 1);
                  return (
                    <Card key={deviceId} className="flex-shrink-0">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {device.name} ({size.width}x{size.height})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div
                          className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm"
                          style={{
                            width: size.width * scale,
                            height: size.height * scale,
                          }}
                        >
                          <iframe
                            src={activeUrl}
                            title={`Preview - ${device.name}`}
                            style={{
                              width: size.width,
                              height: size.height,
                              transform: `scale(${scale})`,
                              transformOrigin: 'top left',
                            }}
                            className="border-0"
                            sandbox="allow-scripts allow-same-origin allow-forms"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="py-20 text-center">
                <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Enter a URL above and click Load to preview
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Note: Some websites may block iframe embedding due to X-Frame-Options headers.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
