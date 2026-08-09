import { Download, Lock, Trash2, Unlock, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { decryptPdf, downloadFile, encryptPdf, formatFileSize } from '@/utils/pdfPassword';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  // Encrypt state
  const [encryptFile, setEncryptFile] = useState<File | null>(null);
  const [encryptPassword, setEncryptPassword] = useState('');
  const [encryptConfirm, setEncryptConfirm] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [encryptedData, setEncryptedData] = useState<Uint8Array | null>(null);
  const encryptInputRef = useRef<HTMLInputElement>(null);

  // Decrypt state
  const [decryptFile, setDecryptFile] = useState<File | null>(null);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedData, setDecryptedData] = useState<Uint8Array | null>(null);
  const decryptInputRef = useRef<HTMLInputElement>(null);
  const handleEncrypt = async () => {
    if (!encryptFile) return;
    if (encryptPassword !== encryptConfirm) {
      toast.add({ title: 'Passwords do not match', type: "error" });
      return;
    }
    if (encryptPassword.length === 0) {
      toast.add({ title: 'Please enter a password', type: "error" });
      return;
    }

    setEncrypting(true);
    try {
      const result = await encryptPdf(encryptFile, encryptPassword);
      setEncryptedData(result);
      toast.add({ title: 'PDF encrypted successfully' });
    } catch {
      toast.add({ title: 'Encryption failed', type: "error" });
    } finally {
      setEncrypting(false);
    }
  };

  const handleDownloadEncrypted = () => {
    if (!encryptedData || !encryptFile) return;
    const baseName = encryptFile.name.replace(/\.pdf$/i, '');
    downloadFile(encryptedData, `${baseName}.encrypted`, 'application/octet-stream');
    toast.add({ title: 'Encrypted file downloaded' });
  };

  const handleDecrypt = async () => {
    if (!decryptFile) return;
    if (decryptPassword.length === 0) {
      toast.add({ title: 'Please enter a password', type: "error" });
      return;
    }

    setDecrypting(true);
    try {
      const result = await decryptPdf(decryptFile, decryptPassword);
      setDecryptedData(result);
      toast.add({ title: 'PDF decrypted successfully' });
    } catch {
      toast.add({
        title: 'Decryption failed',
        description: 'Wrong password or invalid file',
        type: "error",
      });
    } finally {
      setDecrypting(false);
    }
  };

  const handleDownloadDecrypted = () => {
    if (!decryptedData || !decryptFile) return;
    const baseName = decryptFile.name.replace(/\.encrypted$/i, '');
    downloadFile(decryptedData, `${baseName}.pdf`, 'application/pdf');
    toast.add({ title: 'Decrypted PDF downloaded' });
  };

  const clearEncrypt = () => {
    setEncryptFile(null);
    setEncryptPassword('');
    setEncryptConfirm('');
    setEncryptedData(null);
    if (encryptInputRef.current) {
      encryptInputRef.current.value = '';
    }
  };

  const clearDecrypt = () => {
    setDecryptFile(null);
    setDecryptPassword('');
    setDecryptedData(null);
    if (decryptInputRef.current) {
      decryptInputRef.current.value = '';
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">PDF Password Protection</h1>
            <p className="text-muted-foreground">
              Encrypt and decrypt PDF files using AES-256-GCM encryption. All processing happens in
              your browser.
            </p>
          </header>

          <main className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Encrypt Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Encrypt PDF
                </CardTitle>
                <CardDescription>Upload a PDF and set a password to encrypt it.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="encrypt-file">PDF File</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={encryptInputRef}
                      id="encrypt-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        setEncryptFile(e.target.files?.[0] ?? null);
                        setEncryptedData(null);
                      }}
                    />
                  </div>
                  {encryptFile && (
                    <p className="text-xs text-muted-foreground">
                      {encryptFile.name} ({formatFileSize(encryptFile.size)})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encrypt-password">Password</Label>
                  <Input
                    id="encrypt-password"
                    type="password"
                    placeholder="Enter password"
                    value={encryptPassword}
                    onChange={(e) => setEncryptPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encrypt-confirm">Confirm Password</Label>
                  <Input
                    id="encrypt-confirm"
                    type="password"
                    placeholder="Confirm password"
                    value={encryptConfirm}
                    onChange={(e) => setEncryptConfirm(e.target.value)}
                  />
                  {encryptPassword && encryptConfirm && encryptPassword !== encryptConfirm && (
                    <p role="alert" className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={handleEncrypt}
                    disabled={
                      !encryptFile ||
                      !encryptPassword ||
                      encryptPassword !== encryptConfirm ||
                      encrypting
                    }
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {encrypting ? 'Encrypting...' : 'Encrypt'}
                  </Button>
                  <Button type="button" variant="outline" aria-label="Clear encrypt form" onClick={clearEncrypt}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {encryptedData && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Encrypted size: {formatFileSize(encryptedData.byteLength)}
                    </p>
                    <Button type="button" onClick={handleDownloadEncrypted} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Encrypted File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Decrypt Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="h-5 w-5" />
                  Decrypt PDF
                </CardTitle>
                <CardDescription>
                  Upload an encrypted file and enter the password to decrypt.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="decrypt-file">Encrypted File</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={decryptInputRef}
                      id="decrypt-file"
                      type="file"
                      accept=".encrypted"
                      onChange={(e) => {
                        setDecryptFile(e.target.files?.[0] ?? null);
                        setDecryptedData(null);
                      }}
                    />
                  </div>
                  {decryptFile && (
                    <p className="text-xs text-muted-foreground">
                      {decryptFile.name} ({formatFileSize(decryptFile.size)})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decrypt-password">Password</Label>
                  <Input
                    id="decrypt-password"
                    type="password"
                    placeholder="Enter password"
                    value={decryptPassword}
                    onChange={(e) => setDecryptPassword(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={handleDecrypt}
                    disabled={!decryptFile || !decryptPassword || decrypting}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {decrypting ? 'Decrypting...' : 'Decrypt'}
                  </Button>
                  <Button type="button" variant="outline" aria-label="Clear decrypt form" onClick={clearDecrypt}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {decryptedData && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Decrypted size: {formatFileSize(decryptedData.byteLength)}
                    </p>
                    <Button type="button" onClick={handleDownloadDecrypted} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Decrypted PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        </div>

      </div>
  </ToastToaster>;
}
