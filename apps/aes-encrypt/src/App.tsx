import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { aesDecrypt, aesEncrypt } from "./utils/aes";
import { toast, ToastToaster } from "@/components/ui/toast";

const MODES = ["encrypt", "decrypt"] as const;
type Mode = (typeof MODES)[number];

function App() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("encrypt");
  const [error, setError] = useState("");
  const handleProcess = async () => {
    if (!input || !password) return;
    setError("");
    try {
      if (mode === "encrypt") {
        setOutput(await aesEncrypt(input, password));
      } else {
        setOutput(await aesDecrypt(input, password));
      }
    } catch {
      setError(
        mode === "decrypt"
          ? "Decryption failed. Wrong password or invalid data."
          : "Encryption failed.",
      );
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: "Copied!" });
    } catch {
      toast.add({ title: "Copy failed", type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl">
          <header className="sr-only">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AES Encrypt / Decrypt</h1>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>AES Encrypt / Decrypt</CardTitle>
                <CardDescription>AES-256-GCM encryption with PBKDF2 key derivation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <div className="flex gap-2">
                    {MODES.map((m) => (
                      <Button
                        type="button"
                        key={m}
                        variant={mode === m ? "default" : "outline"}
                        onClick={() => {
                          setMode(m);
                          setOutput("");
                          setError("");
                        }}
                        type="button"
                      >
                        {m === "encrypt" ? "Encrypt" : "Decrypt"}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input">
                    {mode === "encrypt" ? "Plaintext" : "Ciphertext (Base64)"}
                  </Label>
                  <textarea
                    id="input"
                    className="w-full rounded-md border p-3 font-mono text-sm"
                    rows={6}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <Button onClick={handleProcess} disabled={!input || !password} type="button">
                  {mode === "encrypt" ? "Encrypt" : "Decrypt"}
                </Button>
                {error && (
                  <div role="alert" className="rounded-md bg-destructive-subtle p-3 text-sm text-destructive">{error}</div>
                )}
                {output && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Output</Label>
                      <Button variant="outline" size="sm" onClick={handleCopy} type="button">
                        Copy
                      </Button>
                    </div>
                    <textarea
                      className="w-full rounded-md border bg-gray-50 p-3 font-mono text-sm"
                      rows={6}
                      value={output}
                      readOnly
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        
      </div>
  </ToastToaster>;
}

export default App;
