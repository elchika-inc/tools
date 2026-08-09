import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Copy,
  Download,
  Upload,
  Trash2,
  Zap,
  FileCode,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  optimize,
  defaultOptions,
  type OptimizeOptions,
  type OptimizeResult,
} from '@/utils/svgOptimizer';
import { toast, ToastToaster } from "@/components/ui/toast";

const OPTION_LABELS: Record<keyof OptimizeOptions, string> = {
  removeComments: 'Remove comments',
  removeMetadata: 'Remove metadata / desc / title',
  removeEmptyGroups: 'Remove empty groups',
  collapseGroups: 'Collapse groups without attributes',
  shortenIds: 'Shorten IDs',
  roundNumbers: 'Round decimal numbers',
  removeDefaultAttrs: 'Remove default attributes',
};

function SvgPreview({ svgCode }: { svgCode: string }) {
  // User-provided SVG content for preview; this is a client-side-only tool
  // where users optimize their own SVG files
  return (
    <div
      className="max-w-full max-h-[300px]"
      // biome-ignore lint: user-provided SVG preview in client-side tool
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<OptimizeOptions>(defaultOptions);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleOptimize = () => {
    if (!input.trim()) return;
    try {
      const optimized = optimize(input, options);
      setResult(optimized);
      toast.add({ title: 'SVG optimized successfully' });
    } catch {
      toast.add({ title: 'Optimization failed', type: "error" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInput(text);
      setResult(null);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleOption = (key: keyof OptimizeOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.optimized);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const downloadSvg = () => {
    if (!result) return;
    const blob = new Blob([result.optimized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setResult(null);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
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
            <h1 className="text-3xl font-bold tracking-tight">SVG Optimizer</h1>
            <p className="text-muted-foreground">
              Optimize SVG code to reduce file size while preserving visual quality.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Input SVG</CardTitle>
                  <CardDescription>Paste SVG code or upload an .svg file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".svg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" /> Upload SVG
                    </Button>
                    <Button type="button" variant="outline" onClick={clearAll}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                  </div>
                  <textarea
                    aria-label="SVG input"
                    className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Paste SVG code here..."
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setResult(null);
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleOptimize}
                    disabled={!input.trim()}
                    className="w-full"
                  >
                    <Zap className="mr-2 h-4 w-4" /> Optimize SVG
                  </Button>
                </CardContent>
              </Card>

              {result && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5" />
                        Size Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Original</p>
                          <p className="text-2xl font-bold">{formatBytes(result.originalSize)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Optimized</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatBytes(result.optimizedSize)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Saved</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {result.savingsPercent}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center rounded-md border bg-white p-4 min-h-[150px] items-center">
                        <SvgPreview svgCode={result.optimized} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Optimized SVG</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <textarea
                        readOnly
                        aria-label="Optimized SVG output"
                        className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background resize-none"
                        value={result.optimized}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={copyToClipboard}>
                          <Copy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                        <Button type="button" onClick={downloadSvg}>
                          <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(OPTION_LABELS) as Array<keyof OptimizeOptions>).map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => toggleOption(key)}
                    className="flex items-center gap-2 w-full text-left text-sm hover:bg-accent rounded-md p-2 -m-1"
                  >
                    {options[key] ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Label className="cursor-pointer">{OPTION_LABELS[key]}</Label>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
