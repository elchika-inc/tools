import { useState, useRef, useEffect } from 'react';
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
import { Download } from 'lucide-react';
import {
  render,
  downloadPng,
  type SocialCardConfig,
  type LayoutPreset,
  type BackgroundType,
} from '@/utils/socialCard';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [title, setTitle] = useState('My Awesome Blog Post');
  const [subtitle, setSubtitle] = useState('A deep dive into modern web development');
  const [author, setAuthor] = useState('John Doe');
  const [bgType, setBgType] = useState<BackgroundType>('gradient');
  const [bgColor1, setBgColor1] = useState('#1a1a2e');
  const [bgColor2, setBgColor2] = useState('#16213e');
  const [textColor, setTextColor] = useState('#e0e0e0');
  const [layout, setLayout] = useState<LayoutPreset>('centered');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config: SocialCardConfig = {
    title,
    subtitle,
    author,
    bgType,
    bgColor1,
    bgColor2,
    textColor,
    layout,
  };

  useEffect(() => {
    if (canvasRef.current) {
      render(canvasRef.current, config);
    }
  }, [title, subtitle, author, bgType, bgColor1, bgColor2, textColor, layout]);

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadPng(canvasRef.current, title);
      toast.add({ title: 'Downloaded OGP image (1200x630)' });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Social Card Generator</h1>
            <p className="text-muted-foreground">
              Create OGP/social card images (1200x630) for sharing on social media.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr,1.5fr]">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Customize your social card.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter subtitle..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter author..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select value={layout} onValueChange={(v) => setLayout(v as LayoutPreset)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered">Centered</SelectItem>
                      <SelectItem value="left-aligned">Left Aligned</SelectItem>
                      <SelectItem value="split">Split</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Background</Label>
                  <Select value={bgType} onValueChange={(v) => setBgType(v as BackgroundType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">BG Color 1</Label>
                    <input
                      type="color"
                      value={bgColor1}
                      onChange={(e) => setBgColor1(e.target.value)}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                  {bgType === 'gradient' && (
                    <div className="space-y-1">
                      <Label className="text-xs">BG Color 2</Label>
                      <input
                        type="color"
                        value={bgColor2}
                        onChange={(e) => setBgColor2(e.target.value)}
                        className="w-full h-8 rounded border cursor-pointer"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Text Color</Label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Download PNG (1200x630)
                </Button>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg border"
                  style={{ aspectRatio: '1200/630' }}
                />
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
