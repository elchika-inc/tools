import { ArrowRight, Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  binaryToText,
  decimalToText,
  hexToText,
  textToBinary,
  textToDecimal,
  textToHex,
} from "@/utils/binary";
import { toast, ToastToaster } from "@/components/ui/toast";

const FORMAT_OPTIONS = [
  { value: "binary", label: "Binary (2進)", encode: textToBinary, decode: binaryToText },
  { value: "hex", label: "Hex (16進)", encode: textToHex, decode: hexToText },
  { value: "decimal", label: "Decimal (10進)", encode: textToDecimal, decode: decimalToText },
] as const;

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [formatIdx, setFormatIdx] = useState(0);
  const fmt = FORMAT_OPTIONS[formatIdx];

  const handleEncode = () => {
    try {
      setOutput(fmt.encode(input));
      toast.add({ title: "Encoded successfully" });
    } catch {
      toast.add({ title: "Encoding failed", type: "error" });
    }
  };

  const handleDecode = () => {
    try {
      setOutput(fmt.decode(input));
      toast.add({ title: "Decoded successfully" });
    } catch {
      toast.add({ title: "Decoding failed", type: "error" });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.add({ title: "Copied to clipboard" });
    } catch {
      toast.add({ title: "コピーに失敗しました", type: "error" });
    }
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Binary / Hex / Decimal Converter</h1>
            <p className="text-muted-foreground">
              テキストとバイナリ/16進/10進の相互変換を行います。
            </p>
          </header>

          <div className="flex gap-2">
            {FORMAT_OPTIONS.map((opt, i) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setFormatIdx(i)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formatIdx === i ? "bg-primary text-primary-foreground" : "hover:bg-muted border"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Converter</CardTitle>
              <CardDescription>テキストまたはコードを入力してください。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr] items-start">
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <textarea
                    id="input"
                    className="flex min-h-[250px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Text or binary/hex/decimal..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-4 justify-center pt-10">
                  <Button type="button" onClick={handleEncode} disabled={!input}>
                    Text to {fmt.label.split(" ")[0]} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button type="button" onClick={handleDecode} variant="secondary" disabled={!input}>
                    {fmt.label.split(" ")[0]} to Text <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <textarea
                    id="output"
                    readOnly
                    className="flex min-h-[250px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    placeholder="Result..."
                    value={output}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setInput("");
                    setOutput("");
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button type="button" onClick={copyToClipboard} disabled={!output}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

      </div>
  </ToastToaster>;
}
