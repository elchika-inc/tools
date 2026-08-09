import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateTOTP, generateSecret, getRemainingSeconds, buildOtpAuthUri } from '@/utils/totp';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('------');
  const [remaining, setRemaining] = useState(30);
  const [error, setError] = useState('');
  const updateCode = useCallback(async () => {
    if (!secret.trim()) {
      setCode('------');
      return;
    }
    try {
      const totp = await generateTOTP(secret.trim());
      setCode(totp);
      setError('');
    } catch {
      setCode('------');
      setError('Invalid secret key. Please enter a valid base32 string.');
    }
  }, [secret]);

  useEffect(() => {
    updateCode();
  }, [updateCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getRemainingSeconds(30);
      setRemaining(r);
      if (r === 30) {
        updateCode();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [updateCode]);

  const handleGenerateSecret = () => {
    const newSecret = generateSecret();
    setSecret(newSecret);
    setError('');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.add({ title: 'Code copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      toast.add({ title: 'Secret copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const handleCopyUri = async () => {
    try {
      const uri = buildOtpAuthUri(secret.trim());
      await navigator.clipboard.writeText(uri);
      toast.add({ title: 'OTP Auth URI copied!' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const progressPercent = ((30 - remaining) / 30) * 100;

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <main className="mx-auto max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <header>
                <div className="mb-2">
                  <a href="/" className="text-sm text-primary hover:underline">
                    ← Tools トップに戻る
                  </a>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">TOTP Generator</h1>
                <p className="mt-2 text-sm text-muted-foreground">Generate Time-based One-Time Passwords (RFC 6238)</p>
              </header>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Secret Input */}
              <div className="space-y-2">
                <Label htmlFor="secret">Secret Key (Base32)</Label>
                <div className="flex gap-2">
                  <Input
                    id="secret"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="e.g. JBSWY3DPEHPK3PXP"
                    className="font-mono"
                  />
                  <Button type="button" variant="outline" onClick={handleGenerateSecret}>
                    Generate
                  </Button>
                </div>
                {secret && (
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={handleCopySecret}>
                      Copy Secret
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleCopyUri}>
                      Copy OTP Auth URI
                    </Button>
                  </div>
                )}
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              </div>

              {/* TOTP Code Display */}
              <div className="space-y-3">
                <Label>Current Code</Label>
                <div
                  className="flex items-center justify-center rounded-lg border bg-white p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={code !== '------' ? handleCopyCode : undefined}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && code !== '------') {
                      handleCopyCode();
                    }
                  }}
                >
                  <span className="text-5xl font-mono font-bold tracking-[0.5em] text-foreground">
                    {code.slice(0, 3)} {code.slice(3)}
                  </span>
                </div>
                {code !== '------' && (
                  <p className="text-center text-xs text-muted-foreground">Click code to copy</p>
                )}
              </div>

              {/* Countdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Time Remaining</Label>
                  <span
                    className={`text-sm font-semibold ${
                      remaining <= 5 ? 'text-red-500' : 'text-foreground'
                    }`}
                  >
                    {remaining}s
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      remaining <= 5 ? 'bg-red-500' : 'bg-primary'
                    }`}
                    style={{ width: `${100 - progressPercent}%` }}
                  />
                </div>
              </div>

              {/* OTP Auth URI */}
              {secret.trim() && !error && (
                <div className="space-y-2">
                  <Label>OTP Auth URI</Label>
                  <div className="rounded-md border bg-gray-50 p-3 font-mono text-xs break-all text-muted-foreground">
                    {buildOtpAuthUri(secret.trim())}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Algorithm:</strong> SHA-1 HMAC | <strong>Digits:</strong> 6 |{' '}
                  <strong>Period:</strong> 30 seconds
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  All computation is done locally in your browser. No data is sent to any server.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        
      </div>
  </ToastToaster>;
}
