import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, X } from 'lucide-react';
import {
  contrastRatio,
  meetsWCAG,
  isValidHex,
  suggestPassingColor,
} from '@/utils/contrastChecker';
import { toast, ToastToaster } from "@/components/ui/toast";

function PassFail({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="flex items-center gap-1 text-green-600 font-medium">
      <Check className="h-4 w-4" /> Pass
    </span>
  ) : (
    <span className="flex items-center gap-1 text-red-600 font-medium">
      <X className="h-4 w-4" /> Fail
    </span>
  );
}

export default function App() {
  const [fgHex, setFgHex] = useState('#333333');
  const [bgHex, setBgHex] = useState('#ffffff');
  const ratio = useMemo(() => {
    if (!isValidHex(fgHex) || !isValidHex(bgHex)) return null;
    try {
      return contrastRatio(fgHex, bgHex);
    } catch {
      return null;
    }
  }, [fgHex, bgHex]);

  const suggestion = useMemo(() => {
    if (ratio !== null && ratio < 4.5) {
      try {
        return suggestPassingColor(fgHex, bgHex, 4.5);
      } catch {
        return null;
      }
    }
    return null;
  }, [fgHex, bgHex, ratio]);

  const copyRatio = async () => {
    if (ratio === null) return;
    try {
      await navigator.clipboard.writeText(`${ratio.toFixed(2)}:1`);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const swapColors = () => {
    setFgHex(bgHex);
    setBgHex(fgHex);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Contrast Checker</h1>
            <p className="text-muted-foreground">
              Check WCAG 2.1 color contrast ratio between foreground and background colors.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Foreground Color</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={isValidHex(fgHex) ? fgHex : '#333333'}
                    onChange={(e) => setFgHex(e.target.value)}
                    className="w-16 h-16 rounded cursor-pointer border-0"
                    aria-label="Foreground Color Picker"
                  />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="fgHex">Hex</Label>
                    <Input
                      id="fgHex"
                      value={fgHex}
                      onChange={(e) => setFgHex(e.target.value)}
                      placeholder="#333333"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Background Color</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={isValidHex(bgHex) ? bgHex : '#ffffff'}
                    onChange={(e) => setBgHex(e.target.value)}
                    className="w-16 h-16 rounded cursor-pointer border-0"
                    aria-label="Background Color Picker"
                  />
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="bgHex">Hex</Label>
                    <Input
                      id="bgHex"
                      value={bgHex}
                      onChange={(e) => setBgHex(e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={swapColors}>
              Swap Colors
            </Button>
          </div>

          {ratio !== null && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="p-6 rounded-md"
                    style={{ backgroundColor: bgHex, color: fgHex }}
                  >
                    <p className="text-2xl font-bold mb-2">Large Text Preview (24px+)</p>
                    <p className="text-base">Normal text preview (16px). The quick brown fox jumps over the lazy dog.</p>
                    <p className="text-sm mt-2">Small text preview (14px). ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contrast Ratio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold">{ratio.toFixed(2)}:1</span>
                    <Button type="button" variant="ghost" size="sm" onClick={copyRatio}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border rounded-md p-4 space-y-3">
                      <h3 className="font-semibold">WCAG AA</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Normal Text (&gt;= 4.5:1)</span>
                        <PassFail pass={meetsWCAG(ratio, 'AA', 'normal')} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Large Text (&gt;= 3:1)</span>
                        <PassFail pass={meetsWCAG(ratio, 'AA', 'large')} />
                      </div>
                    </div>
                    <div className="border rounded-md p-4 space-y-3">
                      <h3 className="font-semibold">WCAG AAA</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Normal Text (&gt;= 7:1)</span>
                        <PassFail pass={meetsWCAG(ratio, 'AAA', 'normal')} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Large Text (&gt;= 4.5:1)</span>
                        <PassFail pass={meetsWCAG(ratio, 'AAA', 'large')} />
                      </div>
                    </div>
                  </div>

                  {suggestion && (
                    <div className="p-4 rounded-md bg-muted space-y-2">
                      <p className="text-sm font-medium">Suggested foreground for AA compliance:</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border" style={{ backgroundColor: suggestion }} />
                        <code className="text-sm">{suggestion}</code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFgHex(suggestion)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
