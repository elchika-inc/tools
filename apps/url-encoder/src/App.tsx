import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Trash2, ArrowRight } from "lucide-react";
import { ToastToaster, toast } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleEncode = () => {
    try {
      setOutput(encodeURIComponent(input));
      toast.add({ title: "Encoded successfully", type: "success" });
    } catch {
      toast.add({ title: "Encoding failed", type: "error" });
    }
  };

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input));
      toast.add({ title: "Decoded successfully", type: "success" });
    } catch {
      toast.add({
        title: "Decoding failed",
        description: "Invalid URL sequence",
        type: "error",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: "Copied to clipboard", type: "success" });
    } catch {
      toast.add({ title: "Copy failed", type: "error" });
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToastToaster>
      <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">URL Encoder / Decoder</h1>
            <p className="text-muted-foreground">
              Encode or decode URL components safely and easily.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Converter</CardTitle>
              <CardDescription>Enter text to encode or decode.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-start">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Enter text here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-4 justify-center pt-10">
                  <Button type="button" onClick={handleEncode} disabled={!input}>
                    Encode <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDecode}
                    variant="secondary"
                    disabled={!input}
                  >
                    Decode <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[300px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Result will appear here..."
                    value={output}
                  />
                </div>
              </div>

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
    </ToastToaster>
  );
}
