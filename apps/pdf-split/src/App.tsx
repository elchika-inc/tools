import { Download, FileUp, Scissors, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  downloadPdf,
  getPageCount,
  parsePageRanges,
  splitByPages,
  splitPdf,
} from '@/utils/pdfSplit';
import { toast, ToastToaster } from "@/components/ui/toast";

type SplitMode = 'range' | 'individual';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [rangeInput, setRangeInput] = useState('');
  const [results, setResults] = useState<Uint8Array[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.add({ title: 'PDFファイルを選択してください', type: "error" });
      return;
    }

    setFile(selectedFile);
    setResults([]);
    setRangeInput('');

    try {
      const count = await getPageCount(selectedFile);
      setPageCount(count);
      toast.add({ title: `PDF読み込み完了: ${count}ページ` });
    } catch {
      toast.add({ title: 'PDFの読み込みに失敗しました', type: "error" });
      setFile(null);
      setPageCount(0);
    }
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      let splitResults: Uint8Array[];

      if (splitMode === 'individual') {
        splitResults = await splitByPages(file);
      } else {
        const ranges = parsePageRanges(rangeInput, pageCount);
        if (ranges.length === 0) {
          toast.add({
            title: '有効なページ範囲を入力してください',
            description: '例: 1-3, 5, 7-9',
            type: "error",
          });
          setIsProcessing(false);
          return;
        }
        splitResults = await splitPdf(file, ranges);
      }

      setResults(splitResults);
      toast.add({ title: `${splitResults.length}個のPDFに分割しました` });
    } catch {
      toast.add({ title: '分割に失敗しました', type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (data: Uint8Array, index: number) => {
    const baseName = file?.name?.replace(/\.pdf$/i, '') ?? 'document';
    downloadPdf(data, `${baseName}_part${index + 1}.pdf`);
  };

  const handleDownloadAll = () => {
    for (let i = 0; i < results.length; i++) {
      handleDownload(results[i], i);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPageCount(0);
    setRangeInput('');
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRangeLabel = (index: number): string => {
    if (splitMode === 'individual') {
      return `Page ${index + 1}`;
    }
    const ranges = parsePageRanges(rangeInput, pageCount);
    if (ranges[index]) {
      const r = ranges[index];
      return r.start === r.end ? `Page ${r.start}` : `Pages ${r.start}-${r.end}`;
    }
    return `Part ${index + 1}`;
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">PDF Split</h1>
            <p className="text-muted-foreground">
              PDFファイルをページ範囲指定または1ページずつに分割します。
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PDFファイル選択</CardTitle>
              <CardDescription>分割したいPDFファイルをアップロードしてください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">PDFファイル</Label>
                <div className="flex gap-2">
                  <Input
                    id="pdf-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <Button type="button" variant="outline" onClick={handleClear} disabled={!file}>
                    <Trash2 className="mr-2 h-4 w-4" /> クリア
                  </Button>
                </div>
              </div>

              {file && (
                <div className="rounded-md bg-muted p-4 space-y-1">
                  <p className="text-sm font-medium">
                    <FileUp className="inline mr-2 h-4 w-4" />
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ページ数: {pageCount} | サイズ: {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {file && pageCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>分割設定</CardTitle>
                <CardDescription>分割方法を選択してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>分割モード</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={splitMode === 'range' ? 'default' : 'outline'}
                      onClick={() => setSplitMode('range')}
                    >
                      範囲指定
                    </Button>
                    <Button
                      type="button"
                      variant={splitMode === 'individual' ? 'default' : 'outline'}
                      onClick={() => setSplitMode('individual')}
                    >
                      1ページずつ
                    </Button>
                  </div>
                </div>

                {splitMode === 'range' && (
                  <div className="space-y-2">
                    <Label htmlFor="range-input">ページ範囲</Label>
                    <Input
                      id="range-input"
                      placeholder="例: 1-3, 5, 7-9"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      カンマ区切りでページ番号または範囲を指定してください (1-{pageCount})
                    </p>
                  </div>
                )}

                {splitMode === 'individual' && (
                  <p className="text-sm text-muted-foreground">
                    {pageCount}ページのPDFを1ページずつ{pageCount}個のPDFに分割します。
                  </p>
                )}

                <Button
                  type="button"
                  onClick={handleSplit}
                  disabled={isProcessing || (splitMode === 'range' && !rangeInput.trim())}
                  className="w-full"
                >
                  <Scissors className="mr-2 h-4 w-4" />
                  {isProcessing ? '分割中...' : '分割する'}
                </Button>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>分割結果</CardTitle>
                <CardDescription>{results.length}個のPDFファイルが生成されました。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {results.map((data, index) => (
                    <div
                      key={`result-${getRangeLabel(index)}`}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{getRangeLabel(index)}</p>
                        <p className="text-xs text-muted-foreground">
                          {(data.byteLength / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(data, index)}
                      >
                        <Download className="mr-2 h-4 w-4" /> ダウンロード
                      </Button>
                    </div>
                  ))}
                </div>

                {results.length > 1 && (
                  <Button type="button" onClick={handleDownloadAll} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> すべてダウンロード
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
        </div>

      </div>
  </ToastToaster>;
}
