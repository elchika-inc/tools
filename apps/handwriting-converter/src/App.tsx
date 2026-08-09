import { Download, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_OPTIONS, type HandwritingOptions, renderHandwriting } from "@/utils/handwriting";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [text, setText] = useState("Hello, World!\nThis is handwriting style.");
  const [options, setOptions] = useState<HandwritingOptions>(DEFAULT_OPTIONS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;
    renderHandwriting(canvas, text, options);
  }, [text, options]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  const handleRegenerate = () => {
    updateCanvas();
    toast.add({ title: "Regenerated with new random variations" });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "handwriting.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.add({ title: "Image downloaded" });
  };

  const handleClear = () => {
    setText("");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 400;
        canvas.height = 200;
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.add({ title: "Image copied to clipboard" });
      }
    } catch {
      toast.add({ title: "Failed to copy image", type: "error" });
    }
  };

  const updateOption = <K extends keyof HandwritingOptions>(
    key: K,
    value: HandwritingOptions[K],
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Handwriting Converter</h1>
            <p className="text-muted-foreground">
              Convert text to handwriting-style images with natural variations.
            </p>
          </header>

          <main>
            <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Text Input</CardTitle>
                    <CardDescription>Enter text to convert to handwriting style.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      id="text-input"
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Enter text here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Options</CardTitle>
                    <CardDescription>Customize the handwriting appearance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fontSize">Font Size: {options.fontSize}px</Label>
                        <Input
                          id="fontSize"
                          type="range"
                          min="12"
                          max="72"
                          value={options.fontSize}
                          onChange={(e) => updateOption("fontSize", Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wobble">Wobble: {options.wobble}</Label>
                        <Input
                          id="wobble"
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={options.wobble}
                          onChange={(e) => updateOption("wobble", Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lineHeight">Line Height: {options.lineHeight}</Label>
                        <Input
                          id="lineHeight"
                          type="range"
                          min="1.0"
                          max="3.0"
                          step="0.1"
                          value={options.lineHeight}
                          onChange={(e) => updateOption("lineHeight", Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <select
                          id="fontFamily"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={options.fontFamily}
                          onChange={(e) => updateOption("fontFamily", e.target.value)}
                        >
                          <option value="cursive">Cursive</option>
                          <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                          <option value="'Segoe Script', cursive">Segoe Script</option>
                          <option value="fantasy">Fantasy</option>
                          <option value="serif">Serif</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="color">Text Color</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            id="color"
                            type="color"
                            value={options.color}
                            onChange={(e) => updateOption("color", e.target.value)}
                            className="h-10 w-14 rounded-md border border-input cursor-pointer"
                          />
                          <span className="text-sm text-muted-foreground">{options.color}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bgColor">Background Color</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            id="bgColor"
                            type="color"
                            value={options.backgroundColor}
                            onChange={(e) => updateOption("backgroundColor", e.target.value)}
                            className="h-10 w-14 rounded-md border border-input cursor-pointer"
                          />
                          <span className="text-sm text-muted-foreground">
                            {options.backgroundColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Handwriting-style rendering of your text.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-auto rounded-md border bg-muted p-2">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full"
                      style={{ imageRendering: "auto" }}
                      aria-label="手書き風テキストのレンダリング結果"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleClear}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRegenerate}
                      disabled={!text.trim()}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                    </Button>
                    <Button type="button" onClick={handleCopyImage} disabled={!text.trim()}>
                      Copy Image
                    </Button>
                    <Button type="button" onClick={handleDownload} disabled={!text.trim()}>
                      <Download className="mr-2 h-4 w-4" /> Download PNG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>

      </div>
  </ToastToaster>;
}
