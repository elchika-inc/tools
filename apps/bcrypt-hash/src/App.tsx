import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { generateHash, verifyHash } from "./utils/bcryptHash";
import { toast, ToastToaster } from "@/components/ui/toast";

function App() {
  const [password, setPassword] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hashOutput, setHashOutput] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyHashInput, setVerifyHashInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const handleGenerate = async () => {
    if (!password) return;
    try {
      const hash = await generateHash(password, rounds);
      setHashOutput(hash);
    } catch (e) {
      toast.add({ title: String(e), type: "error" });
    }
  };

  const handleVerify = async () => {
    if (!verifyPassword || !verifyHashInput) return;
    try {
      const result = await verifyHash(verifyPassword, verifyHashInput);
      setVerifyResult(result);
    } catch {
      setVerifyResult(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hashOutput);
      toast.add({ title: "Copied!" });
    } catch {
      toast.add({ title: "Copy failed", type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          <header className="sr-only">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Bcrypt Hash Generator</h1>
          </header>
          <main>
            <Card>
              <CardHeader>
                <CardTitle>Bcrypt Hash Generator</CardTitle>
                <CardDescription>Generate bcrypt password hashes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rounds">Rounds (cost factor)</Label>
                  <Input
                    id="rounds"
                    type="number"
                    min={4}
                    max={16}
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                  />
                </div>
                <Button onClick={handleGenerate} disabled={!password} type="button">
                  Generate Hash
                </Button>
                {hashOutput && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Hash</Label>
                      <Button variant="outline" size="sm" onClick={handleCopy} type="button">
                        Copy
                      </Button>
                    </div>
                    <div className="rounded-md border bg-gray-50 p-3 font-mono text-sm break-all">
                      {hashOutput}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bcrypt Verify</CardTitle>
                <CardDescription>Check if a password matches a hash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-password">Password</Label>
                  <Input
                    id="verify-password"
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    placeholder="Enter password..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-hash">Hash</Label>
                  <Input
                    id="verify-hash"
                    value={verifyHashInput}
                    onChange={(e) => setVerifyHashInput(e.target.value)}
                    placeholder="$2b$10$..."
                  />
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={!verifyPassword || !verifyHashInput}
                  type="button"
                >
                  Verify
                </Button>
                {verifyResult !== null && (
                  <div
                    role="alert"
                    className={`rounded-md p-3 text-sm font-medium ${verifyResult ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {verifyResult
                      ? "Match! Password is correct."
                      : "No match. Password is incorrect."}
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
