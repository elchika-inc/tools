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
import { Copy, Download, Plus, Trash2 } from 'lucide-react';
import {
  generateChangelog,
  createEmptyVersion,
  createEmptyEntry,
  CATEGORIES,
  type VersionRelease,
  type ChangeCategory,
} from '@/utils/changelogGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [versions, setVersions] = useState<VersionRelease[]>([createEmptyVersion()]);
  const [projectName, setProjectName] = useState('');
  const output = useMemo(
    () => generateChangelog(versions, projectName || undefined),
    [versions, projectName]
  );

  const addVersion = () => {
    setVersions((prev) => [createEmptyVersion(), ...prev]);
  };

  const removeVersion = (versionId: string) => {
    setVersions((prev) => prev.filter((v) => v.id !== versionId));
  };

  const updateVersion = (versionId: string, field: 'version' | 'date', value: string) => {
    setVersions((prev) =>
      prev.map((v) => (v.id === versionId ? { ...v, [field]: value } : v))
    );
  };

  const addEntry = (versionId: string) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === versionId
          ? { ...v, entries: [...v.entries, createEmptyEntry()] }
          : v
      )
    );
  };

  const updateEntry = (
    versionId: string,
    entryId: string,
    field: 'category' | 'description',
    value: string
  ) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === versionId
          ? {
              ...v,
              entries: v.entries.map((e) =>
                e.id === entryId ? { ...e, [field]: value } : e
              ),
            }
          : v
      )
    );
  };

  const removeEntry = (versionId: string, entryId: string) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === versionId
          ? { ...v, entries: v.entries.filter((e) => e.id !== entryId) }
          : v
      )
    );
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
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CHANGELOG.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.add({ title: 'Downloaded CHANGELOG.md' });
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
            <h1 className="text-3xl font-bold tracking-tight">Changelog Generator</h1>
            <p className="text-muted-foreground">
              Generate CHANGELOG.md in Keep a Changelog format.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name (optional)</Label>
                    <Input
                      id="project-name"
                      placeholder="My Project"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Versions</h2>
                <Button type="button" variant="outline" size="sm" onClick={addVersion}>
                  <Plus className="mr-1 h-3 w-3" /> Add Version
                </Button>
              </div>

              {versions.map((version) => (
                <Card key={version.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {version.version || 'Unreleased'}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVersion(version.id)}
                        disabled={versions.length === 1}
                        aria-label="Remove version"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Version</Label>
                        <Input
                          placeholder="1.0.0"
                          value={version.version}
                          onChange={(e) =>
                            updateVersion(version.id, 'version', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={version.date}
                          onChange={(e) =>
                            updateVersion(version.id, 'date', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Entries</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addEntry(version.id)}
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add Entry
                        </Button>
                      </div>

                      {version.entries.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No entries. Click "Add Entry" to add changes.
                        </p>
                      )}

                      {version.entries.map((entry) => (
                        <div key={entry.id} className="flex gap-2 items-start">
                          <Select
                            value={entry.category}
                            onValueChange={(v) =>
                              updateEntry(
                                version.id,
                                entry.id,
                                'category',
                                v as ChangeCategory
                              )
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            className="flex-1"
                            placeholder="Description of change..."
                            value={entry.description}
                            onChange={(e) =>
                              updateEntry(
                                version.id,
                                entry.id,
                                'description',
                                e.target.value
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEntry(version.id, entry.id)}
                            aria-label="Remove entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Generated CHANGELOG.md content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="min-h-[500px] max-h-[700px] overflow-auto rounded-md border bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
                  {output}
                </pre>

                <div className="flex gap-2">
                  <Button type="button" onClick={copyToClipboard} className="flex-1">
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={downloadFile}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
      </div>
  </ToastToaster>;
}
