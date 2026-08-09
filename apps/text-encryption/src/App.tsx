import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Lock, Unlock, Trash2 } from 'lucide-react';
import { encrypt, decrypt } from '@/utils/textEncryption';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const handleEncrypt = async () => {
    if (!input.trim() || !passphrase) {
      toast.add({ title: 'Text and passphrase are required', type: "error" });
      return;
    }
    setIsProcessing(true);
    try {
      const encrypted = await encrypt(input, passphrase);
      setOutput(encrypted);
      toast.add({ title: 'Text encrypted successfully' });
    } catch (e) {
      toast.add({
        title: 'Encryption failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!input.trim() || !passphrase) {
      toast.add({ title: 'Encrypted text and passphrase are required', type: "error" });
      return;
    }
    setIsProcessing(true);
    try {
      const decrypted = await decrypt(input, passphrase);
      setOutput(decrypted);
      toast.add({ title: 'Text decrypted successfully' });
    } catch (e) {
      toast.add({
        title: 'Decryption failed',
        description: e instanceof Error ? e.message : 'Wrong passphrase or corrupted data',
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: 'Copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
    setPassphrase('');
    setOutput('');
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Text Encryption</h1>
            <p className="text-muted-foreground">
              Encrypt and decrypt text with a passphrase using AES-GCM (Web Crypto API).
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>
                Enter text to encrypt, or paste encrypted text to decrypt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">Text</Label>
                <textarea
                  id="input"
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none font-mono"
                  placeholder="Enter text to encrypt or encrypted text to decrypt..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passphrase">Passphrase</Label>
                <Input
                  id="passphrase"
                  type="password"
                  placeholder="Enter passphrase..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleEncrypt}
                  disabled={!input.trim() || !passphrase || isProcessing}
                >
                  <Lock className="mr-2 h-4 w-4" /> Encrypt
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDecrypt}
                  disabled={!input.trim() || !passphrase || isProcessing}
                >
                  <Unlock className="mr-2 h-4 w-4" /> Decrypt
                </Button>
                <Button type="button" variant="outline" onClick={clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {output && (
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  readOnly
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none font-mono"
                  value={output}
                />
                <div className="flex justify-end">
                  <Button type="button" onClick={copyOutput}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

      </div>
  </ToastToaster>;
}
