import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { calcElectricityCost, ELECTRIC_PLANS } from '@/utils/electricityCost';
import { ToastToaster } from "@/components/ui/toast";

const ALL_PLANS = [
  ...ELECTRIC_PLANS.map((p) => ({ id: p.id, label: `${p.company} ${p.name}` })),
  { id: 'custom', label: 'カスタム（単価を直接入力）' },
];

const fmt = (n: number) =>
  n.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });

export default function App() {
  const [kwh, setKwh] = useState('300');
  const [planId, setPlanId] = useState('tepco_standard');
  const [customBasicFee, setCustomBasicFee] = useState('800');
  const [customUnitPrice, setCustomUnitPrice] = useState('30');

  const result = useMemo(() => {
    try {
      return calcElectricityCost({
        monthlyKwh: Number(kwh),
        planId,
        customBasicFee: Number(customBasicFee),
        customUnitPrice: Number(customUnitPrice),
      });
    } catch { return null; }
  }, [kwh, planId, customBasicFee, customUnitPrice]);

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-xl mx-auto space-y-6">
          <header>
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Electricity Cost</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">電気料金計算</p>
          </header>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>月間使用量 (kWh)</Label>
                <Input type="number" min="0" value={kwh} onChange={(e) => setKwh(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>料金プラン</Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_PLANS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {planId === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>基本料金 (円/月)</Label>
                    <Input type="number" min="0" value={customBasicFee} onChange={(e) => setCustomBasicFee(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>単価 (円/kWh)</Label>
                    <Input type="number" min="0" step="0.1" value={customUnitPrice} onChange={(e) => setCustomUnitPrice(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">基本料金</p>
                    <p className="font-bold">{fmt(result.basicFee)}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">従量料金</p>
                    <p className="font-bold">{fmt(result.usageFee)}</p>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">月額概算</p>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{fmt(result.totalMonthly)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">年間概算: <span className="font-bold">{fmt(result.totalYearly)}</span></p>
                </div>
                <p className="text-xs text-gray-400 text-center">※ 燃料費調整額・再エネ賦課金は含みません</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
  </ToastToaster>;
}
