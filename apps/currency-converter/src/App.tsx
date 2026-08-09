import { useState, useMemo } from 'react';
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
import { ArrowRightLeft, Copy, Settings } from 'lucide-react';
import {
  convert,
  formatAmount,
  CURRENCIES,
  DEFAULT_RATES,
  type ConversionResult,
} from '@/utils/currencyConverter';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [amount, setAmount] = useState('');
  const [fromCode, setFromCode] = useState('JPY');
  const [toCode, setToCode] = useState('USD');
  const [customRates, setCustomRates] = useState<Record<string, number>>({
    ...DEFAULT_RATES,
  });
  const [showRateEditor, setShowRateEditor] = useState(false);
  const result: ConversionResult | null = useMemo(() => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num < 0) return null;
    try {
      return convert(num, fromCode, toCode, customRates);
    } catch {
      return null;
    }
  }, [amount, fromCode, toCode, customRates]);

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const updateRate = (code: string, value: string) => {
    const num = Number(value);
    if (!isNaN(num) && num > 0) {
      setCustomRates((prev) => ({ ...prev, [code]: num }));
    }
  };

  const resetRates = () => {
    setCustomRates({ ...DEFAULT_RATES });
    toast.add({ title: 'レートをデフォルトに戻しました' });
  };

  const copyResult = async () => {
    if (!result) return;
    const fromInfo = CURRENCIES.find((c) => c.code === result.fromCode);
    const toInfo = CURRENCIES.find((c) => c.code === result.toCode);
    const text = `${formatAmount(result.fromAmount, result.fromCode)} ${fromInfo?.symbol ?? ''} (${result.fromCode}) = ${formatAmount(result.toAmount, result.toCode)} ${toInfo?.symbol ?? ''} (${result.toCode})`;
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'コピーしました' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const getCurrencyLabel = (code: string) => {
    const info = CURRENCIES.find((c) => c.code === code);
    return info ? `${info.code} - ${info.name}` : code;
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4 md:p-8">
        <main className="max-w-3xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">通貨換算ツール</h1>
            <p className="text-muted-foreground">
              主要通貨間の換算。手動でレートを設定可能(API不要)。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>換算</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr,auto,1fr] items-end">
                <div className="space-y-2">
                  <Label htmlFor="amount">金額</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    placeholder="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Select value={fromCode} onValueChange={setFromCode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSwap}
                  className="mb-1"
                  aria-label="Swap currencies"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>

                <div className="space-y-2">
                  <Label>変換先</Label>
                  <div className="rounded-lg border bg-muted/50 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {result
                        ? `${formatAmount(result.toAmount, result.toCode)}`
                        : '---'}
                    </p>
                  </div>
                  <Select value={toCode} onValueChange={setToCode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.symbol} {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {result && (
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="text-sm text-muted-foreground">
                    <p>
                      1 {fromCode} = {result.rate} {toCode}
                    </p>
                    <p>
                      1 {toCode} = {result.inverseRate} {fromCode}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="mr-2 h-3 w-3" /> コピー
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rate Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>為替レート設定</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRateEditor(!showRateEditor)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {showRateEditor ? '閉じる' : '編集'}
                </Button>
              </CardTitle>
              <CardDescription>
                レートは手動設定です (1通貨 = X円)。実際の為替レートに合わせて更新してください。
              </CardDescription>
            </CardHeader>
            {showRateEditor && (
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CURRENCIES.filter((c) => c.code !== 'JPY').map((c) => (
                    <div key={c.code} className="flex items-center gap-2">
                      <Label className="w-16 shrink-0 text-right">
                        {c.code}
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={customRates[c.code] ?? ''}
                        onChange={(e) => updateRate(c.code, e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground shrink-0">円</span>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={resetRates}>
                  デフォルトに戻す
                </Button>
              </CardContent>
            )}
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
