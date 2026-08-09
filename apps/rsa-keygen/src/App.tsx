import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { generateRsaKeyPair, type KeySize, type RsaKeyPair } from "./utils/rsa";
import { toast, ToastToaster } from "@/components/ui/toast";

const KEY_SIZES = [1024, 2048, 4096] as const;

function App() {
  const [keySize, setKeySize] = useState<KeySize>(2048);
  const [keyPair, setKeyPair] = useState<RsaKeyPair | null>(null);
  const [generating, setGenerating] = useState(false);
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateRsaKeyPair(keySize);
      setKeyPair(result);
    } catch {
      toast.add({ title: "Generation failed", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.add({ title: `${label} copied!` });
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
            <h1 className="text-3xl font-bold tracking-tight">RSA Key Pair Generator</h1>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>RSA Key Pair Generator</CardTitle>
                <CardDescription>Generate RSA public/private key pairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Key Size</Label>
                  <div className="flex gap-2">
                    {KEY_SIZES.map((size) => (
                      <Button
                        type="button"
                        key={size}
                        variant={keySize === size ? "default" : "outline"}
                        onClick={() => setKeySize(size)}
                        type="button"
                      >
                        {size} bit
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleGenerate} disabled={generating} type="button">
                  {generating ? "Generating..." : "Generate Key Pair"}
                </Button>
                {keyPair && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="public-key">Public Key</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(keyPair.publicKey, "Public key")}
                          type="button"
                        >
                          Copy
                        </Button>
                      </div>
                      <textarea
                        id="public-key"
                        className="w-full rounded-md border bg-gray-50 p-3 font-mono text-xs"
                        rows={8}
                        value={keyPair.publicKey}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="private-key">Private Key</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(keyPair.privateKey, "Private key")}
                          type="button"
                        >
                          Copy
                        </Button>
                      </div>
                      <textarea
                        id="private-key"
                        className="w-full rounded-md border bg-gray-50 p-3 font-mono text-xs"
                        rows={12}
                        value={keyPair.privateKey}
                        readOnly
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

      </div>
  </ToastToaster>;
}

export default App;
