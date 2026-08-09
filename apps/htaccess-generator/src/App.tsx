import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Plus, Trash2 } from 'lucide-react';
import {
  type HtaccessConfig,
  type RedirectRule,
  type ErrorPage,
  defaultConfig,
  generateHtaccess,
} from '@/utils/htaccessGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [config, setConfig] = useState<HtaccessConfig>({ ...defaultConfig });
  const output = generateHtaccess(config);

  const update = (partial: Partial<HtaccessConfig>) => {
    setConfig({ ...config, ...partial });
  };

  const addRedirect = () => {
    update({ redirects: [...config.redirects, { type: '301', from: '', to: '' }] });
  };

  const updateRedirect = (index: number, field: keyof RedirectRule, value: string) => {
    const updated = config.redirects.map((r, i) =>
      i === index ? { ...r, [field]: value } : r,
    );
    update({ redirects: updated });
  };

  const removeRedirect = (index: number) => {
    update({ redirects: config.redirects.filter((_, i) => i !== index) });
  };

  const addErrorPage = () => {
    update({ errorPages: [...config.errorPages, { code: '404', path: '/404.html' }] });
  };

  const updateErrorPage = (index: number, field: keyof ErrorPage, value: string) => {
    const updated = config.errorPages.map((e, i) =>
      i === index ? { ...e, [field]: value } : e,
    );
    update({ errorPages: updated });
  };

  const removeErrorPage = (index: number) => {
    update({ errorPages: config.errorPages.filter((_, i) => i !== index) });
  };

  const addBlockedIp = () => {
    update({ blockedIps: [...config.blockedIps, ''] });
  };

  const updateBlockedIp = (index: number, value: string) => {
    const updated = config.blockedIps.map((ip, i) => (i === index ? value : ip));
    update({ blockedIps: updated });
  };

  const removeBlockedIp = (index: number) => {
    update({ blockedIps: config.blockedIps.filter((_, i) => i !== index) });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">.htaccess Generator</h1>
            <p className="text-muted-foreground">
              Generate .htaccess files with redirects, HTTPS, CORS, caching, compression, and more.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>HTTPS & WWW</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="https"
                      checked={config.enableHttpsForce}
                      onChange={(e) => update({ enableHttpsForce: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="https">Force HTTPS</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="www"
                      checked={config.enableWwwRedirect}
                      onChange={(e) => update({ enableWwwRedirect: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="www">WWW Redirect</Label>
                  </div>

                  {config.enableWwwRedirect && (
                    <select
                      value={config.wwwRedirectType}
                      onChange={(e) =>
                        update({ wwwRedirectType: e.target.value as 'add-www' | 'remove-www' })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="add-www">Add www</option>
                      <option value="remove-www">Remove www</option>
                    </select>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CORS Headers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cors"
                      checked={config.enableCors}
                      onChange={(e) => update({ enableCors: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="cors">Enable CORS</Label>
                  </div>
                  {config.enableCors && (
                    <div className="space-y-1">
                      <Label>Origin</Label>
                      <Input
                        value={config.corsOrigin}
                        onChange={(e) => update({ corsOrigin: e.target.value })}
                        placeholder="* or https://example.com"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cache"
                      checked={config.enableCacheControl}
                      onChange={(e) => update({ enableCacheControl: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="cache">Cache Control</Label>
                  </div>
                  {config.enableCacheControl && (
                    <div className="space-y-1">
                      <Label>Default Cache Duration (seconds)</Label>
                      <Input
                        type="number"
                        value={config.cacheDuration}
                        onChange={(e) => update({ cacheDuration: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="gzip"
                      checked={config.enableGzip}
                      onChange={(e) => update({ enableGzip: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="gzip">Gzip Compression</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Redirects</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addRedirect}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.redirects.map((r, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        value={r.type}
                        onChange={(e) => updateRedirect(i, 'type', e.target.value)}
                        className="w-20 rounded-md border border-input bg-background px-2 py-2 text-sm"
                      >
                        <option value="301">301</option>
                        <option value="302">302</option>
                      </select>
                      <Input
                        value={r.from}
                        onChange={(e) => updateRedirect(i, 'from', e.target.value)}
                        placeholder="/old-path"
                        className="flex-1"
                      />
                      <Input
                        value={r.to}
                        onChange={(e) => updateRedirect(i, 'to', e.target.value)}
                        placeholder="/new-path"
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeRedirect(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {config.redirects.length === 0 && (
                    <p className="text-sm text-muted-foreground">No redirects configured.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Custom Error Pages</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addErrorPage}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.errorPages.map((ep, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={ep.code}
                        onChange={(e) => updateErrorPage(i, 'code', e.target.value)}
                        placeholder="404"
                        className="w-20"
                      />
                      <Input
                        value={ep.path}
                        onChange={(e) => updateErrorPage(i, 'path', e.target.value)}
                        placeholder="/404.html"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeErrorPage(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {config.errorPages.length === 0 && (
                    <p className="text-sm text-muted-foreground">No error pages configured.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>IP Blocking</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addBlockedIp}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.blockedIps.map((ip, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={ip}
                        onChange={(e) => updateBlockedIp(i, e.target.value)}
                        placeholder="192.168.1.1"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlockedIp(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {config.blockedIps.length === 0 && (
                    <p className="text-sm text-muted-foreground">No IPs blocked.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre max-h-[600px] overflow-y-auto">
                    {output}
                  </pre>
                  <div className="flex justify-end">
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
