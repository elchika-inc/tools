import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Plus, Trash2, AlertTriangle, GitCompare } from 'lucide-react';
import { parse, stringify, validate, diff, type EnvEntry } from '@/utils/envParser';
import { toast, ToastToaster } from "@/components/ui/toast";

type Tab = 'editor' | 'compare';

export default function App() {
  const [tab, setTab] = useState<Tab>('editor');
  const [rawInput, setRawInput] = useState('');
  const [entries, setEntries] = useState<EnvEntry[]>([]);
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const errors = useMemo(() => validate(entries), [entries]);
  const output = useMemo(() => stringify(entries), [entries]);
  const diffResult = useMemo(() => {
    if (!compareA && !compareB) return null;
    return diff(parse(compareA), parse(compareB));
  }, [compareA, compareB]);

  const handleParse = () => {
    const parsed = parse(rawInput);
    setEntries(parsed);
    toast.add({ title: `Parsed ${parsed.length} entries` });
  };

  const updateEntry = (index: number, field: 'key' | 'value', val: string) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: val } : e)));
  };

  const deleteEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, { key: '', value: '' }]);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const getErrorForEntry = (index: number) => {
    return errors.filter((e) => e.index === index);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">.env File Editor</h1>
            <p className="text-muted-foreground">
              Parse, edit, validate, and compare .env files.
            </p>
          </header>

          <div className="flex gap-2 border-b pb-2">
            <Button
              type="button"
              variant={tab === 'editor' ? 'default' : 'ghost'}
              onClick={() => setTab('editor')}
            >
              Editor
            </Button>
            <Button
              type="button"
              variant={tab === 'compare' ? 'default' : 'ghost'}
              onClick={() => setTab('compare')}
            >
              <GitCompare className="mr-2 h-4 w-4" /> Compare
            </Button>
          </div>

          {tab === 'editor' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Import</CardTitle>
                    <CardDescription>Paste your .env content to parse.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder={'# Paste .env content here\nDATABASE_URL=postgres://...\nAPI_KEY=your-key'}
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                    />
                    <Button type="button" onClick={handleParse} disabled={!rawInput.trim()}>
                      Parse
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Entries ({entries.length})</CardTitle>
                      <CardDescription>Edit key-value pairs.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {entries.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No entries. Paste .env content above or add entries manually.
                      </p>
                    )}
                    {entries.map((entry, index) => {
                      const entryErrors = getErrorForEntry(index);
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <Input
                              className="font-mono flex-1"
                              placeholder="KEY"
                              value={entry.key}
                              onChange={(e) => updateEntry(index, 'key', e.target.value)}
                            />
                            <span className="text-muted-foreground">=</span>
                            <Input
                              className="font-mono flex-1"
                              placeholder="value"
                              value={entry.value}
                              onChange={(e) => updateEntry(index, 'value', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEntry(index)}
                              aria-label="Delete entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {entryErrors.map((err, i) => (
                            <p
                              key={i}
                              className={`text-xs flex items-center gap-1 ${
                                err.message.includes('warning')
                                  ? 'text-yellow-600'
                                  : 'text-destructive'
                              }`}
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {err.message}
                            </p>
                          ))}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>Generated .env file content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="min-h-[300px] max-h-[500px] overflow-auto rounded-md border bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
                    {entries.length > 0 ? output : '# Edit entries to generate .env content'}
                  </pre>
                  <Button
                    type="button"
                    onClick={copyToClipboard}
                    disabled={entries.length === 0}
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy .env
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === 'compare' && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>File A</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder="Paste first .env file..."
                      value={compareA}
                      onChange={(e) => setCompareA(e.target.value)}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>File B</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder="Paste second .env file..."
                      value={compareB}
                      onChange={(e) => setCompareB(e.target.value)}
                    />
                  </CardContent>
                </Card>
              </div>

              {diffResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Comparison Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {diffResult.onlyInA.length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold text-red-600">Only in File A:</Label>
                        <div className="mt-1 space-y-1">
                          {diffResult.onlyInA.map((key) => (
                            <div key={key} className="text-sm font-mono bg-red-50 px-2 py-1 rounded">
                              {key}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diffResult.onlyInB.length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold text-green-600">Only in File B:</Label>
                        <div className="mt-1 space-y-1">
                          {diffResult.onlyInB.map((key) => (
                            <div key={key} className="text-sm font-mono bg-green-50 px-2 py-1 rounded">
                              {key}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diffResult.differentValues.length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold text-yellow-600">
                          Different Values:
                        </Label>
                        <div className="mt-1 space-y-2">
                          {diffResult.differentValues.map(({ key, valueA, valueB }) => (
                            <div
                              key={key}
                              className="text-sm font-mono bg-yellow-50 px-2 py-1 rounded space-y-1"
                            >
                              <div className="font-semibold">{key}</div>
                              <div className="text-red-600">A: {valueA}</div>
                              <div className="text-green-600">B: {valueB}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diffResult.onlyInA.length === 0 &&
                      diffResult.onlyInB.length === 0 &&
                      diffResult.differentValues.length === 0 &&
                      diffResult.inBoth.length > 0 && (
                        <p className="text-sm text-green-600">Files are identical.</p>
                      )}

                    {diffResult.inBoth.length === 0 &&
                      diffResult.onlyInA.length === 0 &&
                      diffResult.onlyInB.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No entries found. Paste .env content in both fields.
                        </p>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
