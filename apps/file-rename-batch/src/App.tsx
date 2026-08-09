import { useState, useRef, useMemo } from 'react';
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
import { Upload, Download, Trash2, ArrowRight } from 'lucide-react';
import { applyRename, type RuleType } from '@/utils/rename';
import { toast, ToastToaster } from "@/components/ui/toast";

interface FileEntry {
  file: File;
  originalName: string;
}

function ruleValueLabel(rule: RuleType): string {
  switch (rule) {
    case 'prefix':
      return 'Prefix';
    case 'suffix':
      return 'Suffix';
    case 'replace':
      return 'Replace With';
    case 'numbering':
      return 'Name Prefix';
  }
}

export default function App() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [rule, setRule] = useState<RuleType>('prefix');
  const [ruleValue, setRuleValue] = useState('');
  const [replaceFrom, setReplaceFrom] = useState('');
  const [startNumber, setStartNumber] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    const entries: FileEntry[] = Array.from(uploaded).map((file) => ({
      file,
      originalName: file.name,
    }));
    setFiles((prev) => [...prev, ...entries]);
    toast.add({ title: `${entries.length} file(s) added` });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renamedFiles = useMemo(() => {
    return files.map((entry, index) => ({
      ...entry,
      newName: applyRename(
        entry.originalName,
        index,
        rule,
        ruleValue,
        replaceFrom,
        startNumber,
      ),
    }));
  }, [files, rule, ruleValue, replaceFrom, startNumber]);

  const handleDownload = (entry: FileEntry, newName: string) => {
    const url = URL.createObjectURL(entry.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = newName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    renamedFiles.forEach((entry) => {
      handleDownload(entry, entry.newName);
    });
    toast.add({ title: `${renamedFiles.length} file(s) downloaded` });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
            <h1 className="text-3xl font-bold tracking-tight">File Rename Batch</h1>
            <p className="text-muted-foreground">
              Upload files, apply rename rules, preview new names, and download.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Add Files
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rename Rule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rule Type</Label>
                    <Select value={rule} onValueChange={(v) => setRule(v as RuleType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prefix">Add Prefix</SelectItem>
                        <SelectItem value="suffix">Add Suffix</SelectItem>
                        <SelectItem value="replace">Find & Replace</SelectItem>
                        <SelectItem value="numbering">Sequential Numbering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rule === 'replace' && (
                    <div className="space-y-2">
                      <Label>Find</Label>
                      <Input
                        value={replaceFrom}
                        onChange={(e) => setReplaceFrom(e.target.value)}
                        placeholder="Text to find"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>
                      {ruleValueLabel(rule)}
                    </Label>
                    <Input
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                      placeholder={rule === 'numbering' ? 'e.g. photo_' : 'Enter value'}
                    />
                  </div>

                  {rule === 'numbering' && (
                    <div className="space-y-2">
                      <Label>Start Number</Label>
                      <Input
                        type="number"
                        min={0}
                        value={startNumber}
                        onChange={(e) => setStartNumber(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {files.length > 0 && (
                <Card>
                  <CardContent className="pt-6 space-y-2">
                    <Button type="button" className="w-full" onClick={handleDownloadAll}>
                      <Download className="mr-2 h-4 w-4" /> Download All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setFiles([])}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  Preview ({files.length} file{files.length !== 1 ? 's' : ''})
                </CardTitle>
                <CardDescription>Old name {'->'} new name</CardDescription>
              </CardHeader>
              <CardContent>
                {renamedFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Upload files to see rename preview
                  </p>
                ) : (
                  <div className="space-y-2">
                    {renamedFiles.map((entry, i) => (
                      <div
                        key={`${entry.originalName}-${i}`}
                        className="flex items-center gap-2 p-3 rounded-md bg-muted"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs font-mono text-muted-foreground truncate">
                              {entry.originalName}
                            </code>
                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            <code className="text-xs font-mono font-semibold text-primary truncate">
                              {entry.newName}
                            </code>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(entry, entry.newName)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(i)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
