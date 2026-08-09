import { Copy, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { jsonToXml } from '@/utils/jsonToXml';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [rootTag, setRootTag] = useState('root');
  const result = useMemo(() => jsonToXml(input, rootTag), [input, rootTag]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.xml);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">JSON to XML</h1>
            <p className="text-muted-foreground">JSONデータをXML形式に変換します。</p>
          </header>
          <main className="space-y-6">
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="rootTag">Root Tag</Label>
                <input
                  id="rootTag"
                  type="text"
                  value={rootTag}
                  onChange={(e) => setRootTag(e.target.value || 'root')}
                  className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Converter</CardTitle>
                <CardDescription>JSONを入力するとXMLに変換されます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="input">JSON Input</Label>
                    <textarea
                      id="input"
                      className="flex min-h-[350px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder='{"name":"Alice","age":30}'
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="xml-output">XML Output</Label>
                    <textarea
                      id="xml-output"
                      readOnly
                      aria-label="XML output"
                      className="flex min-h-[350px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      value={result.xml}
                    />
                  </div>
                </div>
                {result.error && (
                  <div role="alert" className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded p-2">
                    {result.error}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setInput('')}>
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Clear
                  </Button>
                  <Button type="button" onClick={copyToClipboard} disabled={!result.xml}>
                    <Copy className="mr-2 h-4 w-4" aria-hidden="true" /> Copy XML
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
