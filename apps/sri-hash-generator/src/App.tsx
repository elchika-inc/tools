import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  generateSriHashFromText,
  generateSriHash,
  generateScriptTag,
  generateLinkTag,
  readFileAsArrayBuffer,
} from '@/utils/sriHash';
import type { SriAlgorithm } from '@/utils/sriHash';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [inputText, setInputText] = useState('');
  const [algorithm, setAlgorithm] = useState<SriAlgorithm>('sha384');
  const [sriHash, setSriHash] = useState('');
  const [resourceUrl, setResourceUrl] = useState('https://cdn.example.com/lib.js');
  const [tagType, setTagType] = useState<'script' | 'link'>('script');
  const [fileName, setFileName] = useState('');
  const handleGenerate = useCallback(async () => {
    if (!inputText) {
      toast.add({ title: 'Please enter text or upload a file', type: "error" });
      return;
    }
    try {
      const hash = await generateSriHashFromText(inputText, algorithm);
      setSriHash(hash);
    } catch {
      toast.add({ title: 'Failed to generate hash', type: "error" });
    }
  }, [inputText, algorithm, toast]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      try {
        const buffer = await readFileAsArrayBuffer(file);
        const hash = await generateSriHash(buffer, algorithm);
        setSriHash(hash);
        setInputText('');

        // Guess tag type from file extension
        if (file.name.endsWith('.css')) {
          setTagType('link');
        } else {
          setTagType('script');
        }
      } catch {
        toast.add({ title: 'Failed to read file', type: "error" });
      }
    },
    [algorithm, toast]
  );

  const htmlSnippet = sriHash
    ? tagType === 'script'
      ? generateScriptTag(resourceUrl, sriHash)
      : generateLinkTag(resourceUrl, sriHash)
    : '';

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(sriHash);
      toast.add({ title: 'Hash copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(htmlSnippet);
      toast.add({ title: 'HTML snippet copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <main className="mx-auto max-w-5xl space-y-4">
          <Card>
            <CardHeader>
              <header>
                <div className="mb-2">
                  <a href="/" className="text-sm text-primary hover:underline">
                    ← Tools トップに戻る
                  </a>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">SRI Hash Generator</h1>
                <p className="mt-2 text-sm text-muted-foreground">Generate Subresource Integrity hashes for script and stylesheet tags</p>
              </header>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Algorithm Selector */}
              <div className="space-y-2">
                <Label>Hash Algorithm</Label>
                <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as SriAlgorithm)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sha256">SHA-256</SelectItem>
                    <SelectItem value="sha384">SHA-384 (Recommended)</SelectItem>
                    <SelectItem value="sha512">SHA-512</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <Label htmlFor="input-text">Content (paste text or code)</Label>
                <textarea
                  id="input-text"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring font-mono"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setFileName('');
                  }}
                  placeholder="Paste JavaScript, CSS, or any file content here..."
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Or upload a file</Label>
                <Input id="file-upload" type="file" onChange={handleFileUpload} />
                {fileName && (
                  <p className="text-sm text-muted-foreground">File: {fileName}</p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={!inputText && !fileName}
                className="w-full"
              >
                Generate Hash
              </Button>

              {/* Results */}
              {sriHash && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Integrity Hash</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleCopyHash}>
                        Copy
                      </Button>
                    </div>
                    <div className="rounded-md border bg-gray-50 p-3 font-mono text-sm break-all">
                      {sriHash}
                    </div>
                  </div>

                  {/* HTML Snippet */}
                  <div className="space-y-3">
                    <Label>HTML Snippet</Label>
                    <div className="flex gap-2">
                      <Select value={tagType} onValueChange={(v) => setTagType(v as 'script' | 'link')}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="script">{'<script>'}</SelectItem>
                          <SelectItem value="link">{'<link>'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        placeholder="Resource URL"
                      />
                    </div>
                    <div className="rounded-md border bg-gray-50 p-3 font-mono text-xs break-all">
                      {htmlSnippet}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleCopySnippet}>
                      Copy HTML Snippet
                    </Button>
                  </div>
                </>
              )}

              {/* Info */}
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>SRI</strong> (Subresource Integrity) allows browsers to verify that
                  fetched resources have not been tampered with. Uses Web Crypto API for hashing.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
