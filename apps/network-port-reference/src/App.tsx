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
import { Copy, Search } from 'lucide-react';
import {
  searchPorts,
  getPortCategory,
  type ProtocolFilter,
  type CategoryFilter,
} from '@/utils/portDatabase';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [query, setQuery] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const results = useMemo(
    () => searchPorts(query, protocolFilter, categoryFilter),
    [query, protocolFilter, categoryFilter],
  );

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
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Network Port Reference</h1>
            <p className="text-muted-foreground">
              ネットワークポート番号のリファレンス。ポート番号やサービス名で検索できます。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>ポート番号またはサービス名で検索してください。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Port number or service name..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-[160px] space-y-2">
                  <Label>Protocol</Label>
                  <Select
                    value={protocolFilter}
                    onValueChange={(v) => setProtocolFilter(v as ProtocolFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Protocols</SelectItem>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="UDP">UDP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px] space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="well-known">Well-Known (0-1023)</SelectItem>
                      <SelectItem value="registered">Registered (1024+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>{results.length} port(s) found</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No ports found matching your search.</p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium w-20">Port</th>
                        <th className="px-4 py-3 text-left font-medium w-24">Protocol</th>
                        <th className="px-4 py-3 text-left font-medium w-40">Service</th>
                        <th className="px-4 py-3 text-left font-medium">Description</th>
                        <th className="px-4 py-3 text-left font-medium w-36">Category</th>
                        <th className="px-4 py-3 w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((entry) => (
                        <tr key={`${entry.port}-${entry.protocol}`} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono font-semibold">{entry.port}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                entry.protocol === 'TCP'
                                  ? 'bg-blue-100 text-blue-800'
                                  : entry.protocol === 'UDP'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {entry.protocol}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{entry.service}</td>
                          <td className="px-4 py-3 text-muted-foreground">{entry.description}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {getPortCategory(entry.port)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(String(entry.port))}
                              title="Copy port number"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
