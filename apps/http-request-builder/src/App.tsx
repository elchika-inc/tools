import { useState } from 'react';
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
import { Copy, Send, Plus, X, Trash2, Loader2 } from 'lucide-react';
import {
  sendRequest,
  createEmptyHeader,
  formatBytes,
  tryFormatJson,
  isJsonResponse,
  type HttpMethod,
  type BodyType,
  type KeyValuePair,
  type ResponseData,
} from '@/utils/requestBuilder';
import { toast, ToastToaster } from "@/components/ui/toast";

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-600',
  POST: 'text-blue-600',
  PUT: 'text-orange-600',
  DELETE: 'text-red-600',
  PATCH: 'text-purple-600',
  HEAD: 'text-gray-600',
  OPTIONS: 'text-gray-600',
};

export default function App() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<KeyValuePair[]>([createEmptyHeader()]);
  const [bodyType, setBodyType] = useState<BodyType>('none');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'headers' | 'body'>('headers');
  const [responseTab, setResponseTab] = useState<'body' | 'headers'>('body');
  const handleSend = async () => {
    if (!url.trim()) {
      toast.add({ title: 'URL is required', type: "error" });
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const result = await sendRequest({
        method,
        url: url.trim(),
        headers,
        bodyType,
        body,
      });
      setResponse(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setError(msg);
      toast.add({ title: 'Request failed', description: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => {
    setHeaders((prev) => [...prev, createEmptyHeader()]);
  };

  const updateHeader = (id: string, field: keyof KeyValuePair, value: string | boolean) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    );
  };

  const removeHeader = (id: string) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-success-foreground bg-success';
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-50';
    if (status >= 400 && status < 500) return 'text-warning-foreground bg-warning';
    if (status >= 500) return 'text-destructive bg-destructive-subtle';
    return 'text-gray-600 bg-gray-50';
  };

  const formattedBody = response
    ? isJsonResponse(response.headers)
      ? tryFormatJson(response.body)
      : response.body
    : '';

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-5xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">HTTP Request Builder</h1>
            <p className="text-muted-foreground">
              REST APIリクエストを構築して送信し、レスポンスを確認できます。
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Method + URL */}
              <div className="flex gap-2">
                <Select value={method} onValueChange={(v) => setMethod(v as HttpMethod)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        <span className={`font-mono font-bold ${METHOD_COLORS[m]}`}>{m}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1"
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button type="button" onClick={handleSend} disabled={loading || !url.trim()}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send
                </Button>
              </div>

              {/* Tabs for Headers / Body */}
              <div className="flex gap-1 border-b">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === 'headers'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('headers')}
                >
                  Headers
                  {headers.filter((h) => h.key.trim()).length > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({headers.filter((h) => h.key.trim()).length})
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                    activeTab === 'body'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('body')}
                >
                  Body
                </button>
              </div>

              {/* Headers Tab */}
              {activeTab === 'headers' && (
                <div className="space-y-2">
                  {headers.map((header) => (
                    <div key={header.id} className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => updateHeader(header.id, 'enabled', e.target.checked)}
                        className="shrink-0"
                        aria-label={`Enable header ${header.key || 'row'}`}
                      />
                      <Input
                        placeholder="Header name"
                        value={header.key}
                        onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHeader(header.id)}
                        aria-label="Remove header"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addHeader}>
                    <Plus className="mr-1 h-3 w-3" /> Add Header
                  </Button>
                </div>
              )}

              {/* Body Tab */}
              {activeTab === 'body' && (
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <Label>Body Type:</Label>
                    <Select value={bodyType} onValueChange={(v) => setBodyType(v as BodyType)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="form-data">Form URL Encoded</SelectItem>
                        <SelectItem value="text">Raw Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {bodyType !== 'none' && (
                    <textarea
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      placeholder={
                        bodyType === 'json'
                          ? '{\n  "key": "value"\n}'
                          : bodyType === 'form-data'
                            ? 'key1=value1&key2=value2'
                            : 'Enter request body...'
                      }
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-destructive text-sm" role="alert">
                  <strong>Error:</strong> {error}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response */}
          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  Response
                  <span className={`px-2 py-1 rounded text-sm font-mono ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-sm text-muted-foreground font-normal">
                    {response.time}ms / {formatBytes(response.size)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Response tabs */}
                <div className="flex gap-1 border-b">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                      responseTab === 'body'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setResponseTab('body')}
                  >
                    Body
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                      responseTab === 'headers'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setResponseTab('headers')}
                  >
                    Headers ({Object.keys(response.headers).length})
                  </button>
                </div>

                {responseTab === 'body' && (
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(response.body)}
                      >
                        <Copy className="mr-1 h-3 w-3" /> Copy
                      </Button>
                    </div>
                    <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-auto max-h-[500px] whitespace-pre-wrap break-all">
                      {formattedBody}
                    </pre>
                  </div>
                )}

                {responseTab === 'headers' && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-2 text-left font-medium w-1/3">Header</th>
                          <th className="px-4 py-2 text-left font-medium">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(response.headers).map(([key, value]) => (
                          <tr key={key} className="border-b last:border-0">
                            <td className="px-4 py-2 font-mono font-medium">{key}</td>
                            <td className="px-4 py-2 font-mono text-muted-foreground break-all">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
