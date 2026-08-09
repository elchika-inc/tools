import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { detect, clean, cleanByTypes, type InvisibleCharType } from '@/utils/invisibleChars';
import { toast, ToastToaster } from "@/components/ui/toast";

const TYPE_LABELS: Record<InvisibleCharType, string> = {
  'zero-width-space': 'Zero Width Space',
  'zero-width-joiner': 'Zero Width Joiner/Non-Joiner',
  'bom': 'Byte Order Mark (BOM)',
  'soft-hyphen': 'Soft Hyphen',
  'control-char': 'Control Characters',
  'other-invisible': 'Other Invisible Characters',
};

const TYPE_COLORS: Record<InvisibleCharType, string> = {
  'zero-width-space': 'bg-red-100 text-red-800',
  'zero-width-joiner': 'bg-orange-100 text-orange-800',
  'bom': 'bg-purple-100 text-purple-800',
  'soft-hyphen': 'bg-blue-100 text-blue-800',
  'control-char': 'bg-yellow-100 text-yellow-800',
  'other-invisible': 'bg-gray-100 text-gray-800',
};

export default function App() {
  const [input, setInput] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<InvisibleCharType>>(new Set());
  const result = useMemo(() => detect(input), [input]);

  const handleRemoveAll = () => {
    const cleaned = clean(input);
    setInput(cleaned);
    toast.add({ title: `Removed ${result.totalCount} invisible characters` });
  };

  const handleRemoveSelected = () => {
    if (selectedTypes.size === 0) {
      toast.add({ title: 'Select character types to remove', type: "error" });
      return;
    }
    const cleaned = cleanByTypes(input, Array.from(selectedTypes));
    setInput(cleaned);
    const count = Array.from(selectedTypes).reduce(
      (sum, type) => sum + (result.countByType[type] || 0),
      0
    );
    toast.add({ title: `Removed ${count} characters of selected types` });
    setSelectedTypes(new Set());
  };

  const copyCleanedText = async () => {
    try {
      const cleaned = clean(input);
      await navigator.clipboard.writeText(cleaned);
      toast.add({ title: 'Cleaned text copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const toggleType = (type: InvisibleCharType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const activeTypes = (Object.keys(result.countByType) as InvisibleCharType[]).filter(
    (type) => result.countByType[type] > 0
  );

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Invisible Characters Detector</h1>
            <p className="text-muted-foreground">
              Detect and remove invisible characters like zero-width spaces, BOM, and control characters.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Paste text to scan for invisible characters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">Text</Label>
                <textarea
                  id="input"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none font-mono"
                  placeholder="Paste text here to check for invisible characters..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {input.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.totalCount > 0 ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-green-500" />
                    )}
                    Detection Results
                  </CardTitle>
                  <CardDescription>
                    {result.totalCount === 0
                      ? 'No invisible characters found.'
                      : `Found ${result.totalCount} invisible character(s).`}
                  </CardDescription>
                </CardHeader>
                {result.totalCount > 0 && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Characters by Type</Label>
                      <div className="space-y-2">
                        {activeTypes.map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-3 p-2 rounded-md border cursor-pointer hover:bg-accent"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTypes.has(type)}
                              onChange={() => toggleType(type)}
                              className="rounded"
                            />
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[type]}`}>
                              {result.countByType[type]}
                            </span>
                            <span className="text-sm">{TYPE_LABELS[type]}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {result.invisibleChars.length > 0 && (
                      <div className="space-y-2">
                        <Label>Detected Characters</Label>
                        <div className="max-h-[300px] overflow-y-auto border rounded-md">
                          <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                              <tr>
                                <th className="text-left p-2">Position</th>
                                <th className="text-left p-2">Code Point</th>
                                <th className="text-left p-2">Name</th>
                                <th className="text-left p-2">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.invisibleChars.map((c, i) => (
                                <tr key={i} className="border-t">
                                  <td className="p-2 font-mono">{c.position}</td>
                                  <td className="p-2 font-mono">{c.codePoint}</td>
                                  <td className="p-2">{c.name}</td>
                                  <td className="p-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[c.type]}`}>
                                      {TYPE_LABELS[c.type]}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button type="button" variant="destructive" onClick={handleRemoveAll}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveSelected}
                        disabled={selectedTypes.size === 0}
                      >
                        Remove Selected Types
                      </Button>
                      <Button type="button" onClick={copyCleanedText}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Cleaned Text
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </>
          )}
        </main>

      </div>
  </ToastToaster>;
}
