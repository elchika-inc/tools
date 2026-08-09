import { Copy, ScanText, Trash2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, type OcrLanguage, recognizeText } from "@/utils/ocr";
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>("eng");
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.add({
          title: "Invalid file type",
          description: "Please select an image file.",
          type: "error",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setResult("");
      setConfidence(null);
      setProgress(null);
    },
    [toast],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRecognize = useCallback(async () => {
    if (!imageFile) return;
    setIsProcessing(true);
    setProgress(0);
    setResult("");
    setConfidence(null);

    try {
      const ocrResult = await recognizeText(imageFile, language, (p) => {
        setProgress(p);
      });
      setResult(ocrResult.text);
      setConfidence(ocrResult.confidence);
      toast.add({ title: "Recognition completed" });
    } catch {
      toast.add({
        title: "Recognition failed",
        description: "An error occurred during text recognition.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [imageFile, language, toast]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result);
      toast.add({ title: "Copied to clipboard" });
    } catch {
      toast.add({ title: "Failed to copy", type: "error" });
    }
  }, [result, toast]);

  const clearAll = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setResult("");
    setConfidence(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">OCR - Image to Text</h1>
            <p className="text-muted-foreground">
              Extract text from images using optical character recognition.
            </p>
          </header>

          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Upload</CardTitle>
                <CardDescription>Upload or drag & drop an image to extract text.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  type="button"
                  className={`relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-md border-2 border-dashed transition-colors cursor-pointer bg-transparent ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-primary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    aria-label="画像ファイルを選択"
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="max-h-[400px] max-w-full object-contain rounded-md"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground p-8">
                      <Upload className="h-10 w-10" />
                      <p className="text-sm font-medium">Click or drag & drop an image here</p>
                      <p className="text-xs">Supports PNG, JPEG, BMP, TIFF, and more</p>
                    </div>
                  )}
                </button>

                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v as OcrLanguage)}>
                      <SelectTrigger id="language" className="w-[200px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    onClick={handleRecognize}
                    disabled={!imageFile || isProcessing}
                  >
                    <ScanText className="mr-2 h-4 w-4" />
                    {isProcessing ? "Recognizing..." : "Recognize Text"}
                  </Button>
                </div>

                {progress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Recognizing text...</span>
                      <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(result || confidence !== null) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Result</span>
                    {confidence !== null && (
                      <span className="text-sm font-normal text-muted-foreground">
                        Confidence: {confidence.toFixed(1)}%
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    readOnly
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring resize-none"
                    placeholder="Recognized text will appear here..."
                    value={result}
                    aria-label="認識されたテキスト結果"
                  />
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={clearAll}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button type="button" onClick={copyToClipboard} disabled={!result}>
                      <Copy className="mr-2 h-4 w-4" /> Copy Text
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>

      </div>
  </ToastToaster>;
}
