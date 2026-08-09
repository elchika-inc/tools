import { Copy, KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateHtpasswd, HASH_TYPES, type HashType } from '@/utils/htpasswd';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hashType, setHashType] = useState<HashType>('bcrypt');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerate = async () => {
    if (!username || !password) {
      toast.add({ title: 'Username and password are required', type: "error" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateHtpasswd(username, password, hashType);
      setOutput(result);
      toast.add({ title: 'Generated successfully' });
    } catch {
      toast.add({ title: 'Generation failed', type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Failed to copy', type: "error" });
    }
  };

  const clearAll = () => {
    setUsername('');
    setPassword('');
    setOutput('');
  };

  const hashTypeLabels: Record<HashType, string> = {
    bcrypt: 'bcrypt (recommended)',
    sha1: 'SHA-1',
    md5: 'MD5 (SHA-256)',
    plain: 'Plain text',
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">.htpasswd Generator</h1>
            <p className="text-muted-foreground">
              Generate .htpasswd entries for Apache/Nginx basic authentication.
            </p>
          </header>

          <main>
          <Card>
            <CardHeader>
              <CardTitle>Generator</CardTitle>
              <CardDescription>
                Enter username and password to generate a .htpasswd entry.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashType">Hash Type</Label>
                <Select value={hashType} onValueChange={(value: HashType) => setHashType(value)}>
                  <SelectTrigger id="hashType">
                    <SelectValue placeholder="Select hash type" />
                  </SelectTrigger>
                  <SelectContent>
                    {HASH_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {hashTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={!username || !password || isGenerating}
                className="w-full"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>

              {output && (
                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    value={output}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button type="button" onClick={copyToClipboard} disabled={!output}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Result
                </Button>
              </div>
            </CardContent>
          </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
