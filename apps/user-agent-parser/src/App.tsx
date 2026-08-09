import { Copy, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type ParsedUA, parseUserAgent } from '@/utils/userAgent';
import { toast, ToastToaster } from "@/components/ui/toast";

const FIELD_LABELS: { key: keyof ParsedUA; label: string }[] = [
  { key: 'browser', label: 'Browser' },
  { key: 'browserVersion', label: 'Browser Version' },
  { key: 'os', label: 'OS' },
  { key: 'osVersion', label: 'OS Version' },
  { key: 'device', label: 'Device' },
  { key: 'engine', label: 'Engine' },
  { key: 'isMobile', label: 'Mobile' },
  { key: 'isBot', label: 'Bot' },
];

export default function App() {
  const [input, setInput] = useState(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const [parsed, setParsed] = useState<ParsedUA | null>(null);
  const handleParse = () => {
    if (!input.trim()) {
      toast.add({
        title: 'Input is empty',
        description: 'Please enter a User Agent string',
        type: "error",
      });
      return;
    }
    const result = parseUserAgent(input);
    setParsed(result);
    toast.add({ title: 'Parsed successfully' });
  };

  const handleCopy = async () => {
    if (!parsed) return;
    const text = FIELD_LABELS.map(({ key, label }) => `${label}: ${String(parsed[key])}`).join(
      '\n'
    );
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({
        title: 'Copy failed',
        description: 'Could not access clipboard',
        type: "error",
      });
    }
  };

  const handleClear = () => {
    setInput('');
    setParsed(null);
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">User Agent Parser</h1>
            <p className="text-muted-foreground">
              Parse User Agent strings to extract browser, OS, device, and engine information.
            </p>
          </header>

          <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>
                Enter a User Agent string to parse. Your current browser's UA is pre-filled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ua-input">User Agent</Label>
                <textarea
                  id="ua-input"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Enter User Agent string here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={handleParse} disabled={!input}>
                  <Search className="mr-2 h-4 w-4" /> Parse
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {parsed && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>Parsed User Agent information</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Field</th>
                        <th className="p-3 text-left font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FIELD_LABELS.map(({ key, label }) => (
                        <tr key={key} className="border-b last:border-b-0">
                          <td className="p-3 font-medium text-muted-foreground">{label}</td>
                          <td className="p-3">{String(parsed[key])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
