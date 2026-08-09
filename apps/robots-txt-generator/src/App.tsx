import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Plus, Trash2, Download } from 'lucide-react';
import {
  type UserAgentGroup,
  type PathRule,
  type RobotsTxtData,
  commonUserAgents,
  generateRobotsTxt,
} from '@/utils/robotsTxtGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [groups, setGroups] = useState<UserAgentGroup[]>([
    { userAgent: '*', rules: [{ type: 'disallow', path: '' }] },
  ]);
  const [sitemapUrls, setSitemapUrls] = useState<string[]>(['']);
  const data: RobotsTxtData = { groups, sitemapUrls };
  const output = generateRobotsTxt(data);

  const addGroup = () => {
    setGroups([...groups, { userAgent: '*', rules: [{ type: 'disallow', path: '' }] }]);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const updateUserAgent = (index: number, value: string) => {
    const updated = groups.map((g, i) => (i === index ? { ...g, userAgent: value } : g));
    setGroups(updated);
  };

  const updateCrawlDelay = (index: number, value: string) => {
    const num = value === '' ? undefined : Number(value);
    const updated = groups.map((g, i) => (i === index ? { ...g, crawlDelay: num } : g));
    setGroups(updated);
  };

  const addRule = (groupIndex: number) => {
    const updated = groups.map((g, i) => {
      if (i === groupIndex) {
        return { ...g, rules: [...g.rules, { type: 'disallow' as const, path: '/' }] };
      }
      return g;
    });
    setGroups(updated);
  };

  const removeRule = (groupIndex: number, ruleIndex: number) => {
    const updated = groups.map((g, i) => {
      if (i === groupIndex) {
        return { ...g, rules: g.rules.filter((_, ri) => ri !== ruleIndex) };
      }
      return g;
    });
    setGroups(updated);
  };

  const updateRule = (
    groupIndex: number,
    ruleIndex: number,
    field: keyof PathRule,
    value: string,
  ) => {
    const updated = groups.map((g, gi) => {
      if (gi === groupIndex) {
        return {
          ...g,
          rules: g.rules.map((r, ri) => (ri === ruleIndex ? { ...r, [field]: value } : r)),
        };
      }
      return g;
    });
    setGroups(updated);
  };

  const addSitemap = () => {
    setSitemapUrls([...sitemapUrls, '']);
  };

  const updateSitemap = (index: number, value: string) => {
    const updated = sitemapUrls.map((s, i) => (i === index ? value : s));
    setSitemapUrls(updated);
  };

  const removeSitemap = (index: number) => {
    setSitemapUrls(sitemapUrls.filter((_, i) => i !== index));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.add({ title: 'Downloaded robots.txt' });
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
            <h1 className="text-3xl font-bold tracking-tight">robots.txt Generator</h1>
            <p className="text-muted-foreground">
              Generate robots.txt files with user-agent rules, sitemap URLs, and crawl-delay.
            </p>
          </header>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User-Agent Groups</CardTitle>
                <CardDescription>Configure rules for each user-agent.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addGroup}>
                <Plus className="mr-1 h-4 w-4" /> Add Group
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {groups.map((group, gi) => (
                <div key={gi} className="p-4 border rounded-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 items-end flex-1">
                      <div className="space-y-1 flex-1">
                        <Label>User-Agent</Label>
                        <select
                          value={group.userAgent}
                          onChange={(e) => updateUserAgent(gi, e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {commonUserAgents.map((ua) => (
                            <option key={ua} value={ua}>
                              {ua}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 w-32">
                        <Label>Crawl-delay</Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="None"
                          value={group.crawlDelay ?? ''}
                          onChange={(e) => updateCrawlDelay(gi, e.target.value)}
                        />
                      </div>
                    </div>
                    {groups.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGroup(gi)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Path Rules</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => addRule(gi)}>
                        <Plus className="mr-1 h-3 w-3" /> Add Rule
                      </Button>
                    </div>
                    {group.rules.map((rule, ri) => (
                      <div key={ri} className="flex gap-2 items-center">
                        <select
                          value={rule.type}
                          onChange={(e) => updateRule(gi, ri, 'type', e.target.value)}
                          className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="allow">Allow</option>
                          <option value="disallow">Disallow</option>
                        </select>
                        <Input
                          value={rule.path}
                          onChange={(e) => updateRule(gi, ri, 'path', e.target.value)}
                          placeholder="/path/"
                          className="flex-1"
                        />
                        {group.rules.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(gi, ri)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sitemap URLs</CardTitle>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSitemap}>
                <Plus className="mr-1 h-4 w-4" /> Add Sitemap
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {sitemapUrls.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={url}
                    onChange={(e) => updateSitemap(i, e.target.value)}
                    placeholder="https://example.com/sitemap.xml"
                    className="flex-1"
                  />
                  {sitemapUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSitemap(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto whitespace-pre">
                {output}
              </pre>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={downloadFile}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button type="button" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
