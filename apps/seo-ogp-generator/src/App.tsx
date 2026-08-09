import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DEFAULT_CONFIG, generateOGPTags, type OGPConfig } from '@/utils/ogp';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [config, setConfig] = useState<OGPConfig>(DEFAULT_CONFIG);
  const tags = useMemo(() => generateOGPTags(config), [config]);

  const copyTags = async () => {
    try {
      await navigator.clipboard.writeText(tags);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'コピーに失敗しました', type: "error" });
    }
  };

  const update = (key: keyof OGPConfig, value: string) =>
    setConfig((p) => ({ ...p, [key]: value }));
  const cls =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">OGP Meta Tag Generator</h1>
            <p className="text-muted-foreground">OGP(Open Graph Protocol)メタタグを生成します。</p>
          </header>

          <main>
          <div className="grid gap-4 md:grid-cols-[1fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(
                  [
                    ['title', 'タイトル', 'ページタイトル'],
                    ['description', '説明', 'ページの説明文'],
                    ['url', 'URL', 'https://example.com'],
                    ['image', '画像URL', 'https://example.com/image.jpg'],
                    ['siteName', 'サイト名', 'My Website'],
                    ['twitterSite', 'Twitter @', '@username'],
                  ] as const
                ).map(([key, label, placeholder]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <input
                      type="text"
                      value={config[key]}
                      onChange={(e) => update(key, e.target.value)}
                      placeholder={placeholder}
                      className={cls}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <select
                      value={config.type}
                      onChange={(e) => update('type', e.target.value)}
                      className={cls}
                    >
                      <option value="website">website</option>
                      <option value="article">article</option>
                      <option value="product">product</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Twitter Card</Label>
                    <select
                      value={config.twitterCard}
                      onChange={(e) => update('twitterCard', e.target.value)}
                      className={cls}
                    >
                      <option value="summary_large_image">summary_large_image</option>
                      <option value="summary">summary</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Tags</CardTitle>
                <CardDescription>以下のメタタグをHTMLのheadに追加してください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  readOnly
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-xs font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  value={tags}
                />
                <Button type="button" onClick={copyTags} disabled={!tags} className="w-full">
                  <Copy className="mr-2 h-4 w-4" /> Copy Tags
                </Button>
              </CardContent>
            </Card>
          </div>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}
