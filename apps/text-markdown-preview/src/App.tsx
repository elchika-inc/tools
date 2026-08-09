import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { markdownToHtml } from '@/utils/markdown';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE = `# Hello World

This is **bold** and *italic* text.

## Features
- Item 1
- Item 2

\`inline code\`

> Blockquote

---

Paragraph text.`;

export default function App() {
  const [input, setInput] = useState(SAMPLE);
  const html = useMemo(() => markdownToHtml(input), [input]);

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast.add({ title: 'HTML copied' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Markdown Preview</h1>
            <p className="text-muted-foreground">Markdownのリアルタイムプレビューツールです。</p>
          </header>
          <main className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Markdown</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  aria-label="Markdownテキスト入力"
                  className="flex min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <Button type="button" size="sm" variant="ghost" onClick={copyHtml}>
                    <Copy className="h-3 w-3 mr-1" /> HTML
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none min-h-[500px]">
                  <textarea
                    readOnly
                    aria-label="HTML出力プレビュー"
                    className="w-full min-h-[500px] border-0 bg-transparent text-sm resize-none"
                    value={html}
                  />
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
