import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Printer } from 'lucide-react';
import { getVerticalStyles, textToImageBlob, type VerticalTextOptions } from '@/utils/verticalText';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState('serif');
  const previewRef = useRef<HTMLDivElement>(null);
  const options: VerticalTextOptions = { fontSize, lineHeight, fontFamily };
  const verticalStyles = getVerticalStyles(options);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyImage = async () => {
    if (!input.trim()) {
      toast.add({ title: 'No text to copy', type: "error" });
      return;
    }
    try {
      const blob = await textToImageBlob(input, options);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      toast.add({ title: 'Image copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy image', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Text Vertical</h1>
            <p className="text-muted-foreground">
              Convert horizontal text to vertical (tategaki) display.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Enter text to display vertically.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">Text</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Enter text here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size: {fontSize}px</Label>
                    <input
                      id="fontSize"
                      type="range"
                      min="12"
                      max="48"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lineHeight">Line Height: {lineHeight}</Label>
                    <input
                      id="lineHeight"
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <select
                      id="fontFamily"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="serif">Serif</option>
                      <option value="sans-serif">Sans-serif</option>
                      <option value="monospace">Monospace</option>
                      <option value="'Noto Serif JP', serif">Noto Serif JP</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </Button>
                  <Button type="button" onClick={handleCopyImage} disabled={!input.trim()}>
                    <Copy className="mr-2 h-4 w-4" /> Copy as Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="print:shadow-none">
              <CardHeader className="print:hidden">
                <CardTitle>Preview</CardTitle>
                <CardDescription>Vertical text display</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  style={verticalStyles}
                  className="border rounded-md bg-background"
                >
                  {input || 'Preview will appear here...'}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
