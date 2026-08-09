import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Table, ArrowRightLeft } from 'lucide-react';
import {
  type Alignment,
  type TableData,
  parseMarkdownTable,
  markdownToAscii,
  asciiToMarkdown,
  generateTable,
  tableDataToAscii,
} from '@/utils/tableConverter';
import { toast, ToastToaster } from "@/components/ui/toast";

type Mode = 'markdown' | 'grid';

export default function App() {
  const [mode, setMode] = useState<Mode>('markdown');
  const [markdownInput, setMarkdownInput] = useState('');
  const [output, setOutput] = useState('');
  const [numRows, setNumRows] = useState(3);
  const [numCols, setNumCols] = useState(3);
  const [gridHeaders, setGridHeaders] = useState<string[]>([]);
  const [gridData, setGridData] = useState<string[][]>([]);
  const [gridAlignments, setGridAlignments] = useState<Alignment[]>([]);
  const initGrid = (rows: number, cols: number) => {
    const headers = Array.from({ length: cols }, (_, i) => gridHeaders[i] || `Header ${i + 1}`);
    const data = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (gridData[r] && gridData[r][c]) || ''),
    );
    const aligns = Array.from({ length: cols }, (_, i) => gridAlignments[i] || 'left');
    setGridHeaders(headers);
    setGridData(data);
    setGridAlignments(aligns as Alignment[]);
  };

  const handleRowsChange = (val: number) => {
    const clamped = Math.max(1, Math.min(20, val));
    setNumRows(clamped);
    initGrid(clamped, numCols);
  };

  const handleColsChange = (val: number) => {
    const clamped = Math.max(1, Math.min(10, val));
    setNumCols(clamped);
    initGrid(numRows, clamped);
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...gridHeaders];
    newHeaders[colIndex] = value;
    setGridHeaders(newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = gridData.map((row) => [...row]);
    newData[rowIndex][colIndex] = value;
    setGridData(newData);
  };

  const updateAlignment = (colIndex: number, value: Alignment) => {
    const newAligns = [...gridAlignments];
    newAligns[colIndex] = value;
    setGridAlignments(newAligns);
  };

  const handleConvertMarkdownToAscii = () => {
    const result = markdownToAscii(markdownInput);
    if (!result) {
      toast.add({ title: 'Invalid Markdown table', type: "error" });
      return;
    }
    setOutput(result);
    toast.add({ title: 'Converted to ASCII table' });
  };

  const handleConvertAsciiToMarkdown = () => {
    const result = asciiToMarkdown(markdownInput);
    if (!result) {
      toast.add({ title: 'Invalid ASCII table', type: "error" });
      return;
    }
    setOutput(result);
    toast.add({ title: 'Converted to Markdown table' });
  };

  const handleGenerateFromGrid = () => {
    if (gridHeaders.length === 0) {
      initGrid(numRows, numCols);
    }
    const table: TableData = generateTable(numRows, numCols, gridData, gridHeaders, gridAlignments);
    const result = tableDataToAscii(table);
    setOutput(result);
    toast.add({ title: 'ASCII table generated' });
  };

  const handleLoadMarkdownToGrid = () => {
    const parsed = parseMarkdownTable(markdownInput);
    if (!parsed) {
      toast.add({ title: 'Invalid Markdown table', type: "error" });
      return;
    }
    setGridHeaders(parsed.headers);
    setGridData(parsed.rows);
    setGridAlignments(parsed.alignments);
    setNumRows(parsed.rows.length);
    setNumCols(parsed.headers.length);
    setMode('grid');
    toast.add({ title: 'Loaded into grid editor' });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ASCII Table Generator</h1>
            <p className="text-muted-foreground">
              Convert between Markdown tables and ASCII bordered tables with alignment support.
            </p>
          </header>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'markdown' ? 'default' : 'outline'}
              onClick={() => setMode('markdown')}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Markdown Input
            </Button>
            <Button
              type="button"
              variant={mode === 'grid' ? 'default' : 'outline'}
              onClick={() => {
                setMode('grid');
                if (gridHeaders.length === 0) initGrid(numRows, numCols);
              }}
            >
              <Table className="mr-2 h-4 w-4" /> Grid Editor
            </Button>
          </div>

          {mode === 'markdown' && (
            <Card>
              <CardHeader>
                <CardTitle>Markdown / ASCII Input</CardTitle>
                <CardDescription>
                  Paste a Markdown table or ASCII table to convert.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="markdown-input">Input</Label>
                  <textarea
                    id="markdown-input"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder={`| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |`}
                    value={markdownInput}
                    onChange={(e) => setMarkdownInput(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    onClick={handleConvertMarkdownToAscii}
                    disabled={!markdownInput}
                  >
                    Markdown to ASCII
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleConvertAsciiToMarkdown}
                    disabled={!markdownInput}
                  >
                    ASCII to Markdown
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadMarkdownToGrid}
                    disabled={!markdownInput}
                  >
                    Load into Grid
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === 'grid' && (
            <Card>
              <CardHeader>
                <CardTitle>Grid Editor</CardTitle>
                <CardDescription>Set rows and columns, then fill in the table.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="space-y-1">
                    <Label htmlFor="num-rows">Rows</Label>
                    <Input
                      id="num-rows"
                      type="number"
                      min={1}
                      max={20}
                      value={numRows}
                      onChange={(e) => handleRowsChange(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="num-cols">Columns</Label>
                    <Input
                      id="num-cols"
                      type="number"
                      min={1}
                      max={10}
                      value={numCols}
                      onChange={(e) => handleColsChange(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                {gridHeaders.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="border-collapse">
                      <thead>
                        <tr>
                          {gridHeaders.map((h, ci) => (
                            <th key={ci} className="p-1">
                              <Input
                                value={h}
                                onChange={(e) => updateHeader(ci, e.target.value)}
                                className="font-bold min-w-[100px]"
                                placeholder={`Header ${ci + 1}`}
                              />
                            </th>
                          ))}
                        </tr>
                        <tr>
                          {gridAlignments.map((align, ci) => (
                            <td key={ci} className="p-1">
                              <select
                                value={align}
                                onChange={(e) => updateAlignment(ci, e.target.value as Alignment)}
                                className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {gridData.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="p-1">
                                <Input
                                  value={cell}
                                  onChange={(e) => updateCell(ri, ci, e.target.value)}
                                  className="min-w-[100px]"
                                  placeholder={`Row ${ri + 1}`}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <Button type="button" onClick={handleGenerateFromGrid}>
                  Generate ASCII Table
                </Button>
              </CardContent>
            </Card>
          )}

          {output && (
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre">
                  {output}
                </pre>
                <div className="flex justify-end">
                  <Button type="button" onClick={copyToClipboard}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
