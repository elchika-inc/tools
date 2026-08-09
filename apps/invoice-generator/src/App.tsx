import { useState } from 'react';
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
import { Plus, Trash2, Printer, Eye } from 'lucide-react';
import {
  calculateInvoice,
  generateInvoiceHTML,
  printInvoice,
  formatJPY,
  type InvoiceItem,
  type InvoiceData,
} from '@/utils/invoiceGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

const today = new Date().toISOString().slice(0, 10);
const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

export default function App() {
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(nextMonth);
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState('0.1');
  const [notes, setNotes] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const getData = (): InvoiceData => ({
    companyName,
    clientName,
    invoiceNumber,
    issueDate,
    dueDate,
    items,
    taxRate: Number(taxRate),
    notes,
  });

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    try {
      const html = generateInvoiceHTML(getData());
      setPreviewHtml(html);
    } catch {
      toast.add({ title: 'プレビュー生成に失敗しました', type: "error" });
    }
  };

  const handlePrint = () => {
    try {
      printInvoice(getData());
    } catch (e) {
      toast.add({
        title: '印刷に失敗しました',
        description: e instanceof Error ? e.message : '',
        type: "error",
      });
    }
  };

  const calc = calculateInvoice(getData());

  return <ToastToaster>
  <div className="min-h-screen bg-background p-4 md:p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">請求書ジェネレーター</h1>
            <p className="text-muted-foreground">
              請求書を作成してPDF印刷。完全クライアントサイドで動作。
            </p>
          </header>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="company">自社名</Label>
                  <Input
                    id="company"
                    placeholder="株式会社テスト"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">請求先</Label>
                  <Input
                    id="client"
                    placeholder="クライアント株式会社"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNum">請求書番号</Label>
                  <Input
                    id="invoiceNum"
                    placeholder="INV-2024-001"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDate">発行日</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">支払い期限</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>税率</Label>
                  <Select value={taxRate} onValueChange={setTaxRate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">10% (標準)</SelectItem>
                      <SelectItem value="0.08">8% (軽減)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>品目</CardTitle>
              <CardDescription>請求する品目を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr,100px,150px,auto] items-end">
                  <div className="space-y-1">
                    <Label>品目名</Label>
                    <Input
                      placeholder="品目の説明"
                      value={item.description}
                      onChange={(e) => updateItem(i, 'description', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>数量</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>単価 (円)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(i)}
                    disabled={items.length <= 1}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" /> 品目を追加
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>備考</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder="振込先情報やその他の備考..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>金額サマリー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-right max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">小計</span>
                  <span>{formatJPY(calc.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    消費税 ({Number(taxRate) * 100}%)
                  </span>
                  <span>{formatJPY(calc.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>合計</span>
                  <span className="text-blue-600">{formatJPY(calc.total)}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={handlePreview}>
                  <Eye className="mr-2 h-4 w-4" /> プレビュー
                </Button>
                <Button type="button" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> 印刷 / PDF保存
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {previewHtml && (
            <Card>
              <CardHeader>
                <CardTitle>プレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  title="請求書プレビュー"
                  srcDoc={previewHtml}
                  className="w-full border rounded-md"
                  style={{ height: '600px' }}
                />
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
