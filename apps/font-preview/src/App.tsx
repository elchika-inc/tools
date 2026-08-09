import { useState, useEffect } from 'react';
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
import { Copy, Type } from 'lucide-react';
import {
  ALL_FONTS,
  FONT_WEIGHTS,
  getGoogleFontUrl,
  getGoogleFontImportCss,
  getGoogleFontLinkTag,
  getFontFamilyCss,
  type FontInfo,
} from '@/utils/fontData';
import { toast, ToastToaster } from "@/components/ui/toast";

const DEFAULT_TEXT =
  'The quick brown fox jumps over the lazy dog. 0123456789\nABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz';

export default function App() {
  const [selectedFont, setSelectedFont] = useState<FontInfo>(ALL_FONTS[0]);
  const [previewText, setPreviewText] = useState(DEFAULT_TEXT);
  const [fontSize, setFontSize] = useState(32);
  const [fontWeight, setFontWeight] = useState(400);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [color, setColor] = useState('#000000');
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (selectedFont.category === 'google' && !loadedFonts.has(selectedFont.name)) {
      const link = document.createElement('link');
      link.href = getGoogleFontUrl(selectedFont.name, [100, 200, 300, 400, 500, 600, 700, 800, 900]);
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      setLoadedFonts((prev) => new Set(prev).add(selectedFont.name));
    }
  }, [selectedFont, loadedFonts]);

  const handleFontChange = (fontName: string) => {
    const font = ALL_FONTS.find((f) => f.name === fontName);
    if (font) setSelectedFont(font);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: `${label} copied to clipboard` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const previewStyle: React.CSSProperties = {
    fontFamily: `'${selectedFont.name}', ${selectedFont.fallback}`,
    fontSize: `${fontSize}px`,
    fontWeight,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
    color,
  };

  const cssImport = selectedFont.category === 'google' ? getGoogleFontImportCss(selectedFont.name) : '';
  const linkTag = selectedFont.category === 'google' ? getGoogleFontLinkTag(selectedFont.name) : '';
  const fontFamilyCss = getFontFamilyCss(selectedFont);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Font Preview</h1>
            <p className="text-muted-foreground">
              Preview web fonts with custom text, size, weight, and spacing controls.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    {selectedFont.name} - {selectedFont.category === 'google' ? 'Google Fonts' : 'System Font'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="rounded-md border bg-white p-6 min-h-[200px] whitespace-pre-wrap break-words"
                    style={previewStyle}
                  >
                    {previewText || DEFAULT_TEXT}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Enter custom text to preview..."
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                  />
                </CardContent>
              </Card>

              {selectedFont.category === 'google' && (
                <Card>
                  <CardHeader>
                    <CardTitle>CSS Import Code</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>CSS @import</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cssImport, 'CSS import')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                        {cssImport}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>HTML link tag</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(linkTag, 'Link tag')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                        {linkTag}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>font-family CSS</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(fontFamilyCss, 'font-family')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                        {fontFamilyCss}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" /> Font
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select value={selectedFont.name} onValueChange={handleFontChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          System Fonts
                        </div>
                        {ALL_FONTS.filter((f) => f.category === 'system').map((font) => (
                          <SelectItem key={font.name} value={font.name}>
                            {font.name}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                          Google Fonts
                        </div>
                        {ALL_FONTS.filter((f) => f.category === 'google').map((font) => (
                          <SelectItem key={font.name} value={font.name}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Size</Label>
                      <span className="text-sm text-muted-foreground">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                      aria-label="Font Size"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Weight</Label>
                    <Select
                      value={String(fontWeight)}
                      onValueChange={(v) => setFontWeight(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_WEIGHTS.map((w) => (
                          <SelectItem key={w.value} value={String(w.value)}>
                            {w.value} - {w.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Line Height</Label>
                      <span className="text-sm text-muted-foreground">{lineHeight.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="3"
                      step="0.05"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      className="w-full"
                      aria-label="Line Height"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Letter Spacing</Label>
                      <span className="text-sm text-muted-foreground">{letterSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="20"
                      step="0.5"
                      value={letterSpacing}
                      onChange={(e) => setLetterSpacing(Number(e.target.value))}
                      className="w-full"
                      aria-label="Letter Spacing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-10 rounded-md border border-input cursor-pointer"
                        aria-label="Font Color"
                      />
                      <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
