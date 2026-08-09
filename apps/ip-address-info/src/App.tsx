import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Search, Trash2 } from 'lucide-react';
import { analyzeIp, type IpInfo } from '@/utils/ipInfo';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<IpInfo | null>(null);
  const [error, setError] = useState('');
  const handleAnalyze = useCallback(() => {
    if (!input.trim()) return;
    const info = analyzeIp(input.trim());
    if (info) {
      setResult(info);
      setError('');
    } else {
      setResult(null);
      setError('Invalid IP address. Enter a valid IPv4 or IPv6 address (CIDR notation supported).');
    }
  }, [input]);

  const copyToClipboard = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: `Copied${label ? `: ${label}` : ''}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  const infoRows: { label: string; value: string }[] = result
    ? [
        { label: 'Address', value: result.address },
        { label: 'Version', value: result.version },
        {
          label: 'Type',
          value: result.isLoopback
            ? 'Loopback'
            : result.isLinkLocal
              ? 'Link-Local'
              : result.isPrivate
                ? 'Private'
                : 'Public',
        },
        { label: 'Network Class', value: result.networkClass },
        { label: 'Binary', value: result.binaryRepresentation },
        ...(result.cidr ? [{ label: 'CIDR', value: result.cidr }] : []),
        ...(result.subnetMask ? [{ label: 'Subnet Mask', value: result.subnetMask }] : []),
        ...(result.networkAddress
          ? [{ label: 'Network Address', value: result.networkAddress }]
          : []),
        ...(result.broadcastAddress
          ? [{ label: 'Broadcast Address', value: result.broadcastAddress }]
          : []),
        ...(result.hostCount !== null
          ? [{ label: 'Usable Hosts', value: result.hostCount.toLocaleString() }]
          : []),
      ]
    : [];

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">IP Address Info</h1>
            <p className="text-muted-foreground">
              IPアドレスの詳細情報を表示します。IPv4/IPv6、CIDR表記に対応しています。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>IP Address Input</CardTitle>
              <CardDescription>
                IPv4 (例: 192.168.1.1/24) または IPv6 (例: 2001:db8::1/64) を入力してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="192.168.1.1/24 or 2001:db8::1"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <Button type="button" onClick={handleAnalyze} disabled={!input.trim()}>
                  <Search className="mr-2 h-4 w-4" /> Analyze
                </Button>
                <Button type="button" variant="outline" onClick={clearAll}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
                <CardDescription>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      result.isPrivate || result.isLoopback
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {result.version} / {result.isLoopback ? 'Loopback' : result.isPrivate ? 'Private' : 'Public'}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <Label className="w-36 text-right text-sm font-medium shrink-0">
                        {row.label}
                      </Label>
                      <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all min-h-[36px] flex items-center">
                        {row.value}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(row.value, row.label)}
                        aria-label={`Copy ${row.label}`}
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
  </ToastToaster>;
}
