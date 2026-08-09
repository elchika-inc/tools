import { FileText, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { convertMarkdownToFragment } from '@/utils/markdownConverter';
import { type FontSize, type PaperSize, generatePrintCSS } from '@/utils/printStyles';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE_MARKDOWN = `# マークダウンのサンプル

これは **太字** と *斜体* のテキストです。

## 機能一覧

- リアルタイムプレビュー
- ファイルアップロード対応（.md）
- 用紙サイズ・フォントサイズ設定

## コード例

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

インラインコードは \`const x = 1\` のように書けます。

## テーブル

| 項目 | 説明 |
|------|------|
| A4   | 210 × 297mm |
| Letter | 215.9 × 279.4mm |

> 印刷ダイアログで「送信先: PDFに保存」を選択してください。

---

2ページ目はここから始まります。
`;

export default function App() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [fontSize, setFontSize] = useState<FontSize>(16);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const fragment = convertMarkdownToFragment(markdown);
    el.replaceChildren(fragment);
  }, [markdown]);

  const handleFileRead = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
        toast.add({ title: '.md または .markdown ファイルのみ対応しています', type: "error" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setMarkdown((e.target?.result as string) ?? '');
      reader.readAsText(file);
    },
    [toast]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileRead(file);
      e.target.value = '';
    },
    [handleFileRead]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }, []);

  const handleExport = useCallback(() => {
    const css = generatePrintCSS({ paperSize, fontSize });
    let styleEl = document.getElementById('md-print-styles') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'md-print-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
    window.print();
  }, [paperSize, fontSize]);

  return <ToastToaster>
  <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">📄 Markdown to PDF</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              マークダウンを入力またはファイルをアップロードして、PDFとして保存できます。
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="paper-size">
                用紙サイズ
              </label>
              <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
                <SelectTrigger id="paper-size" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="font-size">
                フォントサイズ
              </label>
              <Select
                value={String(fontSize)}
                onValueChange={(v) => setFontSize(Number(v) as FontSize)}
              >
                <SelectTrigger id="font-size" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">小 (12px)</SelectItem>
                  <SelectItem value="16">中 (16px)</SelectItem>
                  <SelectItem value="20">大 (20px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card
              className={isDragOver ? 'border-primary ring-2 ring-primary' : ''}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">マークダウン</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-1 h-3 w-3" />
                  ファイルを開く
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.markdown"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </CardHeader>
              <CardContent>
                <textarea
                  aria-label="マークダウン入力"
                  className="flex min-h-[520px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder=".md ファイルをドロップするか、マークダウンを入力してください..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">プレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  id="pdf-preview"
                  className="min-h-[520px] rounded-md border border-input bg-background px-4 py-3 leading-relaxed"
                  style={{ fontSize: `${fontSize}px` }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <Button type="button" size="lg" onClick={handleExport}>
              <FileText className="mr-2 h-4 w-4" />
              PDF として保存
            </Button>
            <p className="text-xs text-muted-foreground">
              印刷ダイアログで「送信先: PDF に保存」を選択してください
            </p>
          </div>
        </main>


      </div>
  </ToastToaster>;
}
