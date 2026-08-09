import { useState, useRef, useCallback, useEffect } from 'react';
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
import { Upload, Download, Image as ImageIcon, Smartphone } from 'lucide-react';
import { DEVICE_FRAMES, DEVICE_CATEGORIES, type DeviceFrame } from '@/utils/deviceFrames';
import { renderMockup, downloadCanvas, type ImageFit } from '@/utils/mockupRenderer';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceFrame>(DEVICE_FRAMES[0]);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [imageFit, setImageFit] = useState<ImageFit>('cover');
  const [backgroundColor, setBackgroundColor] = useState('#f0f0f0');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedImage) return;

    const maxPreviewWidth = 600;
    const scale = Math.min(maxPreviewWidth / selectedDevice.width, 2);

    renderMockup(canvas, {
      device: selectedDevice,
      image: uploadedImage,
      fit: imageFit,
      backgroundColor,
      scale,
    });
  }, [selectedDevice, uploadedImage, imageFit, backgroundColor]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.add({ title: 'Please upload an image file', type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        toast.add({ title: 'Image uploaded successfully' });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current || !uploadedImage) return;

    // Re-render at 2x for high quality download
    const downloadCanvas = document.createElement('canvas');
    renderMockup(downloadCanvas, {
      device: selectedDevice,
      image: uploadedImage,
      fit: imageFit,
      backgroundColor,
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `mockup-${selectedDevice.id}.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();

    toast.add({ title: 'Mockup downloaded' });
  };

  const handleDeviceChange = (deviceId: string) => {
    const device = DEVICE_FRAMES.find((d) => d.id === deviceId);
    if (device) setSelectedDevice(device);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Mockup Device</h1>
            <p className="text-muted-foreground">
              Place your screenshots inside device frames and download as PNG.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    {selectedDevice.name} ({selectedDevice.screen.width}x{selectedDevice.screen.height})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadedImage ? (
                    <div className="flex justify-center">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto"
                        style={{ maxHeight: '70vh' }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                      <Smartphone className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium text-muted-foreground mb-2">
                        Upload an image to preview
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        PNG, JPG, or WebP files are supported
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Upload Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {uploadedImage && (
                <div className="flex gap-2 justify-end">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Change Image
                  </Button>
                  <Button type="button" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download PNG
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Device
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Device Type</Label>
                    <Select value={selectedDevice.id} onValueChange={handleDeviceChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEVICE_CATEGORIES.map((category) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              {category}
                            </div>
                            {DEVICE_FRAMES.filter((d) => d.category === category).map((device) => (
                              <SelectItem key={device.id} value={device.id}>
                                {device.name} ({device.screen.width}x{device.screen.height})
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {DEVICE_FRAMES.map((device) => (
                      <button
                        type="button"
                        key={device.id}
                        onClick={() => setSelectedDevice(device)}
                        className={`p-2 rounded-lg border text-xs text-center transition-colors ${
                          selectedDevice.id === device.id
                            ? 'border-primary bg-primary/10'
                            : 'border-transparent hover:bg-accent'
                        }`}
                      >
                        {device.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image Fit</Label>
                    <Select value={imageFit} onValueChange={(v) => setImageFit(v as ImageFit)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover (fill screen, may crop)</SelectItem>
                        <SelectItem value="contain">Contain (fit inside, may letterbox)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-10 w-10 rounded-md border border-input cursor-pointer"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['#f0f0f0', '#ffffff', '#000000', '#1a1a2e', '#16213e', '#0f3460', '#e94560'].map(
                      (color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-8 h-8 rounded-md border-2 transition-transform hover:scale-110 ${
                            backgroundColor === color ? 'border-primary' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
