import { Download, Image, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_OPTIONS, generateCodeImage } from '@/utils/codeToImage';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [code, setCode] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_OPTIONS.backgroundColor);
  const [textColor, setTextColor] = useState(DEFAULT_OPTIONS.textColor);
  const [fontSize, setFontSize] = useState(DEFAULT_OPTIONS.fontSize);
  const [padding, setPadding] = useState(DEFAULT_OPTIONS.padding);
  const [fontFamily, setFontFamily] = useState(DEFAULT_OPTIONS.fontFamily);
  const [lineHeight, setLineHeight] = useState(DEFAULT_OPTIONS.lineHeight);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const handleGenerate = () => {
    if (!code.trim()) {
      toast.add({ title: 'Please enter some code', type: "error" });
      return;
    }
    try {
      const dataUrl = generateCodeImage(code, {
        backgroundColor,
        textColor,
        fontSize,
        padding,
        fontFamily,
        lineHeight,
      });
      setImageDataUrl(dataUrl);
      toast.add({ title: 'Image generated successfully' });
    } catch {
      toast.add({ title: 'Failed to generate image', type: "error" });
    }
  };

  const handleDownload = () => {
    if (!imageDataUrl) return;
    try {
      const link = document.createElement('a');
      link.download = 'code-image.png';
      link.href = imageDataUrl;
      link.click();
      toast.add({ title: 'Download started' });
    } catch {
      toast.add({ title: 'Download failed', type: "error" });
    }
  };

  const handleCopyImage = async () => {
    if (!imageDataUrl) return;
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.add({ title: 'Image copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy image', type: "error" });
    }
  };

  const handleClear = () => {
    setCode('');
    setImageDataUrl('');
    setBackgroundColor(DEFAULT_OPTIONS.backgroundColor);
    setTextColor(DEFAULT_OPTIONS.textColor);
    setFontSize(DEFAULT_OPTIONS.fontSize);
    setPadding(DEFAULT_OPTIONS.padding);
    setFontFamily(DEFAULT_OPTIONS.fontFamily);
    setLineHeight(DEFAULT_OPTIONS.lineHeight);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Code to Image</h1>
            <p className="text-muted-foreground">Convert your code snippets into beautiful images.</p>
          </header>

          <main>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Code Input</CardTitle>
                  <CardDescription>Paste your code below and configure the options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <textarea
                      id="code"
                      className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Paste your code here..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bg-color">Background Color</Label>
                      <div className="flex gap-2">
                        <input
                          id="bg-color"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="h-10 w-12 rounded-md border border-input cursor-pointer"
                        />
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1"
                          aria-label="Background color hex value"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="text-color">Text Color</Label>
                      <div className="flex gap-2">
                        <input
                          id="text-color"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="h-10 w-12 rounded-md border border-input cursor-pointer"
                        />
                        <Input
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1"
                          aria-label="Text color hex value"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="font-size">Font Size (px)</Label>
                      <Input
                        id="font-size"
                        type="number"
                        min={8}
                        max={48}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="padding">Padding (px)</Label>
                      <Input
                        id="padding"
                        type="number"
                        min={0}
                        max={128}
                        value={padding}
                        onChange={(e) => setPadding(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="font-family">Font Family</Label>
                      <Input
                        id="font-family"
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line-height">Line Height</Label>
                      <Input
                        id="line-height"
                        type="number"
                        min={1}
                        max={3}
                        step={0.1}
                        value={lineHeight}
                        onChange={(e) => setLineHeight(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleClear}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button type="button" onClick={handleGenerate} disabled={!code.trim()}>
                      <Image className="mr-2 h-4 w-4" /> Generate Image
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Generated image will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="min-h-[250px] flex items-center justify-center rounded-md border border-dashed border-input bg-muted/50">
                    {imageDataUrl ? (
                      <img
                        src={imageDataUrl}
                        alt="Generated code snippet"
                        className="max-w-full h-auto rounded-md"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No image generated yet. Enter code and click "Generate Image".
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyImage}
                      disabled={!imageDataUrl}
                    >
                      Copy Image
                    </Button>
                    <Button type="button" onClick={handleDownload} disabled={!imageDataUrl}>
                      <Download className="mr-2 h-4 w-4" /> Download PNG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
