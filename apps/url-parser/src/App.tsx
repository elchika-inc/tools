import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Link, Hammer, Trash2, Plus, X } from 'lucide-react';
import {
  parseUrl,
  extractQueryParams,
  buildUrl,
  type ParsedUrl,
  type QueryParam,
  type UrlParts,
} from '@/utils/urlParser';
import { toast, ToastToaster } from "@/components/ui/toast";

type Mode = 'parse' | 'build';

export default function App() {
  const [mode, setMode] = useState<Mode>('parse');
  const [urlInput, setUrlInput] = useState('');
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [parseError, setParseError] = useState('');
  // Builder state
  const [builderParts, setBuilderParts] = useState<UrlParts>({
    protocol: 'https:',
    username: '',
    password: '',
    hostname: '',
    port: '',
    pathname: '/',
    queryParams: [],
    hash: '',
  });
  const [builtUrl, setBuiltUrl] = useState('');

  const handleParse = useCallback(() => {
    if (!urlInput.trim()) return;
    const result = parseUrl(urlInput.trim());
    if (result) {
      setParsed(result);
      setQueryParams(extractQueryParams(result.search));
      setParseError('');
    } else {
      setParsed(null);
      setQueryParams([]);
      setParseError('Invalid URL. Please enter a valid URL including the protocol (e.g. https://).');
    }
  }, [urlInput]);

  const handleBuild = useCallback(() => {
    const url = buildUrl(builderParts);
    if (url) {
      setBuiltUrl(url);
      toast.add({ title: 'URL built successfully' });
    } else {
      toast.add({ title: 'Build failed', description: 'Hostname is required.', type: "error" });
    }
  }, [builderParts, toast]);

  const copyToClipboard = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: `Copied${label ? `: ${label}` : ''}` });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const urlParts: { label: string; value: string; key: keyof ParsedUrl }[] = parsed
    ? [
        { label: 'Protocol', value: parsed.protocol, key: 'protocol' },
        { label: 'Username', value: parsed.username, key: 'username' },
        { label: 'Password', value: parsed.password, key: 'password' },
        { label: 'Host', value: parsed.host, key: 'host' },
        { label: 'Hostname', value: parsed.hostname, key: 'hostname' },
        { label: 'Port', value: parsed.port, key: 'port' },
        { label: 'Origin', value: parsed.origin, key: 'origin' },
        { label: 'Pathname', value: parsed.pathname, key: 'pathname' },
        { label: 'Search', value: parsed.search, key: 'search' },
        { label: 'Hash', value: parsed.hash, key: 'hash' },
      ]
    : [];

  const updateBuilderPart = <K extends keyof UrlParts>(key: K, value: UrlParts[K]) => {
    setBuilderParts((prev) => ({ ...prev, [key]: value }));
  };

  const addBuilderQueryParam = () => {
    setBuilderParts((prev) => ({
      ...prev,
      queryParams: [...prev.queryParams, { key: '', value: '' }],
    }));
  };

  const updateBuilderQueryParam = (index: number, field: 'key' | 'value', val: string) => {
    setBuilderParts((prev) => {
      const params = [...prev.queryParams];
      params[index] = { ...params[index], [field]: val };
      return { ...prev, queryParams: params };
    });
  };

  const removeBuilderQueryParam = (index: number) => {
    setBuilderParts((prev) => ({
      ...prev,
      queryParams: prev.queryParams.filter((_, i) => i !== index),
    }));
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
            <h1 className="text-3xl font-bold tracking-tight">URL Parser</h1>
            <p className="text-muted-foreground">
              URLを分解して各パートを確認したり、パーツからURLを構築できます。
            </p>
          </header>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'parse' ? 'default' : 'outline'}
              onClick={() => setMode('parse')}
            >
              <Link className="mr-2 h-4 w-4" /> Parse Mode
            </Button>
            <Button
              type="button"
              variant={mode === 'build' ? 'default' : 'outline'}
              onClick={() => setMode('build')}
            >
              <Hammer className="mr-2 h-4 w-4" /> Build Mode
            </Button>
          </div>

          {mode === 'parse' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>URL Input</CardTitle>
                  <CardDescription>URLを入力すると各パーツに分解されます。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com:8080/path?key=value#section"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleParse()}
                    />
                    <Button type="button" onClick={handleParse} disabled={!urlInput.trim()}>
                      Parse
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUrlInput('');
                        setParsed(null);
                        setQueryParams([]);
                        setParseError('');
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {parseError && <p role="alert" className="text-sm text-destructive">{parseError}</p>}
                </CardContent>
              </Card>

              {parsed && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>URL Components</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {urlParts.map((part) => (
                          <div key={part.key} className="flex items-center gap-3">
                            <Label className="w-24 text-right text-sm font-medium shrink-0">
                              {part.label}
                            </Label>
                            <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all min-h-[36px] flex items-center">
                              {part.value || <span className="text-muted-foreground italic">(empty)</span>}
                            </code>
                            {part.value && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(part.value, part.label)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {queryParams.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Query Parameters</CardTitle>
                        <CardDescription>{queryParams.length} parameter(s)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-4 py-2 text-left font-medium">Key</th>
                                <th className="px-4 py-2 text-left font-medium">Value</th>
                                <th className="px-4 py-2 w-10" />
                              </tr>
                            </thead>
                            <tbody>
                              {queryParams.map((param, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="px-4 py-2 font-mono">{param.key}</td>
                                  <td className="px-4 py-2 font-mono break-all">{param.value}</td>
                                  <td className="px-4 py-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        copyToClipboard(`${param.key}=${param.value}`, param.key)
                                      }
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Full URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                          {parsed.href}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => copyToClipboard(parsed.href, 'Full URL')}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}

          {mode === 'build' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>URL Builder</CardTitle>
                  <CardDescription>各パーツを入力してURLを構築します。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Protocol</Label>
                      <Input
                        value={builderParts.protocol}
                        onChange={(e) => updateBuilderPart('protocol', e.target.value)}
                        placeholder="https:"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hostname *</Label>
                      <Input
                        value={builderParts.hostname}
                        onChange={(e) => updateBuilderPart('hostname', e.target.value)}
                        placeholder="example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        value={builderParts.port}
                        onChange={(e) => updateBuilderPart('port', e.target.value)}
                        placeholder="8080"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pathname</Label>
                      <Input
                        value={builderParts.pathname}
                        onChange={(e) => updateBuilderPart('pathname', e.target.value)}
                        placeholder="/path/to/resource"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        value={builderParts.username}
                        onChange={(e) => updateBuilderPart('username', e.target.value)}
                        placeholder="user"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        value={builderParts.password}
                        onChange={(e) => updateBuilderPart('password', e.target.value)}
                        placeholder="pass"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Hash</Label>
                      <Input
                        value={builderParts.hash}
                        onChange={(e) => updateBuilderPart('hash', e.target.value)}
                        placeholder="#section"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Query Parameters</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addBuilderQueryParam}>
                        <Plus className="mr-1 h-3 w-3" /> Add
                      </Button>
                    </div>
                    {builderParts.queryParams.map((param, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input
                          placeholder="key"
                          value={param.key}
                          onChange={(e) => updateBuilderQueryParam(i, 'key', e.target.value)}
                        />
                        <span className="text-muted-foreground">=</span>
                        <Input
                          placeholder="value"
                          value={param.value}
                          onChange={(e) => updateBuilderQueryParam(i, 'value', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBuilderQueryParam(i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setBuilderParts({
                          protocol: 'https:',
                          username: '',
                          password: '',
                          hostname: '',
                          port: '',
                          pathname: '/',
                          queryParams: [],
                          hash: '',
                        });
                        setBuiltUrl('');
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button type="button" onClick={handleBuild}>
                      <Hammer className="mr-2 h-4 w-4" /> Build URL
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {builtUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Built URL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                        {builtUrl}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => copyToClipboard(builtUrl, 'Built URL')}
                      >
                        <Copy className="mr-2 h-4 w-4" /> Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>

      </div>
  </ToastToaster>;
}
