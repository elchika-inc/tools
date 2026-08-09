import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type CsvToSqlOptions, convertCsvToSql, DEFAULT_OPTIONS } from '@/utils/csvToSql';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<CsvToSqlOptions>(DEFAULT_OPTIONS);
  const output = useMemo(() => {
    if (!input) return '';
    try {
      return convertCsvToSql(input, options);
    } catch {
      return '';
    }
  }, [input, options]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">CSV to SQL</h1>
            <p className="text-muted-foreground">CSVデータをSQL INSERT文に変換します。</p>
          </header>

          <main>
          <div className="grid gap-4 md:grid-cols-[240px,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tableName">テーブル名</Label>
                  <input
                    id="tableName"
                    type="text"
                    value={options.tableName}
                    onChange={(e) => setOptions((p) => ({ ...p, tableName: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delimiter">区切り文字</Label>
                  <input
                    id="delimiter"
                    type="text"
                    value={options.delimiter}
                    onChange={(e) => setOptions((p) => ({ ...p, delimiter: e.target.value || ',' }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="quoteStrings"
                    type="checkbox"
                    checked={options.quoteStrings}
                    onChange={(e) => setOptions((p) => ({ ...p, quoteStrings: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="quoteStrings">文字列をクォート</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>
                  CSVを入力するとSQL INSERT文に変換されます(1行目はヘッダー)。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input">CSV Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder={'name,age,city\nAlice,30,Tokyo\nBob,25,Osaka'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output">SQL Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    value={output}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setInput('')}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!output}>
                    <Copy className="mr-2 h-4 w-4" /> Copy SQL
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
