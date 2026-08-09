import { Copy, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateULID, generateUUIDv4, type IdType, parseUUID } from '@/utils/uuidGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

interface GeneratedId {
  value: string;
  type: IdType;
  info?: { version: string; variant: string };
}

export default function App() {
  const [idType, setIdType] = useState<IdType>('uuid-v4');
  const [count, setCount] = useState(1);
  const [generatedIds, setGeneratedIds] = useState<GeneratedId[]>([]);
  const handleGenerate = () => {
    const safeCount = Math.max(1, Math.min(count, 100));
    const ids: GeneratedId[] = [];
    for (let i = 0; i < safeCount; i++) {
      if (idType === 'uuid-v4') {
        const value = generateUUIDv4();
        const parsed = parseUUID(value);
        ids.push({
          value,
          type: idType,
          info: { version: parsed.version, variant: parsed.variant },
        });
      } else {
        ids.push({ value: generateULID(), type: idType });
      }
    }
    setGeneratedIds(ids);
    toast.add({ title: `Generated ${safeCount} ${idType === 'uuid-v4' ? 'UUID v4' : 'ULID'}` });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const handleCopyAll = async () => {
    try {
      const allText = generatedIds.map((id) => id.value).join('\n');
      await navigator.clipboard.writeText(allText);
      toast.add({ title: 'All IDs copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const handleClear = () => {
    setGeneratedIds([]);
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
            <h1 className="text-3xl font-bold tracking-tight">UUID/ULID Generator</h1>
            <p className="text-muted-foreground">
              Generate UUID v4 or ULID identifiers securely in your browser.
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generator</CardTitle>
              <CardDescription>Select the ID type and number to generate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr,1fr,auto]">
                <div className="space-y-2">
                  <Label htmlFor="id-type">Type</Label>
                  <Select value={idType} onValueChange={(v) => setIdType(v as IdType)}>
                    <SelectTrigger id="id-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uuid-v4">UUID v4</SelectItem>
                      <SelectItem value="ulid">ULID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="count">Count</Label>
                  <Input
                    id="count"
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Number.parseInt(e.target.value, 10) || 1)}
                  />
                </div>

                <div className="flex items-end">
                  <Button type="button" onClick={handleGenerate}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {generatedIds.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Results ({generatedIds.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleClear}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleCopyAll}>
                      <Copy className="mr-2 h-4 w-4" /> Copy All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {generatedIds.map((id) => (
                    <div
                      key={id.value}
                      className="flex items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono break-all">{id.value}</code>
                        {id.info && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {id.info.version} / {id.info.variant}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(id.value)}
                        aria-label="Copy ID"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
