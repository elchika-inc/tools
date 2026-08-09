import { useState, useRef, useMemo } from 'react';
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
import { Upload, Download, Trash2 } from 'lucide-react';
import {
  parseCSV,
  sample,
  toCSVString,
  type SamplingMethod,
} from '@/utils/dataSampler';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [data, setData] = useState<string[][]>([]);
  const [textInput, setTextInput] = useState('');
  const [method, setMethod] = useState<SamplingMethod>('random');
  const [sampleSize, setSampleSize] = useState('10');
  const [usePercentage, setUsePercentage] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [sampledData, setSampledData] = useState<string[][] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setTextInput(text);
      const parsed = parseCSV(text);
      setData(parsed);
      setSampledData(null);
      toast.add({ title: `Loaded ${parsed.length} rows` });
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleParseText = () => {
    if (!textInput.trim()) {
      toast.add({ title: 'Please enter or upload data', type: "error" });
      return;
    }
    const parsed = parseCSV(textInput);
    setData(parsed);
    setSampledData(null);
    toast.add({ title: `Parsed ${parsed.length} rows` });
  };

  const dataRows = hasHeader ? data.length - 1 : data.length;

  const computedSampleSize = useMemo(() => {
    const size = parseInt(sampleSize) || 0;
    if (usePercentage) {
      return Math.max(1, Math.round((dataRows * size) / 100));
    }
    return Math.min(size, dataRows);
  }, [sampleSize, usePercentage, dataRows]);

  const handleSample = () => {
    if (data.length === 0) {
      toast.add({ title: 'No data loaded', type: "error" });
      return;
    }
    if (computedSampleSize <= 0) {
      toast.add({ title: 'Invalid sample size', type: "error" });
      return;
    }

    const result = sample(data, { method, sampleSize: computedSampleSize }, hasHeader);
    setSampledData(result);
    const resultRows = hasHeader ? result.length - 1 : result.length;
    toast.add({ title: `Sampled ${resultRows} rows` });
  };

  const handleDownload = () => {
    if (!sampledData) return;
    const csv = toCSVString(sampledData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sampled_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.add({ title: 'Downloaded sampled data' });
  };

  const previewData = sampledData || data;
  const previewRows = previewData.slice(0, 20);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Data Sampler</h1>
            <p className="text-muted-foreground">
              Upload CSV or paste text data. Sample random rows by count or percentage.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[350px,1fr]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Input</CardTitle>
                  <CardDescription>Upload CSV or paste text data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload CSV
                  </Button>

                  <div className="space-y-2">
                    <Label>Or paste data</Label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="name,age,city&#10;Alice,30,Tokyo&#10;Bob,25,Osaka"
                      aria-label="Paste data"
                    />
                    <Button type="button" size="sm" className="w-full" onClick={handleParseText}>
                      Parse Text
                    </Button>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hasHeader}
                      onChange={(e) => setHasHeader(e.target.checked)}
                      className="rounded"
                    />
                    First row is header
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sampling Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select value={method} onValueChange={(v) => setMethod(v as SamplingMethod)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">Random</SelectItem>
                        <SelectItem value="systematic">Systematic</SelectItem>
                        <SelectItem value="stratified">Stratified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sample Size</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={sampleSize}
                        onChange={(e) => setSampleSize(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant={usePercentage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUsePercentage(!usePercentage)}
                      >
                        {usePercentage ? '%' : 'N'}
                      </Button>
                    </div>
                    {data.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {computedSampleSize} of {dataRows} rows
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleSample}
                    disabled={data.length === 0}
                  >
                    Sample Data
                  </Button>

                  {sampledData && (
                    <Button type="button" variant="outline" className="w-full" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" /> Download CSV
                    </Button>
                  )}

                  {data.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setData([]);
                        setSampledData(null);
                        setTextInput('');
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {sampledData ? 'Sampled Data' : 'Data Preview'}
                  {previewData.length > 0 && ` (${previewData.length} rows)`}
                </CardTitle>
                {previewData.length > 20 && (
                  <CardDescription>Showing first 20 rows</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {previewRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Upload or paste data to begin
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        {hasHeader && previewRows.length > 0 && (
                          <tr className="border-b">
                            <th className="text-left p-2 text-xs text-muted-foreground">#</th>
                            {previewRows[0].map((cell, j) => (
                              <th key={j} className="text-left p-2 font-semibold">
                                {cell}
                              </th>
                            ))}
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {(hasHeader ? previewRows.slice(1) : previewRows).map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/50">
                            <td className="p-2 text-xs text-muted-foreground">{i + 1}</td>
                            {row.map((cell, j) => (
                              <td key={j} className="p-2 font-mono text-xs">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
