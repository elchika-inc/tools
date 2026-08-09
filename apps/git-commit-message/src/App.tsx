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
import { Copy, AlertTriangle } from 'lucide-react';
import {
  buildMessage,
  validateDescription,
  validateScope,
  COMMIT_TYPES,
  type CommitType,
} from '@/utils/commitMessage';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [type, setType] = useState<CommitType>('feat');
  const [scope, setScope] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [breaking, setBreaking] = useState(false);
  const message = buildMessage({ type, scope, description, body, footer, breaking });
  const descError = description ? validateDescription(description) : null;
  const scopeError = scope ? validateScope(scope) : null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleReset = () => {
    setType('feat');
    setScope('');
    setDescription('');
    setBody('');
    setFooter('');
    setBreaking(false);
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
            <h1 className="text-3xl font-bold tracking-tight">Git Commit Message Builder</h1>
            <p className="text-muted-foreground">
              Build Conventional Commits messages with validation and preview.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Message Builder</CardTitle>
                <CardDescription>Configure your commit message components.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as CommitType)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMIT_TYPES.map((ct) => (
                        <SelectItem key={ct.value} value={ct.value}>
                          <span className="font-mono font-medium">{ct.label}</span>
                          <span className="ml-2 text-muted-foreground text-xs">
                            - {ct.description}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope">Scope (optional)</Label>
                  <Input
                    id="scope"
                    placeholder="e.g., parser, api, ui"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  />
                  {scopeError && (
                    <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertTriangle className="h-3 w-3" />
                      {scopeError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g., add user authentication"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {descError && (
                    <p className="text-sm text-destructive flex items-center gap-1" role="alert">
                      <AlertTriangle className="h-3 w-3" />
                      {descError}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{description.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Body (optional)</Label>
                  <textarea
                    id="body"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    placeholder="Longer description of the change..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer">Footer (optional)</Label>
                  <Input
                    id="footer"
                    placeholder="e.g., Closes #123"
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="breaking"
                    checked={breaking}
                    onChange={(e) => setBreaking(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="breaking" className="cursor-pointer">
                    Breaking Change
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Generated commit message.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="min-h-[200px] rounded-md border bg-muted p-4 text-sm font-mono whitespace-pre-wrap break-words">
                  {message || 'Enter a description to generate a message...'}
                </pre>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={copyToClipboard}
                    disabled={!message}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Message
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
  </ToastToaster>;
}
