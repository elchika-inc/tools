import { useMemo, useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { uudecode, uuencode } from "./utils/uuencode";
import { toast, ToastToaster } from "@/components/ui/toast";

const MODES = ["encode", "decode"] as const;
type Mode = (typeof MODES)[number];

function App() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const output = useMemo(() => {
    if (!input) return "";
    try {
      return mode === "encode" ? uuencode(input) : uudecode(input);
    } catch {
      return "Error: Invalid input";
    }
  }, [input, mode]);

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
        <main className="mx-auto max-w-5xl">
          <header className="mb-4">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">UUEncode / UUDecode</h1>
            <p className="text-muted-foreground">UU encoding/decoding for text data</p>
          </header>
          <Card>
            <CardHeader>
              <CardTitle>Converter</CardTitle>
              <CardDescription>Select mode and enter text to encode or decode.</CardDescription>
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
                      onClick={() => setMode(m)}
                      type="button"
                    >
                      {m === "encode" ? "Encode" : "Decode"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="input">Input</Label>
                <textarea
                  id="input"
                  className="w-full rounded-md border p-3 font-mono text-sm"
                  rows={6}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === "encode" ? "Enter text to encode..." : "Enter UU-encoded text..."
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="output">Output</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!output}
                    type="button"
                  >
                    Copy
                  </Button>
                </div>
                <textarea
                  id="output"
                  className="w-full rounded-md border bg-gray-50 p-3 font-mono text-sm"
                  rows={6}
                  value={output}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}

export default App;
