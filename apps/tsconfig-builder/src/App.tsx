import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Download, Plus, Trash2 } from 'lucide-react';
import {
  type TsconfigState,
  tsconfigOptions,
  buildConfig,
  getCategories,
  getOptionsByCategory,
} from '@/utils/tsconfigOptions';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [state, setState] = useState<TsconfigState>({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
    },
    include: ['src'],
    exclude: ['node_modules'],
  });
  const config = buildConfig(state);
  const output = JSON.stringify(config, null, 2);

  const updateOption = (key: string, value: unknown) => {
    setState({
      ...state,
      compilerOptions: { ...state.compilerOptions, [key]: value },
    });
  };

  const addInclude = () => {
    setState({ ...state, include: [...state.include, ''] });
  };

  const updateInclude = (index: number, value: string) => {
    const updated = state.include.map((s, i) => (i === index ? value : s));
    setState({ ...state, include: updated });
  };

  const removeInclude = (index: number) => {
    setState({ ...state, include: state.include.filter((_, i) => i !== index) });
  };

  const addExclude = () => {
    setState({ ...state, exclude: [...state.exclude, ''] });
  };

  const updateExclude = (index: number, value: string) => {
    const updated = state.exclude.map((s, i) => (i === index ? value : s));
    setState({ ...state, exclude: updated });
  };

  const removeExclude = (index: number) => {
    setState({ ...state, exclude: state.exclude.filter((_, i) => i !== index) });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tsconfig.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.add({ title: 'Downloaded tsconfig.json' });
  };

  const categories = getCategories();

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">tsconfig.json Builder</h1>
            <p className="text-muted-foreground">
              Visually build your TypeScript configuration with descriptions for each option.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <div className="space-y-6">
              {categories.map((category) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getOptionsByCategory(category).map((opt) => (
                      <div key={opt.key} className="space-y-1">
                        {opt.type === 'boolean' && (
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              id={opt.key}
                              checked={!!state.compilerOptions[opt.key]}
                              onChange={(e) => updateOption(opt.key, e.target.checked)}
                              className="rounded mt-1"
                            />
                            <div>
                              <Label htmlFor={opt.key} className="cursor-pointer">
                                {opt.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">{opt.description}</p>
                            </div>
                          </div>
                        )}
                        {opt.type === 'select' && (
                          <div>
                            <Label htmlFor={opt.key}>{opt.label}</Label>
                            <p className="text-xs text-muted-foreground mb-1">{opt.description}</p>
                            <select
                              id={opt.key}
                              value={(state.compilerOptions[opt.key] as string) ?? ''}
                              onChange={(e) => updateOption(opt.key, e.target.value)}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              {opt.options?.map((o) => (
                                <option key={o} value={o}>
                                  {o || '(none)'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {opt.type === 'text' && (
                          <div>
                            <Label htmlFor={opt.key}>{opt.label}</Label>
                            <p className="text-xs text-muted-foreground mb-1">{opt.description}</p>
                            <Input
                              id={opt.key}
                              value={(state.compilerOptions[opt.key] as string) ?? ''}
                              onChange={(e) => updateOption(opt.key, e.target.value)}
                              placeholder={
                                opt.key === 'lib' ? 'ES2022, DOM, DOM.Iterable' : opt.key
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Include</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addInclude}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {state.include.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={item}
                        onChange={(e) => updateInclude(i, e.target.value)}
                        placeholder="src"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInclude(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Exclude</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addExclude}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {state.exclude.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={item}
                        onChange={(e) => updateExclude(i, e.target.value)}
                        placeholder="node_modules"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExclude(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Generated tsconfig.json</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre max-h-[600px] overflow-y-auto">
                    {output}
                  </pre>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={downloadFile}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button type="button" onClick={copyToClipboard}>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
