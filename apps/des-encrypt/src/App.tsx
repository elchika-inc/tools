import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { aesDecrypt, aesEncrypt, desDecrypt, desEncrypt } from "./utils/des";
import { toast, ToastToaster } from "@/components/ui/toast";

const MODES = ["encrypt", "decrypt"] as const;
type Mode = (typeof MODES)[number];
type Algorithm = "aes-256" | "3des";

function App() {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("encrypt");
  const [algorithm, setAlgorithm] = useState<Algorithm>("aes-256");
  const [error, setError] = useState("");
  const handleProcess = async () => {
    if (!input || !key) return;
    setError("");
    try {
      if (algorithm === "aes-256") {
        const result =
          mode === "encrypt" ? await aesEncrypt(input, key) : await aesDecrypt(input, key);
        setOutput(result);
      } else {
        setOutput(mode === "encrypt" ? desEncrypt(input, key) : desDecrypt(input, key));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(
        mode === "decrypt" ? `Decryption failed: ${message}` : `Encryption failed: ${message}`,
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
            <h1>DES Encrypt / Decrypt</h1>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>DES Encrypt / Decrypt</CardTitle>
                <CardDescription>Triple DES (3DES) encryption/decryption</CardDescription>
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
                  <Label>Algorithm</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={algorithm === "aes-256" ? "default" : "outline"}
                      onClick={() => {
                        setAlgorithm("aes-256");
                        setOutput("");
                        setError("");
                      }}
                      type="button"
                    >
                      AES-256-GCM
                    </Button>
                    <Button
                      type="button"
                      variant={algorithm === "3des" ? "default" : "outline"}
                      onClick={() => {
                        setAlgorithm("3des");
                        setOutput("");
                        setError("");
                      }}
                      type="button"
                    >
                      3DES (Legacy)
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter key..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input">{mode === "encrypt" ? "Plaintext" : "Ciphertext"}</Label>
                  <textarea
                    id="input"
                    className="w-full rounded-md border p-3 font-mono text-sm"
                    rows={6}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <Button onClick={handleProcess} disabled={!input || !key} type="button">
                  {mode === "encrypt" ? "Encrypt" : "Decrypt"}
                </Button>
                {error && (
                  <div role="alert" className="rounded-md bg-red-100 p-3 text-sm text-red-800">{error}</div>
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
