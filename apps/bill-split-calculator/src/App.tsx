import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { splitBill, type BillItem, type Member, type RoundingMode } from '@/utils/billSplit';
import { toast, ToastToaster } from "@/components/ui/toast";

let idCounter = 0;
const newId = () => String(++idCounter);

export default function App() {
  const [items, setItems] = useState<BillItem[]>([
    { id: newId(), name: '食事', amount: 10000 },
  ]);
  const [members, setMembers] = useState<Member[]>([
    { id: newId(), name: 'Alice', ratio: 1 },
    { id: newId(), name: 'Bob', ratio: 1 },
  ]);
  const [rounding, setRounding] = useState<RoundingMode>('nearest');
  const result = useMemo(() => {
    try {
      return splitBill({ items, members, rounding });
    } catch {
      return null;
    }
  }, [items, members, rounding]);

  const addItem = () =>
    setItems((prev) => [...prev, { id: newId(), name: '', amount: 0 }]);
  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id: string, field: 'name' | 'amount', value: string) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, [field]: field === 'amount' ? Number(value) : value }
          : i,
      ),
    );

  const addMember = () =>
    setMembers((prev) => [...prev, { id: newId(), name: '', ratio: 1 }]);
  const removeMember = (id: string) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));
  const updateMember = (id: string, field: 'name' | 'ratio', value: string) =>
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, [field]: field === 'ratio' ? Number(value) : value }
          : m,
      ),
    );

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard
      .writeText(result.summaryText)
      .then(() => {
        toast.add({ title: 'コピーしました' });
      })
      .catch(() => {
        toast.add({ title: 'コピーに失敗しました', type: "error" });
      });
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">割り勘計算</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              品目別・不均等割り・端数処理に対応した割り勘計算ツール
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              すべての処理はブラウザ内で完結 - データは外部に送信・保存されません
            </p>
          </div>
        </header>
        <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>品目</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="品目名"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="金額"
                    value={item.amount || ''}
                    onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>参加者</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addMember}>
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="名前"
                    value={member.name}
                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <Label className="text-xs whitespace-nowrap">比率</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={member.ratio}
                      onChange={(e) => updateMember(member.id, 'ratio', e.target.value)}
                      className="w-20"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-sm">端数処理</Label>
                <Select value={rounding} onValueChange={(v) => setRounding(v as RoundingMode)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nearest">四捨五入</SelectItem>
                    <SelectItem value="up">切り上げ</SelectItem>
                    <SelectItem value="down">切り捨て</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>結果</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-1" />
                    コピー
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  合計: {result.totalAmount.toLocaleString('ja-JP')}円
                </p>
                {result.perMember.map((m) => (
                  <div
                    key={m.memberId}
                    className="flex justify-between items-center bg-muted rounded-lg px-4 py-2"
                  >
                    <span className="font-medium">{m.memberName}</span>
                    <span className="font-bold">{m.amount.toLocaleString('ja-JP')}円</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
