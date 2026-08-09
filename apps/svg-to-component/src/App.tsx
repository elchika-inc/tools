import { useState, useMemo } from 'react';
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
import { Copy } from 'lucide-react';
import {
  convertToReact,
  convertToVue,
  cleanSvg,
  isValidSvg,
  type OutputFormat,
  type ConvertOptions,
} from '@/utils/svgConverter';
import { toast, ToastToaster } from "@/components/ui/toast";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 6v6l4 2"/>
</svg>`;

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'react-tsx', label: 'React (TSX)' },
  { value: 'react-jsx', label: 'React (JSX)' },
  { value: 'vue-sfc', label: 'Vue (SFC)' },
];

export default function App() {
  const [svgInput, setSvgInput] = useState('');
  const [format, setFormat] = useState<OutputFormat>('react-tsx');
  const [componentName, setComponentName] = useState('SvgIcon');
  const [addSizeProps, setAddSizeProps] = useState(true);
  const [addColorProp, setAddColorProp] = useState(true);
  const cleanedSvg = useMemo(() => {
    if (!svgInput.trim()) return '';
    return cleanSvg(svgInput);
  }, [svgInput]);

  const valid = useMemo(() => {
    if (!cleanedSvg) return false;
    return isValidSvg(cleanedSvg);
  }, [cleanedSvg]);

  const output = useMemo(() => {
    if (!valid || !cleanedSvg) return '';

    const options: ConvertOptions = {
      componentName: componentName || 'SvgIcon',
      addSizeProps,
      addColorProp,
    };

    switch (format) {
      case 'react-tsx':
        return convertToReact(cleanedSvg, options, true);
      case 'react-jsx':
        return convertToReact(cleanedSvg, options, false);
      case 'vue-sfc':
        return convertToVue(cleanedSvg, options);
      default:
        return '';
    }
  }, [valid, cleanedSvg, format, componentName, addSizeProps, addColorProp]);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Component code copied' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const loadSample = () => {
    setSvgInput(SAMPLE_SVG);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">SVG to Component Converter</h1>
            <p className="text-muted-foreground">
              Convert SVG code to React (JSX/TSX) or Vue (SFC) components.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>SVG Input</CardTitle>
                    <CardDescription>Paste your SVG code below.</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={loadSample}>
                    Load Sample
                  </Button>
                </CardHeader>
                <CardContent>
                  <textarea
                    aria-label="SVG input"
                    className="flex min-h-[240px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Paste SVG code here..."
                    value={svgInput}
                    onChange={(e) => setSvgInput(e.target.value)}
                  />
                  {svgInput && !valid && (
                    <p role="alert" className="text-sm text-destructive mt-2">
                      Invalid SVG. Make sure it starts with &lt;svg and ends with &lt;/svg&gt;.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Output Format</Label>
                      <Select
                        value={format}
                        onValueChange={(v) => setFormat(v as OutputFormat)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMAT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Component Name</Label>
                      <Input
                        value={componentName}
                        onChange={(e) => setComponentName(e.target.value)}
                        placeholder="SvgIcon"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addSizeProps}
                        onChange={(e) => setAddSizeProps(e.target.checked)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">Add width/height props</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addColorProp}
                        onChange={(e) => setAddColorProp(e.target.checked)}
                        className="rounded border-input"
                      />
                      <span className="text-sm">Add color prop</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>
                    {FORMAT_OPTIONS.find((o) => o.value === format)?.label} component
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={copyOutput}
                  disabled={!output}
                >
                  <Copy className="mr-1 h-4 w-4" /> Copy
                </Button>
              </CardHeader>
              <CardContent>
                {output ? (
                  <pre className="p-4 rounded-md bg-muted text-sm overflow-auto max-h-[600px] whitespace-pre-wrap">
                    <code>{output}</code>
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
                    {svgInput
                      ? 'Fix SVG input to see output'
                      : 'Paste SVG code to generate component'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
