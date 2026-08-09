import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ArrowDownUp } from 'lucide-react';
import { toRoman, toArabic, isValidArabic, isValidRoman } from '@/utils/romanNumeral';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [arabicInput, setArabicInput] = useState('');
  const [romanInput, setRomanInput] = useState('');
  const [arabicResult, setArabicResult] = useState('');
  const [romanResult, setRomanResult] = useState('');
  const handleArabicToRoman = () => {
    const num = parseInt(arabicInput, 10);
    if (!isValidArabic(num)) {
      toast.add({ title: 'Invalid input', description: 'Enter an integer between 1 and 3999', type: "error" });
      return;
    }
    try {
      const result = toRoman(num);
      setRomanResult(result);
      toast.add({ title: 'Converted successfully' });
    } catch (e) {
      toast.add({ title: 'Conversion failed', type: "error" });
    }
  };

  const handleRomanToArabic = () => {
    if (!isValidRoman(romanInput)) {
      toast.add({ title: 'Invalid input', description: 'Enter a valid Roman numeral', type: "error" });
      return;
    }
    try {
      const result = toArabic(romanInput);
      setArabicResult(String(result));
      toast.add({ title: 'Converted successfully' });
    } catch (e) {
      toast.add({ title: 'Conversion failed', type: "error" });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Roman Numeral Converter</h1>
            <p className="text-muted-foreground">
              Convert between Arabic numbers (1-3999) and Roman numerals.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Arabic to Roman</CardTitle>
                <CardDescription>Enter a number between 1 and 3999</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="arabic-input">Arabic Number</Label>
                  <Input
                    id="arabic-input"
                    type="number"
                    min={1}
                    max={3999}
                    placeholder="e.g. 2024"
                    value={arabicInput}
                    onChange={(e) => setArabicInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleArabicToRoman()}
                  />
                </div>
                <Button type="button" onClick={handleArabicToRoman} disabled={!arabicInput} className="w-full">
                  <ArrowDownUp className="mr-2 h-4 w-4" /> Convert to Roman
                </Button>
                {romanResult && (
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-lg font-mono">
                        {romanResult}
                      </div>
                      <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(romanResult)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Roman to Arabic</CardTitle>
                <CardDescription>Enter a valid Roman numeral</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roman-input">Roman Numeral</Label>
                  <Input
                    id="roman-input"
                    placeholder="e.g. MMXXIV"
                    value={romanInput}
                    onChange={(e) => setRomanInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleRomanToArabic()}
                  />
                </div>
                <Button type="button" onClick={handleRomanToArabic} disabled={!romanInput} className="w-full">
                  <ArrowDownUp className="mr-2 h-4 w-4" /> Convert to Arabic
                </Button>
                {arabicResult && (
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-lg font-mono">
                        {arabicResult}
                      </div>
                      <Button type="button" variant="outline" size="icon" onClick={() => copyToClipboard(arabicResult)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reference Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-sm">
                {[
                  [1, 'I'], [4, 'IV'], [5, 'V'], [9, 'IX'], [10, 'X'],
                  [40, 'XL'], [50, 'L'], [90, 'XC'], [100, 'C'],
                  [400, 'CD'], [500, 'D'], [900, 'CM'], [1000, 'M'],
                ].map(([num, roman]) => (
                  <div key={String(num)} className="rounded border p-2">
                    <div className="font-mono font-bold">{roman}</div>
                    <div className="text-muted-foreground">{num}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
