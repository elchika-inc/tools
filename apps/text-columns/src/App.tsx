import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import { getColumnStyles, type ColumnLayoutOptions, DEFAULT_OPTIONS } from '@/utils/columnLayout';
import { ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<ColumnLayoutOptions>(DEFAULT_OPTIONS);

  const columnStyles = getColumnStyles(options);

  const handlePrint = () => {
    window.print();
  };

  const updateOption = <K extends keyof ColumnLayoutOptions>(
    key: K,
    value: ColumnLayoutOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
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
            <h1 className="text-3xl font-bold tracking-tight">Text Columns</h1>
            <p className="text-muted-foreground">
              Display text in multi-column layout with customizable settings.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <Card className="print:hidden">
                <CardHeader>
                  <CardTitle>Input Text</CardTitle>
                  <CardDescription>Enter or paste text to display in columns.</CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    aria-label="Text input"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Enter text here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </CardContent>
              </Card>

              {input.trim() && (
                <Card>
                  <CardHeader className="print:hidden">
                    <CardTitle>Column Preview</CardTitle>
                    <CardDescription>{options.columnCount} columns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={columnStyles} className="p-4 border rounded-md print:border-none">
                      {input}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6 print:hidden">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Columns: {options.columnCount}</Label>
                    <input
                      type="range"
                      min="2"
                      max="6"
                      value={options.columnCount}
                      onChange={(e) => updateOption('columnCount', Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>2</span>
                      <span>6</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Column Gap: {options.columnGap}px</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={options.columnGap}
                      onChange={(e) => updateOption('columnGap', Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size: {options.fontSize}px</Label>
                    <input
                      type="range"
                      min="10"
                      max="32"
                      value={options.fontSize}
                      onChange={(e) => updateOption('fontSize', Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Line Height: {options.lineHeight}</Label>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={options.lineHeight}
                      onChange={(e) => updateOption('lineHeight', Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Column Rule Style</Label>
                    <select
                      value={options.columnRuleStyle}
                      onChange={(e) =>
                        updateOption(
                          'columnRuleStyle',
                          e.target.value as ColumnLayoutOptions['columnRuleStyle']
                        )
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="double">Double</option>
                    </select>
                  </div>

                  {options.columnRuleStyle !== 'none' && (
                    <div className="space-y-2">
                      <Label>Rule Width: {options.columnRuleWidth}px</Label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={options.columnRuleWidth}
                        onChange={(e) => updateOption('columnRuleWidth', Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handlePrint} className="w-full">
                      <Printer className="mr-2 h-4 w-4" /> Print
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
