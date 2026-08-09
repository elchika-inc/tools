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
import { Copy, Plus, Trash2 } from 'lucide-react';
import {
  generateNginxConfig,
  defaultConfig,
  type NginxConfig,
  type PresetType,
} from '@/utils/nginxGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [config, setConfig] = useState<NginxConfig>({ ...defaultConfig });
  const output = useMemo(() => generateNginxConfig(config), [config]);

  const update = (partial: Partial<NginxConfig>) => {
    setConfig({ ...config, ...partial });
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
            <h1 className="text-3xl font-bold tracking-tight">Nginx Config Generator</h1>
            <p className="text-muted-foreground">
              Generate nginx configuration from presets: reverse proxy, static file server, or SPA.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preset</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={config.preset} onValueChange={(v) => update({ preset: v as PresetType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reverse-proxy">Reverse Proxy</SelectItem>
                      <SelectItem value="static">Static File Server</SelectItem>
                      <SelectItem value="spa">Single Page Application (SPA)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Server</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Server Name</Label>
                      <Input value={config.serverName} onChange={(e) => update({ serverName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Listen Port</Label>
                      <Input type="number" value={config.listenPort} onChange={(e) => update({ listenPort: parseInt(e.target.value) || 80 })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Client Max Body Size</Label>
                    <Input value={config.clientMaxBodySize} onChange={(e) => update({ clientMaxBodySize: e.target.value })} placeholder="10m" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="ssl" checked={config.enableSsl} onChange={(e) => update({ enableSsl: e.target.checked })} className="rounded" />
                    <Label htmlFor="ssl">Enable SSL</Label>
                  </div>
                  {config.enableSsl && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>SSL Cert Path</Label>
                        <Input value={config.sslCertPath} onChange={(e) => update({ sslCertPath: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>SSL Key Path</Label>
                        <Input value={config.sslKeyPath} onChange={(e) => update({ sslKeyPath: e.target.value })} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {config.preset === 'reverse-proxy' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Proxy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Proxy Pass</Label>
                      <Input value={config.proxyPass} onChange={(e) => update({ proxyPass: e.target.value })} placeholder="http://localhost:3000" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="ws" checked={config.proxyWebsocket} onChange={(e) => update({ proxyWebsocket: e.target.checked })} className="rounded" />
                      <Label htmlFor="ws">WebSocket Support</Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              {config.preset === 'static' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Static File Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Root Directory</Label>
                      <Input value={config.root} onChange={(e) => update({ root: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Index Files</Label>
                      <Input value={config.indexFiles} onChange={(e) => update({ indexFiles: e.target.value })} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {config.preset === 'spa' && (
                <Card>
                  <CardHeader>
                    <CardTitle>SPA Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Root Directory</Label>
                      <Input value={config.spaRoot} onChange={(e) => update({ spaRoot: e.target.value })} />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="gzip" checked={config.enableGzip} onChange={(e) => update({ enableGzip: e.target.checked })} className="rounded" />
                    <Label htmlFor="gzip">Enable Gzip</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="log" checked={config.enableAccessLog} onChange={(e) => update({ enableAccessLog: e.target.checked })} className="rounded" />
                    <Label htmlFor="log">Enable Access Log</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cors" checked={config.enableCors} onChange={(e) => update({ enableCors: e.target.checked })} className="rounded" />
                    <Label htmlFor="cors">Enable CORS</Label>
                  </div>
                  {config.enableCors && (
                    <div className="space-y-2 ml-6">
                      <Label>CORS Origin</Label>
                      <Input value={config.corsOrigin} onChange={(e) => update({ corsOrigin: e.target.value })} placeholder="*" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Custom Headers</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => update({ customHeaders: [...config.customHeaders, { name: '', value: '' }] })}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {config.customHeaders.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Header-Name" value={h.name} onChange={(e) => { const headers = [...config.customHeaders]; headers[i] = { ...headers[i], name: e.target.value }; update({ customHeaders: headers }); }} />
                      <Input placeholder="value" value={h.value} onChange={(e) => { const headers = [...config.customHeaders]; headers[i] = { ...headers[i], value: e.target.value }; update({ customHeaders: headers }); }} />
                      <Button type="button" variant="ghost" size="sm" onClick={() => update({ customHeaders: config.customHeaders.filter((_, j) => j !== i) })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {config.customHeaders.length === 0 && (
                    <p className="text-sm text-muted-foreground">No custom headers.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="lg:sticky lg:top-8 self-start">
              <CardHeader>
                <CardTitle>Generated Config</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="rounded-md bg-muted p-4 font-mono text-sm overflow-auto whitespace-pre max-h-[700px]">
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
        </main>
        
      </div>
  </ToastToaster>;
}
