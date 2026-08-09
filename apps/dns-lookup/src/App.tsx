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
import { Search, Loader2, Copy, Globe } from 'lucide-react';
import {
  lookupDns,
  formatTtl,
  getDnsStatusText,
  DNS_RECORD_TYPES,
  type DnsRecordType,
  type DnsLookupResult,
} from '@/utils/dnsLookup';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState<DnsRecordType>('A');
  const [result, setResult] = useState<DnsLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedTypeInfo = useMemo(
    () => DNS_RECORD_TYPES.find((r) => r.type === recordType),
    [recordType],
  );

  const handleLookup = async () => {
    if (!domain.trim()) {
      toast.add({ title: 'Domain name is required', type: "error" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const lookupResult = await lookupDns(domain.trim(), recordType);
      setResult(lookupResult);
    } catch (e) {
      toast.add({
        title: 'Lookup failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">DNS Lookup</h1>
            <p className="text-muted-foreground">
              DNSレコードを検索します。DNS-over-HTTPS (Google DNS) を使用してブラウザから直接検索できます。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Lookup</CardTitle>
              <CardDescription>
                ドメイン名とレコードタイプを指定して検索してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Domain</Label>
                  <Input
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  />
                </div>
                <div className="w-[140px] space-y-2">
                  <Label>Record Type</Label>
                  <Select value={recordType} onValueChange={(v) => setRecordType(v as DnsRecordType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DNS_RECORD_TYPES.map((type) => (
                        <SelectItem key={type.type} value={type.type}>
                          {type.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleLookup} disabled={loading || !domain.trim()}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Lookup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Record Type Reference */}
          {selectedTypeInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {selectedTypeInfo.type} - {selectedTypeInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{selectedTypeInfo.description}</p>
                <div className="space-y-2">
                  <Label className="text-xs">Format</Label>
                  <code className="block px-3 py-2 bg-muted rounded-md text-xs font-mono">
                    {selectedTypeInfo.format}
                  </code>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Example</Label>
                  <code className="block px-3 py-2 bg-muted rounded-md text-xs font-mono">
                    {selectedTypeInfo.example}
                  </code>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lookup Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Results for {result.domain} ({result.recordType})
                </CardTitle>
                <CardDescription>
                  {getDnsStatusText(result.status)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.error && (
                  <div className="p-3 mb-4 bg-destructive-subtle border border-destructive rounded-md text-sm text-destructive" role="alert">
                    {result.error}
                  </div>
                )}

                {result.answers.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left font-medium">Name</th>
                          <th className="px-4 py-3 text-left font-medium w-20">TTL</th>
                          <th className="px-4 py-3 text-left font-medium">Data</th>
                          <th className="px-4 py-3 w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {result.answers.map((answer, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="px-4 py-3 font-mono text-sm">{answer.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {formatTtl(answer.TTL)}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm break-all">
                              {answer.data}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(answer.data)}
                                aria-label="Copy DNS record"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !result.error && (
                    <p className="text-center text-muted-foreground py-8">
                      No {result.recordType} records found for {result.domain}.
                    </p>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {/* Record Type Reference Table */}
          <Card>
            <CardHeader>
              <CardTitle>DNS Record Types Reference</CardTitle>
              <CardDescription>All supported DNS record types and their descriptions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium w-20">Type</th>
                      <th className="px-4 py-3 text-left font-medium w-48">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DNS_RECORD_TYPES.map((type) => (
                      <tr key={type.type} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-semibold text-xs">
                            {type.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{type.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {type.description.substring(0, 120)}
                          {type.description.length > 120 ? '...' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
