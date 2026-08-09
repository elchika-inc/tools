import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, Trash2 } from 'lucide-react';
import { convertToHtml } from '@/utils/rubyGenerator';
import { toast, ToastToaster } from "@/components/ui/toast";

export default function App() {
  const [input, setInput] = useState('');
  // convertToHtml escapes all user input via escapeHtml() before inserting into HTML tags,
  // so dangerouslySetInnerHTML is safe here - no raw user content is inserted unescaped.
  const htmlOutput = useMemo(() => convertToHtml(input), [input]);

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      toast.add({ title: 'HTML copied to clipboard' });
    } catch {
      toast.add({ title: 'Copy failed', type: "error" });
    }
  };

  const clearAll = () => {
    setInput('');
  };

  return <ToastToaster>
  <div className="min-h-screen bg-background p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <div className="mb-2">
              <a href="/" className="text-sm text-primary hover:underline">
                ← Tools トップに戻る
              </a>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Text Ruby Generator</h1>
            <p className="text-muted-foreground">
              Generate ruby (furigana) HTML from simple notation. Use {'{'}kanji|reading{'}'} format.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>
                Use {'{'}漢字|かんじ{'}'} to add ruby annotations. Example: この{'{'}漢字|かんじ{'}'}は{'{'}面白|おもしろ{'}'}い
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">Text with Ruby Notation</Label>
                <textarea
                  id="input"
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="この{漢字|かんじ}は{面白|おもしろ}い"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {input.trim().length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Live preview of ruby annotations</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Safe: convertToHtml escapes all user text via escapeHtml() */}
                  <div
                    className="text-lg leading-relaxed p-4 border rounded-md bg-background"
                    dangerouslySetInnerHTML={{ __html: htmlOutput }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated HTML</CardTitle>
                  <CardDescription>Copy this HTML to use in your document.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto whitespace-pre-wrap break-all">
                    {htmlOutput}
                  </pre>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={clearAll}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button type="button" onClick={copyHtml}>
                      <Copy className="mr-2 h-4 w-4" /> Copy HTML
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
        
      </div>
  </ToastToaster>;
}
