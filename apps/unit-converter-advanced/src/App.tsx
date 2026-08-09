import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, ArrowLeftRight } from 'lucide-react';
import { categories, convert, type ConversionResult } from '@/utils/unitConverter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [fromUnit, setFromUnit] = useState(categories[0].units[0].id);
  const [toUnit, setToUnit] = useState(categories[0].units[1].id);
  const [inputValue, setInputValue] = useState('1');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const currentCategory = categories[categoryIndex];

  const handleCategoryChange = (value: string) => {
    const idx = Number(value);
    setCategoryIndex(idx);
    setFromUnit(categories[idx].units[0].id);
    setToUnit(categories[idx].units[1]?.id ?? categories[idx].units[0].id);
    setResult(null);
  };

  const handleConvert = () => {
    try {
      const val = parseFloat(inputValue);
      if (isNaN(val)) {
        toast.add({ title: 'Invalid input', description: 'Please enter a valid number', type: "error" });
        return;
      }
      const res = convert(val, fromUnit, toUnit, currentCategory.name);
      setResult(res);
    } catch (e) {
      toast.add({
        title: 'Conversion error',
        description: e instanceof Error ? e.message : 'Unknown error',
        type: "error",
      });
    }
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(null);
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(String(result.value));
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const fromUnitDef = currentCategory.units.find((u) => u.id === fromUnit);
  const toUnitDef = currentCategory.units.find((u) => u.id === toUnit);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Unit Converter Advanced</h1>
            <p className="text-muted-foreground">
              Convert between temperature, pressure, energy, force, speed, power, and data units.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Converter</CardTitle>
              <CardDescription>Select a category and units to convert.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={String(categoryIndex)} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat, i) => (
                      <SelectItem key={cat.name} value={String(i)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr,auto,1fr] items-end">
                <div className="space-y-2">
                  <Label htmlFor="from-value">Value</Label>
                  <Input
                    id="from-value"
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter value"
                  />
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCategory.units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" variant="ghost" size="icon" onClick={handleSwap} className="mb-1" aria-label="Swap units">
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>

                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                    {result ? result.value.toPrecision(10).replace(/\.?0+$/, '') : '-'}
                  </div>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCategory.units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={handleConvert}>
                  Convert
                </Button>
                {result && (
                  <Button type="button" variant="outline" onClick={copyResult}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                )}
              </div>

              {result && (
                <div className="bg-muted/50 rounded-md p-4 space-y-1">
                  <p className="text-sm font-medium">
                    {inputValue} {fromUnitDef?.symbol} = {result.value.toPrecision(10).replace(/\.?0+$/, '')}{' '}
                    {toUnitDef?.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">Formula: {result.formula}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
